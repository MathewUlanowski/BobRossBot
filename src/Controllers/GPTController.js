import OpenAI from 'openai';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export async function generateResponse(prompt) {
  try {
    let response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `respond jokingly like bob ross to this: ${prompt}` }],
      model: 'gpt-3.5-turbo',
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
