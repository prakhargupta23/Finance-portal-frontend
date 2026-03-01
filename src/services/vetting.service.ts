import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";

export const vettingService = {
  getVettingData,
  getVettingDelay,
};

async function getVettingData() {
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-data`);
}

type DelayQuery = string | { planHead?: string; workname?: string };

async function getVettingDelay(queryInput?: DelayQuery) {
  const params = new URLSearchParams();

  if (typeof queryInput === "string") {
    params.set("planHead", queryInput);
  } else if (queryInput) {
    if (queryInput.planHead) params.set("planHead", queryInput.planHead);
    if (queryInput.workname) params.set("workname", queryInput.workname);
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  return fetchWrapper.get(`${config.apiUrl}/api/get-vetting-delay${suffix}`);
}
