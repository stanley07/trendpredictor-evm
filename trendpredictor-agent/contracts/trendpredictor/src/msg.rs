use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Timestamp};

/// Message used during contract instantiation.
#[cw_serde]
pub struct InstantiateMsg {}

/// Messages used to execute actions on the contract.
#[cw_serde]
pub enum ExecuteMsg {
    /// Log a new AI-generated trend analysis
    LogAnalysis {
        summary: String,
    },
}

/// Query messages supported by the contract.
#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    /// Retrieve a trend analysis by ID
    #[returns(AnalysisResponse)]
    GetAnalysis { id: u64 },
}

/// Response returned when querying an analysis log
#[cw_serde]
pub struct AnalysisResponse {
    pub timestamp: Timestamp,
    pub summary: String,
    pub posted_by: Addr,
}
