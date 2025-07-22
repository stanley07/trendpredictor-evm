import { fetchTopHeadlines } from './fetchTopHeadlines';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeTrendsFromHeadlines(): Promise<{ headlines: string[]; analysis: string; blockchainSummary: string }> {
  const headlines = await fetchTopHeadlines();

  if (headlines.length === 0) {
    return { headlines: [], analysis: "No headlines to analyze.", blockchainSummary: "No headlines." };
  }

  const detailedPrompt = `Analyze the sentiment and potential market impact of the following news headlines. Provide a concise summary and a prediction (e.g., "bullish", "bearish", "neutral").\n\nHeadlines:\n${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nAnalysis and Prediction:`;

  const blockchainPrompt = `Provide a very concise, single-sentence summary of the overall trend from the following headlines, suitable for blockchain logging. Max 100 characters.\n\nHeadlines:\n${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nConcise Summary:`;

  try {
    const [detailedCompletion, blockchainCompletion] = await Promise.all([
      openai.chat.completions.create({
        messages: [{ role: 'user', content: detailedPrompt }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 200,
      }),
      openai.chat.completions.create({
        messages: [{ role: 'user', content: blockchainPrompt }],
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        max_tokens: 100,
      }),
    ]);

    const analysis = detailedCompletion.choices[0].message.content || "Analysis failed.";
    const blockchainSummary = blockchainCompletion.choices[0].message.content || "Summary failed.";

    return { headlines, analysis, blockchainSummary };
  } catch (error) {
    console.error('❌ Error analyzing trends with OpenAI:', error);
    return { headlines, analysis: `Failed to analyze trends: ${error instanceof Error ? error.message : String(error)}`, blockchainSummary: `Failed to summarize: ${error instanceof Error ? error.message : String(error)}` };
  }
}