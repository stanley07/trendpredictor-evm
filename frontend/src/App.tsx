import React, { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import { ethers } from 'ethers';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// ABI of your TrendPredictor contract (truncated for brevity, full ABI is in TrendPredictor.json)
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "summary",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "postedBy",
        "type": "address"
      }
    ],
    "name": "AnalysisLogged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "analyses",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "summary",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "postedBy",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getAnalysis",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "summary",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "postedBy",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_summary",
        "type": "string"
      }
    ],
    "name": "logAnalysis",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

function App() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string>('');
  const [fetchedAnalysis, setFetchedAnalysis] = useState<any>(null);
  const [analysisId, setAnalysisId] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [headlines, setHeadlines] = useState<Array<{ title: string; url: string }>>([]);

  const [latestTrendSummary, setLatestTrendSummary] = useState<string>('Fetching latest trend...');
  const [pastTrendsDisplay, setPastTrendsDisplay] = useState<Array<{ summary: string; transactionHash: string }>>([]);

  useEffect(() => {
    checkIfWalletIsConnected();
    fetchHeadlines();
    fetchLatestTrendSummary(); // Fetch latest trend summary on mount
  }, []);

  const fetchLatestTrendSummary = async () => {
    try {
      const response = await fetch('http://localhost:3001/latest-trend');
      const data = await response.json();
      if (response.ok) {
        setLatestTrendSummary(data.summary);
      } else {
        console.error('Failed to fetch latest trend summary:', data.error);
        setLatestTrendSummary('Error fetching latest trend.');
      }
    } catch (error) {
      console.error('Error fetching latest trend summary:', error);
      setLatestTrendSummary('Error fetching latest trend.');
    }
  };

  const fetchPastTrends = async () => {
    try {
      const response = await fetch('http://localhost:3001/past-trends');
      const data = await response.json();
      if (response.ok) {
        setPastTrendsDisplay(data);
      } else {
        console.error('Failed to fetch past trends:', data.error);
      }
    } catch (error) {
      console.error('Error fetching past trends:', error);
    }
  };

  const fetchHeadlines = async () => {
    try {
      const response = await fetch('http://localhost:3001/trends');
      const data = await response.json();
      if (response.ok) {
        setHeadlines(data.headlines);
      } else {
        console.error('Failed to fetch headlines:', data.error);
      }
    } catch (error) {
      console.error('Error fetching headlines:', error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" }) as string[];
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        setupContract(ethereum);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupContract(ethereum);
    } catch (error) {
      console.log(error);
    }
  };

  const setupContract = async (ethereum: ethers.Eip1193Provider) => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const trendPredictorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(trendPredictorContract);
  };

  const handleLogAnalysis = async () => {
    if (!contract || !analysisSummary) {
      setError("Please connect wallet and enter analysis summary.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tx = await contract.logAnalysis(analysisSummary);
      await tx.wait();
      alert("Analysis logged successfully!");
      setAnalysisSummary('');
    } catch (e: any) {
      console.error("Error logging analysis:", e);
      setError(e.message || "Failed to log analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnalysis = async (id: string) => {
    if (!contract || !id) {
      setError("Please connect wallet and enter analysis ID.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) {
        setError("Invalid Analysis ID. Please enter a number.");
        setLoading(false);
        return;
      }
      const analysis = await contract.getAnalysis(parsedId);
      setFetchedAnalysis({
        id: analysis.id.toString(),
        timestamp: new Date(Number(analysis.timestamp) * 1000).toLocaleString(),
        summary: analysis.summary,
        postedBy: analysis.postedBy,
      });
    } catch (e: any) {
      console.error("Error fetching analysis:", e);
      setError(e.message || "Failed to fetch analysis.");
      setFetchedAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>TrendPredictor EVM Agent</h1>

      {!currentAccount ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {currentAccount}</p>
      )}

      <div className="card">
        <h2>View Trend</h2>
        <button onClick={() => {
          fetchPastTrends();
        }} disabled={!currentAccount || loading}>
          {loading ? 'Fetching...' : latestTrendSummary}
        </button>
      </div>

      <div className="card">
        <h2>Get Analysis by ID</h2>
        <input
          type="number"
          placeholder="Enter analysis ID"
          value={analysisId}
          onChange={(e) => setAnalysisId(e.target.value)}
          disabled={!currentAccount || loading}
        />
        <button onClick={() => handleGetAnalysis(analysisId)} disabled={!currentAccount || loading}>
          {loading ? 'Fetching...' : 'Get Analysis'}
        </button>
        {fetchedAnalysis && (
          <div>
            <p>ID: {fetchedAnalysis.id}</p>
            <p>Timestamp: {fetchedAnalysis.timestamp}</p>
            <p>Summary: {fetchedAnalysis.summary}</p>
            <p>Posted By: {fetchedAnalysis.postedBy}</p>
          </div>
        )}
      </div>


      <div className="card">
        <h2>Latest Headlines</h2>
        {headlines.length > 0 ? (
          <ul>
            {headlines.map((item, index) => (
              <li key={index}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></li>
            ))}
          </ul>
        ) : (
          <p>Fetching headlines...</p>
        )}
      </div>

      <div className="card">
        <h2>Past Trends (Last 10)</h2>
        {pastTrendsDisplay.length > 0 ? (
          <ul>
            {pastTrendsDisplay.map((trend, index) => (
              <li key={index}>
                <p>Summary: {trend.summary}</p>
                <p>Hash: <a href={`https://sepolia.etherscan.io/tx/${trend.transactionHash}`} target="_blank" rel="noopener noreferrer">{trend.transactionHash.substring(0, 10)}...</a></p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past trends available.</p>
        )}
      </div>

      {error && <p className="error">Error: {error}</p>}

      <p className="read-the-docs">
        Interact with the TrendPredictor EVM Smart Contract
      </p>
    </>
  );
}

export default App;