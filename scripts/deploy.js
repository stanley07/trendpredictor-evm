const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TrendPredictor = await hre.ethers.getContractFactory("TrendPredictor");
  const trendPredictor = await TrendPredictor.connect(deployer).deploy();

  await trendPredictor.waitForDeployment();

  console.log(
    `TrendPredictor deployed to ${trendPredictor.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
