import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const InitialQuestions = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: '',
    age: '',
    gender: '',
    personality_type: '',
    communication_style: '',
    feeling: '',
    support_needed: ''
  });

  useEffect(() => {
    // Check if user exists and redirect if no auth
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const questions = [
    {
      key: 'name',
      question: "What's your name?",
      placeholder: "Enter your name"
    },
    {
      key: 'age',
      question: "What's your age?",
      placeholder: "Enter your age",
      type: "number"
    },
    {
      key: 'gender',
      question: "How do you identify yourself?",
      type: "select",
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'personality_type',
      question: "How would you describe yourself?",
      type: "select",
      options: [
        { value: 'outgoing', label: 'Outgoing and Social' },
        { value: 'reserved', label: 'Reserved and Thoughtful' },
        { value: 'balanced', label: 'Balanced Mix' }
      ]
    },
    {
      key: 'communication_style',
      question: "What's your preferred way of chatting?",
      type: "select",
      options: [
        { value: 'english', label: 'Mostly English' },
        { value: 'hinglish', label: 'Hinglish Mix' },
        { value: 'hindi', label: 'Hindi with some English' }
      ]
    },
    {
      key: 'feeling',
      question: "How are you feeling right now?",
      placeholder: "Happy, Stressed, Confused, etc."
    },
    {
      key: 'support_needed',
      question: "What brings you here today?",
      placeholder: "Share what's on your mind..."
    }
  ];

  const handleInput = (e) => {
    setAnswers({
      ...answers,
      [questions[step].key]: e.target.value
    });
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Update profile with all answers and preferences
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: answers.name,
            preferences: answers,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        navigate('/chat');
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving your preferences. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">
          {questions[step].question}
        </h3>
        {questions[step].type === 'select' ? (
          <select
            value={answers[questions[step].key]}
            onChange={handleInput}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select an option</option>
            {questions[step].options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={questions[step].type || 'text'}
            value={answers[questions[step].key]}
            onChange={handleInput}
            placeholder={questions[step].placeholder}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!answers[questions[step].key]}
        className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {step < questions.length - 1 ? 'Next' : 'Start Chatting'}
      </button>

      {/* Progress indicator */}
      <div className="mt-6 flex justify-center space-x-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              index === step
                ? 'bg-blue-600'
                : index < step
                ? 'bg-blue-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default InitialQuestions;