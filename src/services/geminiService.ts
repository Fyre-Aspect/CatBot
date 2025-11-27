import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const sendMessageToGemini = async (
  message: string,
  history: Message[] = [],
  systemPrompt: string = ''
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: systemPrompt,
    });

    // Format history for Gemini
    // Note: Gemini expects history to be strictly alternating user/model
    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : ('model' as const),
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream(message);
    return result.stream;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
