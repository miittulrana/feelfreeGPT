// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabase';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';
import AuthForms from './components/auth/AuthForms';
import ChatInterface from './components/chat/ChatInterface';
import InitialQuestions from './components/onboarding/InitialQuestions';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user?.id) {
          await fetchProfile(initialSession.user.id);
        } else {
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          if (session?.user?.id) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth setup error:', error);
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="loading-container">
        <div id="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <ChatProvider>
        <Layout>
          <Routes>
            <Route
              path="/login"
              element={session ? <Navigate to="/" /> : <AuthForms />}
            />
            
            <Route
              path="/onboarding"
              element={
                !session ? <Navigate to="/login" /> :
                profile?.onboarding_completed ? <Navigate to="/" /> :
                <InitialQuestions />
              }
            />
            
            <Route
              path="/"
              element={
                !session ? <Navigate to="/login" /> :
                !profile?.onboarding_completed ? <Navigate to="/onboarding" /> :
                <ChatInterface />
              }
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </ChatProvider>
    </Router>
  );
}

export default App;