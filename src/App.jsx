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
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const clearExistingSessions = async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
      } catch (error) {
        console.error('Error clearing sessions:', error);
      }
    };

    clearExistingSessions();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth event:', event);
      setSession(currentSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.id) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
          });
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          setProfile(data);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
              element={
                session ? <Navigate to="/" replace /> : <AuthForms />
              }
            />
            
            <Route
              path="/onboarding"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : (
                  <InitialQuestions />
                )
              }
            />
            
            <Route
              path="/"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : !profile?.preferences ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <ChatInterface />
                )
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ChatProvider>
    </Router>
  );
}

export default App;