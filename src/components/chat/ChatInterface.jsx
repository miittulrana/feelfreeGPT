import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { model } from '../../config/gemini';
import { AI_PERSONA } from '../../config/aiPersona';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';

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
    userPreferences
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!userPreferences) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile?.user_preferences) {
            const aiPersona = AI_PERSONA(profile.user_preferences);
            chatRef.current = model.startChat({
              history: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: msg.content,
              })),
              generationConfig: {
                temperature: aiPersona.temperature,
                topK: aiPersona.topK,
                topP: aiPersona.topP,
                maxOutputTokens: aiPersona.maxOutputTokens,
              },
            });
          }
        } else {
          const aiPersona = AI_PERSONA(userPreferences);
          chatRef.current = model.startChat({
            history: messages.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: msg.content,
            })),
            generationConfig: {
              temperature: aiPersona.temperature,
              topK: aiPersona.topK,
              topP: aiPersona.topP,
              maxOutputTokens: aiPersona.maxOutputTokens,
            },
          });
        }

        inputRef.current?.focus();
      } catch (error) {
        console.error('Chat initialization error:', error);
        setError('Failed to initialize chat. Please refresh the page.');
      }
    };

    initChat();
  }, [userPreferences, messages, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    try {
      setLoading(true);
      setError(null);
      setInput('');

      const userMessage = {
        role: 'user',
        content: trimmedInput,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, Math.min(trimmedInput.length * 20, 2000)));

      if (!chatRef.current) {
        throw new Error('Chat not initialized');
      }

      const aiPersona = AI_PERSONA(userPreferences || {});
      const prompt = `${aiPersona.prompt}\n\nUser message: ${trimmedInput}\n\nRespond naturally as a friend:`;
      
      const result = await chatRef.current.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString()
      };

      setMessages([...updatedMessages, aiMessage]);

    } catch (error) {
      console.error('Chat Error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
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
    <div id="chat-container">
      <div id="chat-box">
        <div id="chat-layout">
          <div id="messages-container">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.timestamp}-${index}`}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
            
            {isTyping && (
              <div id="typing-indicator">
                <div id="typing-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
            
            {error && (
              <div id="error-message">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} id="chat-form">
            <div id="input-container">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                id="chat-input"
                rows={1}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                id="send-button"
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