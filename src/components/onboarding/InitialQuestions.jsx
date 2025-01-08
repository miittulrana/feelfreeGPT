// InitialQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const InitialQuestions = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({
    name: '',
    age: '',
    work: '',
    interests: '',
    language_preference: '',
    favorite_topics: '',
    communication_style: '',
    hobbies: ''
  });

  const questions = [
    {
      key: 'name',
      question: "Hey! I'm excited to meet you! What's your name?",
      type: 'text',
      placeholder: "Tell me your name 😊",
      validation: (value) => value.length >= 2 ? null : "Please enter your name"
    },
    {
      key: 'age',
      question: (answers) => `Nice to meet you, ${answers.name}! How old are you?`,
      type: 'number',
      placeholder: "Your age",
      validation: (value) => value > 0 ? null : "Please enter a valid age"
    },
    {
      key: 'work',
      question: "What keeps you busy these days - studying, working, or something else?",
      type: 'text',
      placeholder: "E.g., College student, Software Engineer, Business owner...",
      validation: (value) => value.length >= 3 ? null : "Please tell me what you do"
    },
    {
      key: 'interests',
      question: (answers) => `What kind of things interest you, ${answers.name}? Could be anything!`,
      type: 'text',
      placeholder: "E.g., Technology, Movies, Sports, Music, Travel...",
      validation: (value) => value.length >= 3 ? null : "Please share some interests"
    },
    {
      key: 'favorite_topics',
      question: "What topics do you usually enjoy talking about with friends?",
      type: 'text',
      placeholder: "E.g., Life updates, Tech news, Movies, Sports...",
      validation: (value) => value.length >= 3 ? null : "Please share some topics"
    },
    {
      key: 'hobbies',
      question: "What do you like doing in your free time?",
      type: 'text',
      placeholder: "E.g., Gaming, Reading, Cooking, Working out...",
      validation: (value) => value.length >= 3 ? null : "Please share some hobbies"
    },
    {
      key: 'communication_style',
      question: "How do you prefer chatting? Casual, formal, or mix of both?",
      type: 'select',
      options: [
        { value: 'casual', label: 'Casual and friendly' },
        { value: 'formal', label: 'Formal and professional' },
        { value: 'mixed', label: 'Mix of both' }
      ],
      validation: (value) => value ? null : "Please select your preferred style"
    },
    {
      key: 'language_preference',
      question: "Last thing - what language would you be most comfortable chatting in?",
      type: 'select',
      options: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'hinglish', label: 'Hinglish (Mix of Hindi & English)' }
      ],
      validation: (value) => value ? null : "Please select your preferred language"
    }
  ];

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login');
      }
    };

    getCurrentUser();
  }, [navigate]);

  const handleInput = (value) => {
    const currentQuestion = questions[step];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const getQuestionText = (question) => {
    return typeof question.question === 'function' 
      ? question.question(answers) 
      : question.question;
  };

  const validateCurrentAnswer = () => {
    const currentQuestion = questions[step];
    const currentAnswer = answers[currentQuestion.key];
    return currentQuestion.validation ? currentQuestion.validation(currentAnswer) : null;
  };

  const processUserPreferences = () => {
    return {
      ...answers,
      personality_traits: {
        casual_talk: answers.communication_style === 'casual',
        likes_humor: true,
        prefers_emotional_support: true
      },
      communication_style: {
        language_mixing: answers.language_preference === 'hinglish',
        casual_tone: answers.communication_style === 'casual',
        emoji_usage: true
      },
      interests_detailed: {
        main_interests: answers.interests.split(',').map(i => i.trim()),
        hobbies: answers.hobbies.split(',').map(h => h.trim()),
        favorite_topics: answers.favorite_topics.split(',').map(t => t.trim())
      },
      context: {
        occupation: answers.work,
        age_group: getAgeGroup(answers.age)
      }
    };
  };

  const getAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum < 18) return 'teen';
    if (ageNum < 25) return 'young_adult';
    if (ageNum < 35) return 'adult';
    return 'mature_adult';
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('No user ID found');
      }

      const enhancedPreferences = processUserPreferences();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: answers.name,
          user_preferences: enhancedPreferences,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      navigate('/chat');
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save preferences. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    const validationError = validateCurrentAnswer();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    if (step === questions.length - 1) {
      savePreferences();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const currentQuestion = questions[step];

  const renderInput = () => {
    if (currentQuestion.type === 'select' && currentQuestion.options) {
      return (
        <select
          value={answers[currentQuestion.key] || ''}
          onChange={(e) => handleInput(e.target.value)}
          className="onboarding-input"
          disabled={loading}
        >
          <option value="">Select an option</option>
          {currentQuestion.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={currentQuestion.type}
        value={answers[currentQuestion.key] || ''}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={currentQuestion.placeholder}
        className="onboarding-input"
        disabled={loading}
      />
    );
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <h2 className="onboarding-title">
          {getQuestionText(currentQuestion)}
        </h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {renderInput()}

        <button
          onClick={handleNext}
          disabled={!answers[currentQuestion.key] || loading}
          className="onboarding-button"
        >
          {loading 
            ? 'Please wait...' 
            : (step === questions.length - 1 
              ? "Let's Start Chatting! 🎉" 
              : "Next →")}
        </button>

        <div className="progress-dots">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InitialQuestions;