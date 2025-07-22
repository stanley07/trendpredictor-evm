import { ethers } from 'ethers';

export async function logInsight(trendPredictorContract: ethers.Contract, summary: string): Promise<string> {
  try {
    // Call the logAnalysis function on your smart contract
    const tx = await trendPredictorContract.logAnalysis(summary);
    const receipt = await tx.wait();

    console.log('✅ Insight logged to blockchain successfully!', receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error('❌ Error logging insight to blockchain:', error);
    throw error;
  }
}