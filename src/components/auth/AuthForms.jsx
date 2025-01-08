import { useState } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const AuthForms = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSignUp = async () => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        setMessage("Success! Please check your email to verify your account.");
        // Don't try to create profile here - let the database trigger handle it
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return true;
      }
    } catch (error) {
      console.error('SignUp error:', error);
      setError(error.message);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      navigate('/onboarding');
      return true;
    } catch (error) {
      console.error('SignIn error:', error);
      setError(error.message);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (formType === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await handleSignUp();
      } else {
        await handleLogin();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container">
      <div id="auth-form-box">
        <div id="auth-header">
          <h1 id="auth-title">FeelFreeGPT</h1>
          <p id="auth-subtitle">
            {formType === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>
  
        <form id="auth-form" onSubmit={handleAuth}>
          <div className="auth-fields">
            <div className="auth-field">
              <div className="input-icon">
                <Mail className="icon" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="auth-input"
                disabled={loading}
              />
            </div>
  
            <div className="auth-field">
              <div className="input-icon">
                <Lock className="icon" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="auth-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
              </button>
            </div>

            {formType === 'signup' && (
              <div className="auth-field">
                <div className="input-icon">
                  <Lock className="icon" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="auth-input"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}
  
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (formType === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
  
          <div className="auth-switch">
            <button
              type="button"
              onClick={() => {
                setFormType(formType === 'login' ? 'signup' : 'login');
                setError(null);
                setMessage(null);
              }}
              className="switch-button"
            >
              {formType === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;