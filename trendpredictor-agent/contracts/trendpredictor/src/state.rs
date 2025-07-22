use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Timestamp};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct AnalysisEntry {
    pub id: u64,
    pub summary: String,
    pub timestamp: Timestamp,
    pub posted_by: Addr,
}

// Storage for a counter to track the next available analysis ID
pub const ANALYSIS_COUNTER: Item<u64> = Item::new("analysis_counter");

// Map of ID => AnalysisEntry
pub const ANALYSIS_LOGS: Map<u64, AnalysisEntry> = Map::new("analysis_logs");
