import { parseCookies } from "nookies";
import axiosProvider from "./AxiosProvider";
import {
  getDeviceId,
  getRefreshToken,
  getSessionId,
  getUserToken,
  showToast,
} from "./GetBaseUrl";
import { _exception } from "./exceptionMessage";
import { nookieProvider } from "./nookieProvider";

import { addressData, clearAddress } from "@/redux/features/addressSlice";
import { clearCart, setCartCount } from "@/redux/features/cartSlice";
import { addUser, logout, setSessionId } from "@/redux/features/userSlice";

export const checkTokenAuthentication = async (dispatch) => {
  try {
    const { store } = await import("../redux/store");
    const deviceId = getDeviceId();
    const userToken = getUserToken();
    const refreshToken = getRefreshToken();
    const sessionId = getSessionId();
    const response = await axiosProvider({
      method: "GET",
      endpoint: "Account/Customer/GetByToken",
    });
    if (response?.status === 200) {
      if (response?.data?.code === 200) {
        const userId = response?.data?.data?.id;
        let userObj = {
          ...response?.data?.data,
          userId: userId,
          fullName:
            response?.data?.data?.firstName +
            " " +
            response?.data?.data?.lastName,
        };
        store.dispatch(
          addUser({
            user: userObj,
            userToken: userToken,
            refreshToken: refreshToken,
            deviceId: deviceId,
          })
        );
        if (userId?.length) {
          try {
            const responseCount = await axiosProvider({
              method: "GET",
              endpoint: `Cart/bysessionId?sessionId=${userId}`,
            });
            if (responseCount?.status === 200) {
              // nookies.set(null, 'sessionId', userId, { path: '/' })
              dispatch(setSessionId(sessionId));
            }

            store.dispatch(
              setCartCount(responseCount?.data?.pagination?.recordCount)
            );
          } catch (error) {
            showToast(dispatch, {
              data: { code: 204, message: _exception?.message },
            });
          }
        }

        if (sessionId) {
          if (sessionId !== userId) {
            try {
              const responseSession = await axiosProvider({
                method: "PUT",
                endpoint: "Cart/UpdateSession",
                queryString: `?UserId=${userId}&SessionId=${sessionId}`,
              });
              if (responseSession?.status === 200) {
                // nookies.set(null, 'sessionId', userId)
                dispatch(setSessionId(sessionId));
              }
            } catch (error) {
              showToast(dispatch, {
                data: { code: 204, message: _exception?.message },
              });
            }
          }
        }

        try {
          const responseAddress = await axiosProvider({
            method: "GET",
            endpoint: "Address/byUserId",
            queryString: `?userId=${userId}`,
          });
          if (responseAddress?.data?.code === 200) {
            const setDefaultAddress =
              responseAddress?.data?.data?.length > 0 &&
              responseAddress?.data?.data?.find((item) => item?.setDefault);

            if (responseAddress?.data?.data?.length === 1) {
              store.dispatch(
                store.cartData({
                  ...store.getState().cart,
                  deliveryData: responseAddress?.data?.data[0],
                })``
              );
            } else if (setDefaultAddress?.id) {
              store.dispatch(
                cartData({
                  ...store.getState().cart,
                  deliveryData: setDefaultAddress,
                })
              );
            }

            store.dispatch(addressData(responseAddress?.data?.data));
          }
        } catch (error) {
          showToast(dispatch, {
            data: { code: 204, message: _exception?.message },
          });
        }
        return response?.data?.data?.id;
      }
    } else {
      store.dispatch(logout());
      store.dispatch(clearCart());
      store.dispatch(clearAddress());
      const cookies = parseCookies();
      nookieProvider("generate", cookies);
    }
  } catch (error) {
    store.dispatch(clearCart());
    store.dispatch(clearAddress());
    store.dispatch(logout());
    const cookies = parseCookies();
    nookieProvider("generate", cookies);
    showToast(dispatch, {
      data: { code: 204, message: _exception?.message },
    });
  }
};
