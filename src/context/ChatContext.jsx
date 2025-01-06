import { createContext, useContext, useState } from 'react';

const initialMessages = [{
  role: 'assistant',
  content: "Hey! 👋 Kaise ho? Tell me about your day!",
  timestamp: new Date().toISOString()
}];

const ChatContext = createContext(null);

// Changed export syntax to fix HMR issue
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Changed export syntax to fix HMR issue
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};