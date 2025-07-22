// backend/src/utils/fetchGNews.ts
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function fetchGNewsHeadlines(): Promise<string[]> {
  try {
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        country: 'us',
        max: 10,
        token: process.env.GNEWS_API_KEY,
      },
    });

    const articles = response.data.articles;
    console.log('✅ GNews fetched:', articles.length);

    return articles.map(
      (article: any) =>
        `${article.title} ${article.url} - ${article.source.name} - Source: GNews`
    );
  } catch (error: any) {
    console.error('❌ GNews API error:', error.response?.data || error.message);
    return [];
  }
}
