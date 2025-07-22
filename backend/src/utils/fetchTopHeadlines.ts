import axios from 'axios';

interface HeadlineItem {
  title: string;
  url: string;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY!;
const NYT_API_KEY = process.env.NYT_API_KEY!;

async function fetchFromNewsAPI(): Promise<HeadlineItem[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY is not set. Skipping NewsAPI.');
    return [];
  }
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines`,
      {
        params: {
          country: 'us',
          pageSize: 15, // Request more from here
          apiKey: NEWS_API_KEY,
        },
      }
    );
    return response.data.articles.map((article: any) => ({ title: article.title, url: article.url }));
  } catch (error) {
    console.error('❌ Error fetching from NewsAPI:', error instanceof Error ? error.message : error);
    return [];
  }
}

async function fetchFromGNewsAPI(): Promise<HeadlineItem[]> {
  if (!GNEWS_API_KEY) {
    console.warn('GNEWS_API_KEY is not set. Skipping GNewsAPI.');
    return [];
  }
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/top-headlines`,
      {
        params: {
          lang: 'en',
          max: 15, // Request more from here
          token: GNEWS_API_KEY,
        },
      }
    );
    return response.data.articles.map((article: any) => ({ title: article.title, url: article.url }));
  } catch (error) {
    console.error('❌ Error fetching from GNewsAPI:', error instanceof Error ? error.message : error);
    return [];
  }
}

async function fetchFromNYTAPI(): Promise<HeadlineItem[]> {
  if (!NYT_API_KEY) {
    console.warn('NYT_API_KEY is not set. Skipping NYT API.');
    return [];
  }
  try {
    const response = await axios.get(
      `https://api.nytimes.com/svc/topstories/v2/home.json`,
      {
        params: {
          'api-key': NYT_API_KEY,
        },
      }
    );
    return response.data.results.map((article: any) => ({ title: article.title, url: article.url }));
  } catch (error) {
    console.error('❌ Error fetching from NYT API:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function fetchTopHeadlines(): Promise<HeadlineItem[]> {
  const [newsApiHeadlines, gnewsHeadlines, nytHeadlines] = await Promise.all([
    fetchFromNewsAPI(),
    fetchFromGNewsAPI(),
    fetchFromNYTAPI(),
  ]);

  const allHeadlines = [...newsApiHeadlines, ...gnewsHeadlines, ...nytHeadlines];

  // Remove duplicates based on title and shuffle for variety
  const uniqueHeadlinesMap = new Map<string, HeadlineItem>();
  allHeadlines.forEach(item => {
    uniqueHeadlinesMap.set(item.title, item);
  });

  const uniqueHeadlines = Array.from(uniqueHeadlinesMap.values());

  // Shuffle and take up to 20 headlines
  return uniqueHeadlines.sort(() => 0.5 - Math.random()).slice(0, 20);
}
