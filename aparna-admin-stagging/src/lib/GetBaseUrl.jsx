export const getBaseUrl = () => {
  return process.env.REACT_APP_API_URL;
};

export const getUserToken = () => {
  return localStorage.getItem("userToken")
    ? localStorage.getItem("userToken")
    : null;
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken")
    ? localStorage.getItem("refreshToken")
    : null;
};

export const getDeviceId = () => {
  return localStorage.getItem("deviceId")
    ? localStorage.getItem("deviceId")
    : null;
};

export const getFrontendUrl = () => {
  return "https://aparna.hashtechy.space/";
};
