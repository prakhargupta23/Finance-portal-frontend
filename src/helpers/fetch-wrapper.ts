/** @format */

import { Try } from "@mui/icons-material";
import { userService } from "../services/user.service";
import { config } from "../shared/constants/config";
import pako from "pako";

export const fetchWrapper = {
  download,
  get,
  post,
  postFormData,
  put,
  delete: _delete,
  postZip,
};

function get(url: string) {
  // const user = accountService.userValue;

  const requestOptions: RequestInit = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(url),
    },
  };

  return fetch(url, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return handleResponse(response);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
}

function download(url: string) {
  const requestOptions: RequestInit = {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...authHeader(url) },
  };
  return fetch(url, requestOptions);
}

function postFormData(url: string, body: any) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { ...authHeader(url) },
    credentials: "include",
    body: body,
  };
  return fetch(url, requestOptions).then(handleResponse);
}

async function post(url: string, body: any) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(url) },

    credentials: "include",
    body: JSON.stringify(body),
  };

  return fetch(url, requestOptions).then(handleResponse);
}

async function postZip(url: string, body: any) {
  try {
  } catch (error) { }
  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(url) },
    credentials: "include",
    body: JSON.stringify(body),
  };

  const response: any = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseBuffer = new Uint8Array(await response.arrayBuffer());
  console.log(responseBuffer);

  // Check Content-Encoding
  const contentEncoding = response.headers.get("Content-Encoding");
  console.log(contentEncoding);
  // Print first two bytes of response buffer (should be 31, 139 for GZIP)
  console.log("First Two Bytes:", responseBuffer[0], responseBuffer[1]);

  if (
    contentEncoding === "gzip" ||
    (responseBuffer[0] === 31 && responseBuffer[1] === 139)
  ) {
    console.log("went here");

    const decompressed = pako.ungzip(responseBuffer, { to: "string" });
    const value = JSON.parse(decompressed);

    return value;
  } else {
    return null;
  }
}

function put(url: string, body: any) {
  const requestOptions: RequestInit = {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(url) },
    credentials: "include",
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url: string) {
  const requestOptions: RequestInit = {
    method: "DELETE",
    credentials: "include",
    headers: { ...authHeader(url) },
  };
  return fetch(url, requestOptions).then(handleResponse);
}

// helper functions
function authHeader(url: string): HeadersInit {
  // return auth header with jwt if user is logged in and request is to the allowed API URLs
  const user = userService.userValue;

  const isLoggedIn = user && user.jwt;
  const isAllowedApiUrl = url.startsWith(config.apiUrl);

  if (isLoggedIn && isAllowedApiUrl) {
    return { Authorization: `Bearer ${user.jwt}` };
  } else {
    return {};
  }
}

function handleResponse(response: Response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      // if ([401, 403].includes(response.status) && accountService.userValue) {
      //   accountService.logout();
      // }
      const error = (data && (data.message || data.details || (data.dbWrite && data.dbWrite.error) || data.error)) || response.statusText;

      return Promise.reject(error);
    }

    return data;
  });
}
