import {
  getBaseUrl,
  getDeviceId,
  getRefreshToken,
  getUserToken,
} from "@/lib/GetBaseUrl";
import { Logout } from "@/lib/handleLogout";
import { nookieProvider } from "@/lib/nookieProvider";
import { clearAddress } from "@/redux/features/addressSlice";
import { clearCart } from "@/redux/features/cartSlice";
import { logout } from "@/redux/features/userSlice";
import axios from "axios";

// Function to validate token
export const getValidatedToken = async ({
  accessToken = null,
  deviceId = null,
  refreshToken = null,
  userId = null,
}) => {
  let queryParams = "";
  if (refreshToken || userId) {
    queryParams = `?AccessToken=${encodeURIComponent(
      accessToken
    )}&RefreshToken=${encodeURIComponent(
      refreshToken
    )}&DeviceId=${deviceId}&UserId=${userId}`;
  } else {
    queryParams = `?AccessToken=${encodeURIComponent(
      accessToken
    )}&DeviceId=${encodeURIComponent(deviceId)}`;
  }

  try {
    const response = await axios.get(
      `${getBaseUrl()}Account/Customer/ValidateToken${queryParams}`
    );

    if (response?.data?.code === 200 && response?.data?.data) {
      const { userId, deviceId, refreshToken, accessToken, tokenType, action } =
        response?.data?.data;
      return {
        userId,
        deviceId,
        refreshToken,
        accessToken,
        tokenType,
        action,
        code: response?.data?.code,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    return null;
  }
};

// Axios client API instance
export const clientAPI = axios.create();

// Create a global AbortController to handle request cancellations
let abortController = new AbortController();

clientAPI.interceptors.request.use(
  async (config) => {
    const token = getUserToken();
    const deviceId = getDeviceId();

    if (token && deviceId) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.device_id = deviceId;
    } else {
      config.headers.Authorization = `Bearer ${null}`;
      config.headers.device_id = `${null}`;
    }

    // Add the abort controller signal to the request
    config.signal = abortController.signal;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to get user ID
const getUserId = async () => {
  const { store } = await import("../../../redux/store");
  const userDetails = store.getState().user;
  return userDetails?.user?.userId;
};

let isRefreshing = false;
let refreshPromise = null;
let retryAfterDelay = false;

// Axios response interceptor for handling token refresh
clientAPI.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    let accessToken = getUserToken();
    let refreshToken = getRefreshToken();
    let deviceId = getDeviceId();
    const userId = await getUserId();

    const { store } = await import("../../../redux/store");

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await getValidatedToken({
            accessToken,
            refreshToken,
            deviceId,
            userId,
          });

          if (response?.action?.toLowerCase() === "logout") {
            originalRequest._retry = false;
            refreshPromise = true;
            Logout(null, response);
            return Promise.reject(
              new Error("User logged out, request cancelled.")
            );
          }

          if (
            (response?.code === 200 && response?.refreshToken) ||
            response?.userId
          ) {
            nookieProvider("Auth", response);
            originalRequest.headers.Authorization = `Bearer ${response?.accessToken}`;
            return clientAPI(originalRequest);
          } else {
            Logout(null, response);
            nookieProvider("NoAuth", response);
            originalRequest.headers.Authorization = `Bearer ${response?.accessToken}`;
            return clientAPI(originalRequest);
          }
        } catch (error) {
          originalRequest._retry = false;
          refreshPromise = true;
          if (refreshToken || userId) {
            logout();
          } else {
            nookieProvider("generate", cookies);
          }
          console.error("Error during token refresh:", error);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Handle request queue when token refresh is in progress
        if (!refreshPromise) {
          refreshPromise = new Promise((resolve) => {
            setTimeout(async () => {
              await clientAPI(originalRequest);
              resolve();
              refreshPromise = null;
            }, 10000);
          });
        }
        await refreshPromise;
      }
    } else if (error?.response?.status === 403) {
      store.dispatch(clearCart());
      store.dispatch(clearAddress());
      store.dispatch(logout());
      nookieProvider("generate", cookies);
    } else if (error?.response?.status === 429) {
      // Rate limit exceeded, retry after a delay (example: 30 seconds)
      retryAfterDelay = true;
      setTimeout(() => {
        retryAfterDelay = false;
        clientAPI(originalRequest);
      }, 30000); // Retry after 30 seconds
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Cancel ongoing request if necessary
export const cancelRequest = () => {
  abortController.abort();
  abortController = new AbortController(); // Recreate the AbortController for future requests
};
