// ChatContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const navigate = useNavigate();

  // Initialize chat context and load user data
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate('/login');
          return;
        }

        // First, get user preferences
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Check if onboarding is completed
        if (!profile.onboarding_completed) {
          navigate('/onboarding');
          return;
        }

        setUserPreferences(profile.user_preferences);

        // Then get conversation history
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        if (conversationError && conversationError.code !== 'PGRST116') {
          console.error('Error fetching conversation:', conversationError);
        }

        if (conversation?.messages?.length > 0) {
          setMessages(conversation.messages);
          setCurrentSession(conversation.id);
        } else {
          // Create personalized welcome message based on preferences
          const { name, interests, language_preference } = profile.user_preferences.context;
          
          let welcomeMessage = '';
          switch(language_preference) {
            case 'hinglish':
              welcomeMessage = `Hey ${name}! 👋 Kya haal chaal? I remember you're interested in ${interests.join(', ')}! Kuch naya batao, what's happening? 😊`;
              break;
            case 'hindi':
              welcomeMessage = `नमस्ते ${name}! 👋 कैसे हो? मुझे याद है आप ${interests.join(', ')} में रुचि रखते हैं! कुछ नया सुनाओ! 😊`;
              break;
            default:
              welcomeMessage = `Hey ${name}! 👋 How's it going? I remember you're interested in ${interests.join(', ')}! What's new with you? 😊`;
          }

          setMessages([{
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          }]);
        }

      } catch (error) {
        console.error('Chat initialization error:', error);
        setError('Failed to initialize chat. Please refresh the page.');
      } finally {
        setInitialized(true);
      }
    };

    initializeChat();
  }, [navigate]);

  // Save messages to Supabase
  const saveMessages = useCallback(async (newMessages) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const conversationData = {
        user_id: session.user.id,
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
      setError('Failed to save messages. Please try again.');
    }
  }, [currentSession, navigate]);

  // Update messages with auto-save
  const updateMessages = useCallback(async (newMessages) => {
    setMessages(newMessages);
    await saveMessages(newMessages);
  }, [saveMessages]);

  // Add new message
  const addMessage = useCallback(async (message) => {
    const newMessages = [...messages, {
      ...message,
      timestamp: new Date().toISOString()
    }];
    await updateMessages(newMessages);
  }, [messages, updateMessages]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (currentSession) {
        await supabase
          .from('conversations')
          .delete()
          .eq('id', currentSession);
      }

      const welcomeMessage = {
        role: 'assistant',
        content: "Chat history cleared! How can I help you today?",
        timestamp: new Date().toISOString()
      };

      setMessages([welcomeMessage]);
      setCurrentSession(null);
      
    } catch (error) {
      console.error('Error clearing chat:', error);
      setError('Failed to clear chat history. Please try again.');
    }
  }, [currentSession]);

  // Update user preferences
  const updateUserPreferences = useCallback(async (newPreferences) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          user_preferences: {
            ...userPreferences,
            ...newPreferences
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setUserPreferences(prev => ({
        ...prev,
        ...newPreferences
      }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences. Please try again.');
    }
  }, [userPreferences]);

  const value = {
    messages,
    setMessages: updateMessages,
    loading,
    setLoading,
    error,
    setError,
    currentSession,
    setCurrentSession,
    initialized,
    userPreferences,
    updateUserPreferences,
    addMessage,
    clearChat
  };

  if (!initialized) {
    return (
      <div id="chat-loading">
        <div id="loading-spinner"></div>
        <p>Loading your chat...</p>
      </div>
    );
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;