import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";

export const vettingService = {
  getVettingData,
  getVettingDelay,
  getTableData,
  getMasterStatus,
  getLatestMasterStatus,
};

async function getLatestMasterStatus() {
  return fetchWrapper.get(`${config.apiUrl}/api/create-master?latest=true`);
}

async function getMasterStatus(sNo: string) {
  return fetchWrapper.get(`${config.apiUrl}/api/create-master?sNo=${sNo}`);
}

async function getVettingData() {
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-data`);
}

async function getTableData() {
  // We use the same endpoint as create-master but with GET method
  // which we recently configured to return joined table data
  return fetchWrapper.get(`${config.apiUrl}/api/create-master`);
}

type DelayQuery = string | { planHead?: string; workname?: string; sNo?: string };

async function getVettingDelay(queryInput?: DelayQuery) {
  const params = new URLSearchParams();

  if (typeof queryInput === "string") {
    params.set("planHead", queryInput);
  } else if (queryInput) {
    if (queryInput.planHead) params.set("planHead", queryInput.planHead);
    if (queryInput.workname) params.set("workname", queryInput.workname);
    if (queryInput.sNo) params.set("sNo", queryInput.sNo);
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-delay${suffix}`);
}
