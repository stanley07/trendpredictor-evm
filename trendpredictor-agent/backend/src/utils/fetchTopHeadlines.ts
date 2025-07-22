// src/utils/fetchNews.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY!; // Add this to your .env file

export async function fetchTopHeadlines(): Promise<string[]> {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines`,
      {
        params: {
          country: 'us',
          pageSize: 10,
          apiKey: NEWS_API_KEY,
        },
      }
    );

    const articles = response.data.articles;
    return articles.map((article: any) => article.title);
  } catch (error) {
    console.error('❌ Error fetching news headlines:', error);
    return [];
  }
}
