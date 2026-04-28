import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = env.openAIApiKey ? new OpenAI({ apiKey: env.openAIApiKey }) : null;

export async function generateAIReply({ mode = 'sales', language = 'en', conversationContext, userMessage }) {
  if (!openai) {
    return 'AI is not configured yet. Please connect OPENAI_API_KEY.';
  }

  const systemPrompt = `You are a ${mode} assistant for a SaaS automation company.
Goals:
1) capture lead details (name + phone)
2) explain service plans
3) move user to payment via UPI link
Tone: persuasive, concise, multilingual (${language}).`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.6,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationContext,
      { role: 'user', content: userMessage }
    ]
  });

  return completion.choices[0]?.message?.content || 'Could you share more details?';
}
