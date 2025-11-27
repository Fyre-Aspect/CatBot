import { GoogleGenAI } from '@google/genai';
import type { Message } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const sendMessageToGemini = async (
  message: string,
  history: Message[] = [],
  systemPrompt: string = ''
) => {
  try {
    // Format history for Gemini
    // Gemini requires: 1) history starts with 'user', 2) alternating user/model roles
    let validHistory = history.filter((msg) => msg.content && msg.content.trim());
    
    // Ensure history starts with a user message
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
      validHistory = validHistory.slice(1);
    }

    // Ensure alternating pattern by removing consecutive same-role messages
    const cleanedHistory: Message[] = [];
    for (const msg of validHistory) {
      const lastMsg = cleanedHistory[cleanedHistory.length - 1];
      if (!lastMsg || lastMsg.role !== msg.role) {
        cleanedHistory.push(msg);
      }
    }

    const formattedHistory = cleanedHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : ('model' as const),
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const stream = await chat.sendMessageStream({ message });
    return stream;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
