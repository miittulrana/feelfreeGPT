import { model } from '../config/gemini';

export const generateAIResponse = async (messages, prompt) => {
  try {
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: msg.content
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Response Error:', error);
    throw new Error('Failed to generate AI response');
  }
};