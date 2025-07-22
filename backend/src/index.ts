import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import path from 'path'; // Import path module
import { fetchTopHeadlines } from './utils/fetchTopHeadlines';
import { analyzeTrendsFromHeadlines } from './utils/analyzeTrends';
import { logInsight } from './utils/logInsight';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS!;
console.log("DEBUG: Backend CONTRACT_ADDRESS:", CONTRACT_ADDRESS);

// ABI of your TrendPredictor contract (truncated for brevity, full ABI is in TrendPredictor.json)
const CONTRACT_ABI = JSON.parse(process.env.CONTRACT_ABI || '[]');

interface TrendLog {
  summary: string;
  transactionHash: string;
}

const recentTrends: TrendLog[] = [];
const MAX_RECENT_TRENDS = 10;

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Initialize ethers provider and contract
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const trendPredictorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

app.get('/status', (_req, res) => {
  res.json({ status: 'ok', message: 'TrendPredictor Agent (EVM) is live!' });
});

app.get('/trends', async (_req, res) => {
  try {
    const { headlines, analysis, blockchainSummary } = await analyzeTrendsFromHeadlines();
    const txHash = await logInsight(trendPredictorContract, blockchainSummary);

    // Store recent trend
    recentTrends.unshift({ summary: blockchainSummary, transactionHash: txHash });
    if (recentTrends.length > MAX_RECENT_TRENDS) {
      recentTrends.pop();
    }

    res.json({
      timestamp: new Date().toISOString(),
      headlines: headlines.map(item => ({ title: item.title, url: item.url })),
      analysis,
    });
  } catch (error) {
    console.error('Error generating trend report:', error);
    res.status(500).json({ error: 'Failed to analyze trends' });
  }
});

// New endpoint to get recent trends
app.get('/recent-trends', (_req, res) => {
  res.json(recentTrends);
});

// New endpoint to get latest trend summary
app.get('/latest-trend', (_req, res) => {
  if (recentTrends.length > 0) {
    res.json({ summary: recentTrends[0].summary, transactionHash: recentTrends[0].transactionHash });
  } else {
    res.json({ summary: "No recent trends yet.", transactionHash: null });
  }
});

// New endpoint to log analysis to the EVM contract
app.post('/log-analysis', async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary) {
      return res.status(400).json({ error: 'Summary is required' });
    }

    console.log(`Logging analysis: "${summary}" to EVM contract...`);
    const tx = await trendPredictorContract.logAnalysis(summary);
    const receipt = await tx.wait(); // Wait for the transaction to be mined
    console.log(`Transaction successful: ${receipt.hash}`);

    // Store recent trend from manual log
    recentTrends.unshift({ summary, transactionHash: receipt.hash });
    if (recentTrends.length > MAX_RECENT_TRENDS) {
      recentTrends.pop();
    }

    res.status(200).json({ message: 'Analysis logged successfully on EVM', transactionHash: receipt.hash });
  } catch (error: any) {
    console.error('Error logging analysis to EVM contract:', error);
    res.status(500).json({ error: 'Failed to log analysis on EVM', details: error.message });
  }
});

// New endpoint to get analysis from the EVM contract
app.get('/get-analysis/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid analysis ID' });
    }

    console.log(`Fetching analysis with ID: ${id} from EVM contract...`);
    const analysis = await trendPredictorContract.getAnalysis(id);

    res.status(200).json({
      id: analysis.id.toString(), // Convert BigInt to string for JSON
      timestamp: analysis.timestamp.toString(),
      summary: analysis.summary,
      postedBy: analysis.postedBy,
    });
  } catch (error: any) {
    console.error('Error fetching analysis from EVM contract:', error);
    res.status(500).json({ error: 'Failed to fetch analysis from EVM', details: error.message });
  }
});

// Catch-all to serve React app for any other requests
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 TrendPredictor Agent (EVM) running on port ${port}`);

  // Schedule automated trend analysis and logging
  const AUTOMATION_INTERVAL_MINUTES = parseInt(process.env.AUTOMATION_INTERVAL_MINUTES || '60'); // Default to 60 minutes
  console.log(`

Scheduled automated trend analysis and logging every ${AUTOMATION_INTERVAL_MINUTES} minutes.`);

  setInterval(async () => {
    console.log(`
--- Running automated trend analysis and logging ---`);
    try {
      const { headlines, analysis, blockchainSummary } = await analyzeTrendsFromHeadlines();
      const txHash = await logInsight(trendPredictorContract, blockchainSummary);

      // Store recent trend
      recentTrends.unshift({ summary: blockchainSummary, transactionHash: txHash });
      if (recentTrends.length > MAX_RECENT_TRENDS) {
        recentTrends.pop();
      }

      console.log('--- Automated trend analysis and logging complete ---');
    } catch (error) {
      console.error('❌ Error during automated trend analysis and logging:', error);
    }
  }, AUTOMATION_INTERVAL_MINUTES * 60 * 1000);
});