// src/utils/fetchAllHeadlines.ts
import { fetchTopHeadlines } from './fetchTopHeadlines';
import { fetchGNewsHeadlines } from './fetchGNews';
import { fetchNYTHeadlines } from './fetchNYTimes';

export async function fetchAllHeadlines(): Promise<string[]> {
  try {
    const [newsapi, gnews, nytimes] = await Promise.all([
      fetchTopHeadlines(),
      fetchGNewsHeadlines(),
      fetchNYTHeadlines(),
    ]);

    return [...newsapi, ...gnews, ...nytimes].filter(Boolean);
  } catch (error) {
    console.error('❌ Error fetching all headlines:', error);
    return [];
  }
}
