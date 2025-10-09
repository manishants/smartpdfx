
'use server';

/**
 * @fileOverview An AI flow for analyzing and organizing WhatsApp chat exports.
 *
 * - organiseWhatsappChat - Analyzes a chat history and returns a structured summary.
 * - OrganiseWhatsappChatInput - The input type for the flow.
 * - OrganiseWhatsappChatOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  OrganiseWhatsappChatInputSchema,
  OrganiseWhatsappChatOutputSchema,
  type OrganiseWhatsappChatInput,
  type OrganiseWhatsappChatOutput,
} from '@/lib/types';

export async function organiseWhatsappChat(
  input: OrganiseWhatsappChatInput
): Promise<OrganiseWhatsappChatOutput> {
  return organiseWhatsappChatFlow(input);
}

const organiseWhatsappChatPrompt = ai.definePrompt({
  name: 'organiseWhatsappChatPrompt',
  input: { schema: z.object({ chatContent: z.string() }) },
  output: { schema: OrganiseWhatsappChatOutputSchema },
  prompt: `You are an expert chat analyst. Your task is to analyze the provided WhatsApp chat export and provide a structured summary.

Analyze the following chat content:
---
{{{chatContent}}}
---

Based on the content, provide the following:
1.  **summary**: A concise, neutral summary of the entire conversation.
2.  **participants**: A list of all unique participant names found in the chat.
3.  **keyTopics**: An array of the top 5 most discussed topics.
4.  **statistics**:
    *   **totalMessages**: The total number of messages.
    *   **messagesByParticipant**: An array of objects, where each object contains 'participant' (string) and 'messageCount' (number).
    *   **mediaSharedCount**: The total count of shared media items (look for patterns like '<image omitted>', '<video omitted>', '<audio omitted>', etc.).
    *   **mostActiveDay**: The date with the highest number of messages, in YYYY-MM-DD format.

Please provide the output in the specified JSON format.
`,
});

const organiseWhatsappChatFlow = ai.defineFlow(
  {
    name: 'organiseWhatsappChatFlow',
    inputSchema: OrganiseWhatsappChatInputSchema,
    outputSchema: OrganiseWhatsappChatOutputSchema,
  },
  async (input) => {
    const { chatContent } = input;
    
    const { output } = await organiseWhatsappChatPrompt({ chatContent });

    if (!output) {
      throw new Error('The AI failed to analyze the chat. The content might be in an unsupported format.');
    }
    return output;
  }
);

    
