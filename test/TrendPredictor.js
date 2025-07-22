const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrendPredictor", function () {
  let TrendPredictor;
  let trendPredictor;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    TrendPredictor = await ethers.getContractFactory("TrendPredictor");
    trendPredictor = await TrendPredictor.deploy();
    await trendPredictor.waitForDeployment();
  });

  it("Should log an analysis and retrieve it", async function () {
    const summary = "Emerging trend: AI in healthcare";
    await trendPredictor.logAnalysis(summary);

    const analysis = await trendPredictor.getAnalysis(0);
    expect(analysis.summary).to.equal(summary);
    expect(analysis.postedBy).to.equal(owner.address);
  });

  it("Should revert if analysis ID does not exist", async function () {
    await expect(trendPredictor.getAnalysis(999)).to.be.revertedWith("Analysis ID does not exist");
  });
});
