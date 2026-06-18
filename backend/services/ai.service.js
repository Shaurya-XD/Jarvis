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
          Always format code inside Markdown fenced code blocks and include the correct language identifier.

          Examples:

          <example>

          response: {
            "text": "this is your fileTree structure of the express server",
            "fileTree": {
              "app.js": {
                "file": {
                  "contents": "
          const express = require('express');

          const app = express();

          app.get('/', (req, res) => {
            res.send('Hello World!');
          });

          app.listen(3000, () => {
            console.log('Server is running on port 3000');
          });
          "
                }
              },

              "package.json": {
                "file": {
                  "contents": "
          {
            \\"name\\": \\"temp-server\\",
            \\"version\\": \\"1.0.0\\",
            \\"main\\": \\"index.js\\",
            \\"scripts\\": {
              \\"test\\": \\"echo \\\\\\"Error: no test specified\\\\\\" && exit 1\\"
            },
            \\"keywords\\": [],
            \\"author\\": \\"\\",
            \\"license\\": \\"ISC\\",
            \\"description\\": \\"\\",
            \\"dependencies\\": {
              \\"express\\": \\"^4.21.2\\"
            }
          }
          "
                }
              }
            },

            "buildCommand": {
              "mainItem": "npm",
              "commands": ["install"]
            },

            "startCommand": {
              "mainItem": "node",
              "commands": ["app.js"]
            }
          }

          user: Create an express application

          </example>

          <example>

          user: Hello

          response: {
            "text": "Hello, How can I help you today?"
          }

          </example>

          IMPORTANT:
          - Don't use file names like routes/index.js.
          - Always return valid JSON.
          - For code files, include the code inside the "contents" field.
          - Escape all newlines inside strings.
          - Do not use markdown code fences.
          `,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Error:', error.message);
    throw error;
  }
};

// You are an expert MERN Stack developer with 10 years of experience.
//           - Write modular, scalable, and maintainable code.
//           - Follow industry best practices.
//           - Use meaningful comments where necessary.
//           - Create files and folder structures when needed.
//           - Preserve existing functionality when modifying code.
//           - Handle edge cases, errors, and exceptions.
//           - Prioritize readability and performance.
//           - Explain architectural decisions when appropriate.