// src/utils/auth.js
import { supabase } from '../config/supabase';

/**
 * Get the current user's profile
 */
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

/**
 * Update user profile with error handling
 */
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Sign out user and clear local data
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any stored data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if user's email is verified
 */
export const isEmailVerified = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email_confirmed_at ? true : false;
  } catch {
    return false;
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending verification:', error);
    throw error;
  }
};

/**
 * Check if there's a valid session
 */
export const checkAuthSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * User-friendly error message handling
 */
export const getAuthErrorMessage = (error) => {
  const errorMessages = {
    'Invalid login credentials': 'Incorrect email or password',
    'Email not confirmed': 'Please verify your email first',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long',
    'User already registered': 'An account already exists with this email',
    'Rate limit exceeded': 'Too many attempts. Please try again later',
    'Email rate limit exceeded': 'Too many email attempts. Please try again later',
    'Network request failed': 'Connection error. Please check your internet',
    'Server error': 'Server error. Please try again later'
  };

  return errorMessages[error] || 'An error occurred. Please try again.';
};

/**
 * Initialize auth state listener
 */
export const initAuthStateListener = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription?.unsubscribe();
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const results = {
    isValid: false,
    score: 0,
    requirements: {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }
  };

  results.score = Object.values(results.requirements).filter(Boolean).length;
  results.isValid = results.score >= 3 && results.requirements.length;

  return results;
};