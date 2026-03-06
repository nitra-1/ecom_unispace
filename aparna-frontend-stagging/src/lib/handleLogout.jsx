import { clearAddress } from "@/redux/features/addressSlice";
import { clearCart } from "@/redux/features/cartSlice";
import { clearWishlist } from "@/redux/features/wishlistSlice";
import { logout } from "@/redux/features/userSlice";
import { parseCookies } from "nookies";
import axiosProvider from "./AxiosProvider";
import { _exception } from "./exceptionMessage";
import { getDeviceId, getSessionId, showToast } from "./GetBaseUrl";
import { nookieProvider } from "./nookieProvider";

export const handleLogout = async (router, dispatch) => {
  const { store } = await import("../redux/store");
  const userState = store?.getState()?.user?.user;
  const auth = store?.getState()?.user;
  const userId = userState?.userId || null;
  const deviceId = getDeviceId();
  const refreshToken = auth?.refreshToken;
  const sessionId = getSessionId();
  let response;
  try {
    if (refreshToken && deviceId) {
      response = await axiosProvider({
        method: "POST",
        endpoint: "Account/Customer/logout",
        data: {
          userId: userId ? userId : sessionId,
          deviceid: deviceId,
          refreshToken: refreshToken,
        },
      });
    } else {
      store.dispatch(clearCart());
      store.dispatch(clearAddress());
      store.dispatch(clearWishlist());
      store.dispatch(logout());
      const cookies = parseCookies();
      nookieProvider("generate", cookies);
    }
    store.dispatch(logout());
    store.dispatch(clearCart());
    store.dispatch(clearAddress());
    store.dispatch(clearWishlist());
    const cookies = parseCookies();
    showToast(dispatch, response);
    nookieProvider("generate", cookies);
    router && router?.push("/");
    showToast(dispatch, {
      data: { code: 200, message: "Logout Successfully" },
    });
    //await signOut();
  } catch (error) {
    showToast(dispatch, {
      data: { code: 204, message: _exception?.message },
    });
  }
};

export const Logout = async (router, response) => {
  const { store } = await import("../redux/store");
  try {
    const cookies = parseCookies();
    store.dispatch(clearCart());
    store.dispatch(clearAddress());
    store.dispatch(clearWishlist());
    store.dispatch(logout());
    router && router?.push("/");
    if (response) {
      nookieProvider("NoAuth", response);
    } else {
      nookieProvider("generate", cookies);
    }
  } catch (error) {
    showToast(store.dispatch, {
      data: { code: 204, message: _exception?.message },
    });
  }
};
