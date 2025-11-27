import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const sendMessageToGemini = async (message, history = [], files = [], systemPrompt = "") => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      systemInstruction: systemPrompt 
    });

    // Format history for Gemini
    // Note: Gemini expects history to be strictly alternating user/model
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const parts = [{ text: message }];
    
    // Add images/files to the current message
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Ensure base64 string doesn't have the data URL prefix
        const base64Data = file.base64.includes(',') 
          ? file.base64.split(',')[1] 
          : file.base64;
          
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      } else if (file.content) {
         // For text-based files (PDF parsed text, TXT, etc.), append to message
         // We append it to the text part
         parts[0].text += `\n\n--- Attachment: ${file.name} ---\n${file.content}\n--- End Attachment ---\n`;
      }
    }

    const result = await chat.sendMessageStream(parts);
    return result.stream;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
