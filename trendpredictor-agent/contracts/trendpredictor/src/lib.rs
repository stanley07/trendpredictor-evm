#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    Deps, DepsMut, Env, MessageInfo, Response, StdResult, Binary, to_json_binary,
};

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, AnalysisResponse};
use crate::state::{ANALYSIS_COUNTER, ANALYSIS_LOGS, AnalysisEntry};

pub mod error;
pub mod msg;
pub mod state;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    ANALYSIS_COUNTER.save(deps.storage, &0)?;
    Ok(Response::default())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::LogAnalysis { summary } => try_log_analysis(deps, env, info, summary),
    }
}

pub fn try_log_analysis(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    summary: String,
) -> Result<Response, ContractError> {
    let id = ANALYSIS_COUNTER.load(deps.storage)?;
    let entry = AnalysisEntry {
        id,
        summary: summary.clone(),
        timestamp: env.block.time,
        posted_by: info.sender.clone(),
    };

    ANALYSIS_LOGS.save(deps.storage, id, &entry)?;
    ANALYSIS_COUNTER.save(deps.storage, &(id + 1))?;

    Ok(Response::new()
        .add_attribute("action", "log_analysis")
        .add_attribute("id", id.to_string())
        .add_attribute("posted_by", info.sender))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetAnalysis { id } => {
            let analysis = ANALYSIS_LOGS.load(deps.storage, id)?;
            let response = AnalysisResponse {
                timestamp: analysis.timestamp,
                summary: analysis.summary,
                posted_by: analysis.posted_by,
            };
            to_json_binary(&response)
        }
    }
}
