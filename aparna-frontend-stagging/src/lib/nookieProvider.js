import { getValidatedToken } from "@/security/client-side/axios/axios";
import { destroyCookie, setCookie } from "nookies";

const generateToken = async () => {
  return new Promise(async (resolve, reject) => {
    const response = await getValidatedToken({
      accessToken: null,
      deviceId: null,
      userId: null,
      refreshToken: null,
    });
    if (response?.code == 200) {
      setCookie(null, "userToken", response?.accessToken, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      setCookie(null, "deviceId", response?.deviceId, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      destroyCookie(null, "refreshToken");
      destroyCookie(null, "userId");
      return resolve();
    } else if (response?.status === 401) {
      generateToken();
    }
    return reject("Exception:- unable to generate new userToken");
  });
};

const setNoAuthCookies = (response) => {
  return new Promise((resolve, reject) => {
    try {
      setCookie(
        null,
        "userToken",
        response?.userToken ?? response?.accessToken,
        {
          maxAge: 24 * 60 * 60 * 6,
          path: "/",
        }
      );
      setCookie(null, "deviceId", response?.deviceId, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      resolve("No auth cookies set successfully");
    } catch (error) {
      reject(error);
    }
  });
};

const setAuthCookies = (response) => {
  return new Promise((resolve, reject) => {
    try {
      setCookie(null, "userToken", response?.accessToken, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      setCookie(null, "refreshToken", response?.refreshToken, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      setCookie(null, "deviceId", response?.deviceId, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      setCookie(null, "userId", response?.userId, {
        maxAge: 24 * 60 * 60 * 6,
        path: "/",
      });
      resolve("Auth cookies set successfully");
    } catch (error) {
      reject(error);
    }
  });
};

export const nookieProvider = async (action, response) => {
  switch (action) {
    case "generate":
      await generateToken();
      break;
    case "Auth":
      await setAuthCookies(response);
      break;
    case "NoAuth":
      await setNoAuthCookies(response);
      break;
    case "NoAuthToken":
      await setNoAuthCookies(response);
      break;
    default:
      const user =
        localStorage.getItem("user") === "undefined"
          ? {}
          : JSON.parse(localStorage.getItem("user"));
      break;
  }
};
