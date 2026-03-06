import axios from 'axios'
import { getBaseUrl, getDeviceId } from './GetBaseUrl.jsx'
import { api } from './Interceptors.jsx'

async function axiosProvider(data) {
  let response = null
  let config = {
    ...data,
    headers: {
      ...data.headers,
      device_id: getDeviceId()
    }
  }
  let apiURL = `${getBaseUrl()}${config.endpoint}`

  if (config && config.queryString) {
    apiURL += config.queryString
  }

  try {
    const lowerCaseApiURL = apiURL.toLowerCase()
    switch (config.method) {
      case 'GET':
        response = await api.get(apiURL, {
          params: config.params || {},
          headers: config.headers || {},
          signal: config.signal
        })
        break

      case 'POST':
        if (
          lowerCaseApiURL.includes('displaycalculation') ||
          lowerCaseApiURL.includes('logout') ||
          lowerCaseApiURL.includes('skucode') ||
          lowerCaseApiURL.includes('notification') ||
          lowerCaseApiURL.includes('tempimage') ||
          lowerCaseApiURL.includes('calculatepackagingweight') ||
          lowerCaseApiURL.includes('checkproduct')
        ) {
          response = await api.post(apiURL, config.data, {
            params: config.params,
            headers: config.headers
          })
        } else {
          response = await api.post(apiURL, config.data, {
            params: config.params,
            headers: config.headers
          })
          response?.data?.code === 200 && (await logApiCall('Insert', data))
        }
        break

      case 'PUT':
        if (
          lowerCaseApiURL.includes('displaycalculation') ||
          lowerCaseApiURL.includes('logout')
        ) {
          response = await api.put(apiURL, config.data, {
            params: config.params,
            headers: config.headers
          })
        } else {
          response = await api.put(apiURL, config.data, {
            params: config.params,
            headers: config.headers
          })
          response?.data?.code === 200 && (await logApiCall('Update', data))
        }
        break

      case 'PATCH':
        response = await api.patch(apiURL, config.data, {
          params: config.params,
          headers: config.headers
        })
        break

      case 'DELETE':
        if (
          lowerCaseApiURL.includes('displaycalculation') ||
          lowerCaseApiURL.includes('logout')
        ) {
          response = await api.delete(apiURL, {
            params: config.params,
            headers: config.headers
          })
        } else {
          response = await api.delete(apiURL, {
            params: config.params,
            headers: config.headers
          })
          response?.data?.code === 200 && (await logApiCall('Delete', data))
        }
        break

      default:
        break
    }

    return response ? response : []
  } catch (error) {
    return null
  }
}

async function logApiCall(method, response) {
  if (!response?.endpoint?.toLowerCase()?.includes('notification')) {
    let logDescription = {}
    if (method === 'Update') {
      logDescription = {
        old: response?.oldData ? response?.oldData : {},
        new: response?.logData ? response.logData : response?.data
      }
    } else {
      logDescription = {
        new: response?.logData ? response.logData : response?.data
      }
    }

    let logPayload = {
      userId: response?.userId,
      userType: 'Admin',
      url: response?.location,
      action: method,
      logTitle: `Data ${method} successfully `,
      logDescription: JSON.stringify(logDescription)
    }

    try {
      await axios.post(`${getBaseUrl()}Log`, logPayload)
    } catch (error) {}
  }
}

export default axiosProvider
