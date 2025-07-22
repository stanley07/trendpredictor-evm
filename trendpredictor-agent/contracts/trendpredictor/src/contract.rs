use cosmwasm_std::{
    entry_point, to_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
    Timestamp,
};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, AnalysisResponse};
use crate::state::{CONFIG_OWNER, ANALYSIS_LOGS, LOG_COUNTER, AnalysisLog};

// Version info for migration
const CONTRACT_NAME: &str = "crates.io:trendpredictor";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    CONFIG_OWNER.save(deps.storage, &info.sender)?;
    LOG_COUNTER.save(deps.storage, &0)?;
    Ok(Response::new().add_attribute("method", "instantiate"))
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

fn try_log_analysis(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    summary: String,
) -> Result<Response, ContractError> {
    let counter = LOG_COUNTER.load(deps.storage)?;
    let new_log = AnalysisLog {
        timestamp: env.block.time,
        summary,
        posted_by: info.sender.clone(),
    };
    ANALYSIS_LOGS.save(deps.storage, counter, &new_log)?;
    LOG_COUNTER.save(deps.storage, &(counter + 1))?;

    Ok(Response::new()
        .add_attribute("action", "log_analysis")
        .add_attribute("log_id", counter.to_string())
        .add_attribute("sender", info.sender))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetAnalysis { id } => to_binary(&query_analysis(deps, id)?),
    }
}

fn query_analysis(deps: Deps, id: u64) -> StdResult<AnalysisResponse> {
    let log = ANALYSIS_LOGS.load(deps.storage, id)?;
    Ok(AnalysisResponse {
        timestamp: log.timestamp,
        summary: log.summary,
        posted_by: log.posted_by,
    })
}
