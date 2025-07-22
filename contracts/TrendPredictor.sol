// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TrendPredictor {
    struct Analysis {
        uint256 id;
        uint256 timestamp;
        string summary;
        address postedBy;
    }

    uint256 private nextAnalysisId;
    mapping(uint256 => Analysis) public analyses;

    event AnalysisLogged(uint256 id, uint256 timestamp, string summary, address postedBy);

    constructor() {
        nextAnalysisId = 0;
    }

    function logAnalysis(string memory _summary) public {
        uint256 currentId = nextAnalysisId;
        uint256 currentTimestamp = block.timestamp;
        address sender = msg.sender;

        analyses[currentId] = Analysis(currentId, currentTimestamp, _summary, sender);
        nextAnalysisId++;

        emit AnalysisLogged(currentId, currentTimestamp, _summary, sender);
    }

    function getAnalysis(uint256 _id) public view returns (uint256 id, uint256 timestamp, string memory summary, address postedBy) {
        require(_id < nextAnalysisId, "Analysis ID does not exist");
        Analysis storage analysis = analyses[_id];
        return (analysis.id, analysis.timestamp, analysis.summary, analysis.postedBy);
    }
}