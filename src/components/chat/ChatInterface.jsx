import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { model } from '../../config/gemini';
import { AI_PERSONA, EXPRESSIONS } from '../../config/aiPersona';
import MessageBubble from './MessageBubble';
import { useChat } from '../../context/ChatContext';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  
  const { 
    messages, 
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    currentSession,
    setCurrentSession
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setupChat = async () => {
      await initializeChat();
      await loadMessages();
      inputRef.current?.focus();
    };
    
    setupChat();
    
    return () => {
      chatRef.current = null;
    };
  }, []);

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      chatRef.current = model.startChat({
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Set initial persona and context
      const contextPrompt = `${AI_PERSONA}

User Profile:
Name: ${profile?.preferences?.name || 'friend'}
Gender: ${profile?.preferences?.gender || 'unspecified'}
Age Group: ${profile?.preferences?.age || 'young'}
Current Mood: ${profile?.preferences?.feeling || 'neutral'}

IMPORTANT INSTRUCTIONS:
1. Always maintain Hinglish conversation style
2. Keep responses short and natural
3. Show genuine care and understanding
4. Use casual, friendly language
5. Respond like a real Indian friend texting

Start with a warm, natural greeting in Hinglish style!`;

      const result = await chatRef.current.sendMessage(contextPrompt);
      await result.response;

      // Set initial greeting if no messages
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Arey yaar! Finally mil gaye! Batao kya chal raha hai life mein? 🤗",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Chat initialization error:', error);
      setError('Connection issue! Please refresh karo...');
    }
  };

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.messages?.length) {
        setMessages(data.messages);
        setCurrentSession(data.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async (newMessages) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const conversationData = {
        user_id: user.id,
        messages: newMessages,
        last_updated: new Date().toISOString()
      };

      if (currentSession) {
        conversationData.id = currentSession;
      }

      const { error } = await supabase
        .from('conversations')
        .upsert(conversationData);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const simulateTyping = async (messageLength) => {
    setIsTyping(true);
    // Calculate typing duration based on message length
    const baseDelay = 1000;
    const charDelay = 25;
    const randomVariation = Math.random() * 1000;
    const typingDuration = baseDelay + (messageLength * charDelay) + randomVariation;
    await new Promise(resolve => setTimeout(resolve, Math.min(typingDuration, 4000)));
    setIsTyping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString()
    };

    try {
      setLoading(true);
      setError(null);
      setInput('');
      inputRef.current?.focus();
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      if (!chatRef.current) {
        await initializeChat();
      }

      await simulateTyping(trimmedInput.length);

      const result = await chatRef.current.sendMessage(trimmedInput);
      const response = await result.response;
      const text = response.text();

      const aiMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages);

    } catch (error) {
      console.error('Chat Error:', error);
      setError('Oops! Kuch problem ho gaya. Try again?');
      await initializeChat();
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-[80vh] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.timestamp}-${index}`}
                message={message}
                isUser={message.role === 'user'}
                previousMessage={messages[index - 1]}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50">
            <div className="flex space-x-4 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
                style={{
                  minHeight: '48px',
                  maxHeight: '150px'
                }}
                rows={1}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all
                         focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;