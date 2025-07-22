import express from 'express';
import cors from 'cors';
import { fetchTopHeadlines } from './utils/fetchTopHeadlines';
import { analyzeTrendsFromHeadlines } from './utils/analyzeTrends';
import { logInsight } from './utils/logInsight';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/status', (_req, res) => {
  res.json({ status: 'ok', message: 'TrendPredictor Agent is live!' });
});

app.get('/trends', async (_req, res) => {
  try {
    const { headlines, analysis } = await analyzeTrendsFromHeadlines();
    await logInsight(analysis);

    res.json({
      timestamp: new Date().toISOString(),
      headlines,
      analysis,
    });
  } catch (error) {
    console.error('Error generating trend report:', error);
    res.status(500).json({ error: 'Failed to analyze trends' });
  }
});

app.listen(port, () => {
  console.log(`🚀 TrendPredictor Agent running on port ${port}`);
});
