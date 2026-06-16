import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

export const generateResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `
          You are an expert MERN Stack developer with 10 years of experience.

          - Write modular, scalable, and maintainable code.
          - Follow industry best practices.
          - Use meaningful comments where necessary.
          - Create files and folder structures when needed.
          - Preserve existing functionality when modifying code.
          - Handle edge cases, errors, and exceptions.
          - Prioritize readability and performance.
          - Explain architectural decisions when appropriate.
        `,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
};

const result = await generateResponse('Give your one line introduction');
console.log(result);