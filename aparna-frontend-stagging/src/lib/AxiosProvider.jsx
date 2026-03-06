import { clientAPI } from "@/security/client-side/axios/axios";
import { getBaseUrl, getDeviceId, getUserToken } from "./GetBaseUrl";

async function axiosProvider(data) {
  let response = null;
  let config = {
    ...data,
    headers: {
      ...data.headers,
      Authorization: `Bearer ${getUserToken()}`,
      device_id: getDeviceId(),
    },
  };
  let apiURL = `${getBaseUrl()}${config.endpoint}`;

  if (config && config.queryString) {
    apiURL += config.queryString;
  }

  try {
    switch (config.method) {
      case "GET":
        response = await clientAPI.get(apiURL, {
          params: config.params || {},
          headers: config.headers || {},
        });
        break;

      case "POST":
        response = await clientAPI.post(apiURL, config.data, {
          params: config.params,
          headers: config.headers,
        });
        break;

      case "PUT":
        response = await clientAPI.put(apiURL, config.data, {
          params: config.params,
          headers: config.headers,
        });
        break;

      case "PATCH":
        response = await clientAPI.patch(apiURL, config.data, {
          params: config.params,
          headers: config.headers,
        });
        break;

      case "DELETE":
        response = await clientAPI.delete(apiURL, {
          params: config.params,
          headers: config.headers,
        });
        break;

      default:
        break;
    }
    return response ? response : [];
  } catch (error) {
    return [];
  }
}

export default axiosProvider;
