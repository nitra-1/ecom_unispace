"use server";
import { getBaseUrl } from "@/lib/GetBaseUrl";
import axios from "axios";
import { cookies } from "next/headers";

let validatedTokenCache = {
  token: null,
  expiration: null,
};

let ongoingValidationPromise = null;
const CACHE_DURATION_MS = 2000;

const getValidatedToken = async (data) => {
  const currentTime = Date.now();
  if (
    validatedTokenCache.token &&
    validatedTokenCache.expiration > currentTime
  ) {
    return validatedTokenCache.token;
  }

  if (ongoingValidationPromise) {
    return ongoingValidationPromise;
  }

  ongoingValidationPromise = new Promise(async (resolve, reject) => {
    try {
      let queryParams = `?AccessToken=${encodeURIComponent(
        data.accessToken
      )}&DeviceId=${encodeURIComponent(data.deviceId)}`;
      if (data.refreshToken || data.userId) {
        queryParams += `&RefreshToken=${encodeURIComponent(
          data.refreshToken
        )}&UserId=${encodeURIComponent(data.userId)}`;
      }

      const response = await axios.get(
        `${getBaseUrl()}Account/Customer/ValidateToken${queryParams}`
      );

      if (response?.data?.code === 200 && response?.data?.data) {
        const {
          userId,
          deviceId,
          refreshToken,
          accessToken,
          tokenType,
          action,
        } = response.data.data;

        validatedTokenCache = {
          token: {
            userId,
            deviceId,
            refreshToken,
            accessToken,
            tokenType,
            action,
            code: response.data.code,
          },
          expiration: currentTime + CACHE_DURATION_MS,
        };

        resolve(validatedTokenCache.token);
      } else {
        reject(null);
      }
    } catch (error) {
      reject(null);
    } finally {
      ongoingValidationPromise = null;
    }
  });

  return ongoingValidationPromise;
};

const fetchWithToken = async (endpoint, headers) => {
  try {
    const response = await axios.get(endpoint, {
      headers,
    });
    if (response.status === 200) {
      return response?.data;
    } else {
      return { error: true, status: response.status };
    }
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const handleException = async (statusCode, endpoint) => {
  const nextCookies = cookies();
  const userId = nextCookies.get("userId")?.value || null;
  const refreshToken = nextCookies.get("refreshToken")?.value || null;
  const accessToken = nextCookies.get("userToken")?.value || null;
  const deviceId = nextCookies.get("deviceId")?.value || null;
  const data = { userId, refreshToken, accessToken, deviceId };
  if (statusCode === 401 || !accessToken || !deviceId || !refreshToken) {
    const tokenData = await getValidatedToken(data);
    if (tokenData) {
      const headers = {
        Authorization: `Bearer ${tokenData.accessToken}`,
        device_id: tokenData.deviceId,
      };

      const response = await fetchWithToken(endpoint, headers);
      if (response) {
        return {
          ...response,
          action: {
            code: 401,
            userToken: tokenData.accessToken,
            deviceId: tokenData.deviceId,
            refreshToken: tokenData.refreshToken,
            userId: tokenData.userId,
            action: tokenData.action,
            tokenType: tokenData.tokenType,
          },
        };
      } else {
        return [];
      }
    }
  }

  return [];
};

export const fetchServerSideApi = async ({
  endpoint,
  queryParams = {},
  userToken = null,
  deviceId = null,
}) => {
  const nextCookies = cookies();

  let queryString = "";
  if (typeof queryParams === "object") {
    queryString =
      "?" +
      Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join("&");
  } else if (typeof queryParams === "string") {
    queryString = queryParams;
  } else {
    throw new Error("Invalid query params");
  }
  const headers = {
    Authorization: `Bearer ${userToken || nextCookies.get("userToken")?.value}`,
    device_id: deviceId || nextCookies.get("deviceId")?.value,
  };

  try {
    const response = await axios.get(`${endpoint}${queryString}`, { headers });
    if (response?.status === 200 && response?.data) {
      return { ...response.data, action: null };
    } else {
      return [];
    }
  } catch (error) {
    const handledData = await handleException(
      error?.response?.status,
      `${endpoint}${queryString}`
    );
    return handledData;
  }
};
