import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";

export const vettingService = {
  getVettingData,
  getVettingDelay,
  getPlanheadComparison,
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

async function getVettingData(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-data${suffix}`);
}

async function getTableData(cursor = "", limit = 10) {
  return fetchWrapper.get(`${config.apiUrl}/api/create-master?cursor=${cursor}&limit=${limit}`);
}

type DelayQuery = string | { planHead?: string; workname?: string; sNo?: string };

async function getVettingDelay(queryInput?: DelayQuery, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();

  if (typeof queryInput === "string") {
    params.set("planHead", queryInput);
  } else if (queryInput) {
    if (queryInput.planHead) params.set("planHead", queryInput.planHead);
    if (queryInput.workname) params.set("workname", queryInput.workname);
    if (queryInput.sNo) params.set("sNo", queryInput.sNo);
  }

  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-delay${suffix}`);
}

async function getPlanheadComparison(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  params.set("grouped", "true");
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-delay?${params.toString()}`);
}
