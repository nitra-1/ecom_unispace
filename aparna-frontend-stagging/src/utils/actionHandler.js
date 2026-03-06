"use client";

import { Logout } from "@/lib/handleLogout";
import { destroyCookie, setCookie } from "nookies";
const actionHandler = async (action) => {
  if (action?.action?.toLowerCase() == "logout") {
    Logout(false, action);
  }

  switch (action.code) {
    case 401: {
      if (action?.userId && action?.refreshToken) {
        setCookie(null, "userToken", action?.userToken, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });

        setCookie(null, "deviceId", action?.deviceId, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });

        setCookie(null, "refreshToken", action?.refreshToken, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });

        setCookie(null, "userId", action?.userId, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });
      } else if (action?.userToken && action?.deviceId) {
        setCookie(null, "userToken", action?.userToken, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });

        setCookie(null, "deviceId", action?.deviceId, {
          maxAge: 1 * 24 * 60 * 60,
          path: "/",
        });

        const cookiesToDestroy = ["role", "userId", "refreshToken"];
        cookiesToDestroy.forEach((cookieName) =>
          destroyCookie(null, cookieName)
        );
      }

      break;
    }
  }
};

export default actionHandler;

export const setCookies = ({ accessToken, deviceId }) => {
  try {
    setCookie(null, "userToken", accessToken, {
      maxAge: 1 * 24 * 60 * 60,
      path: "/",
    });
    setCookie(null, "deviceId", deviceId, {
      maxAge: 1 * 24 * 60 * 60,
      path: "/",
    });
  } catch (error) {
    console.log(error);
  }
};
