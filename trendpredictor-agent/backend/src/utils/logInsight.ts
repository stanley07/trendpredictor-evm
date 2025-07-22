import { ethers } from 'ethers';

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const CONTRACT_ABI = JSON.parse(process.env.CONTRACT_ABI || '[]');

export async function logInsight(summary: string): Promise<void> {
  try {
    // Connect to the Ethereum network (e.g., Sepolia, Polygon, etc.)
    // You'll need to configure your provider based on your blockchain network
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // Load your wallet (private key should be securely stored and accessed)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    // Create a contract instance
    const trendPredictorContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Call the logAnalysis function on your smart contract
    const tx = await trendPredictorContract.logAnalysis(summary);
    await tx.wait();

    console.log('✅ Insight logged to blockchain successfully!', tx.hash);
  } catch (error) {
    console.error('❌ Error logging insight to blockchain:', error);
    throw error;
  }
}
