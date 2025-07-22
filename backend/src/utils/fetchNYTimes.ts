// backend/src/utils/fetchNYTimes.ts
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchNYTHeadlines(): Promise<string[]> {
  try {
    const response = await axios.get('https://api.nytimes.com/svc/topstories/v2/home.json', {
      params: {
        'api-key': process.env.NYT_API_KEY,
      },
    });

    const results = response.data.results;
    console.log('✅ NYT fetched:', results.length);

    return results.slice(0, 10).map(
      (article: any) =>
        `${article.title} ${article.url} - ${article.section} - Source: NYT`
    );
  } catch (error: any) {
    console.error('❌ Error fetching NYT headlines:', error.response?.data || error.message);
    return [];
  }
}
