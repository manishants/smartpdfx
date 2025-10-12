
'use server';

/**
 * @fileOverview An AI flow for providing feedback on a user's resume.
 *
 * - resumeAssistant - Analyzes resume text and provides structured feedback.
 * - ResumeAssistantInput - The input type for the flow.
 * - ResumeAssistantOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ResumeAssistantInputSchema,
  ResumeAssistantOutputSchema,
  type ResumeAssistantInput,
  type ResumeAssistantOutput,
} from '@/lib/types';

export async function resumeAssistant(
  input: ResumeAssistantInput
): Promise<ResumeAssistantOutput> {
  return resumeAssistantFlow(input);
}

const resumeAssistantPrompt = ai.definePrompt({
  name: 'resumeAssistantPrompt',
  input: { schema: ResumeAssistantInputSchema },
  output: { schema: ResumeAssistantOutputSchema },
  prompt: `You are a world-class career coach and resume expert. Your task is to analyze the provided resume text and give clear, constructive, and encouraging feedback.

The user has provided the following resume text:
---
{{{resumeText}}}
---

Please perform the following analysis:
1.  **Overall Score**: Provide a score from 0 to 100 that reflects the resume's overall quality, considering clarity, impact, formatting, and content.
2.  **Overall Impression**: Write a brief, one-paragraph summary of your first impression. Be encouraging but honest.
3.  **Detailed Feedback**: Provide detailed feedback in Markdown format. This section must include:
    *   A heading '### Strengths' followed by a bulleted list of what the resume does well.
    *   A heading '### Areas for Improvement' followed by a bulleted list of specific, actionable suggestions for improvement. Focus on things like using stronger action verbs, quantifying achievements, improving readability, and tailoring the content to a specific job.

Your entire output must be in the specified JSON format.
`,
});

const resumeAssistantFlow = ai.defineFlow(
  {
    name: 'resumeAssistantFlow',
    inputSchema: ResumeAssistantInputSchema,
    outputSchema: ResumeAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await resumeAssistantPrompt(input);

    if (!output) {
      throw new Error('The AI failed to generate feedback for the resume.');
    }
    
    return output;
  }
);
