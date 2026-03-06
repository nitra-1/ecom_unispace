import axios from 'axios'
import Swal from 'sweetalert2'
import { logout } from '../pages/redux/slice/userSlice'
import {
  getBaseUrl,
  getDeviceId,
  getRefreshToken,
  getUserToken
} from './GetBaseUrl.jsx'
import { handleLogout } from './HandleLogout.jsx'

export const api = axios.create()

const getUserId = async () => {
  const { store } = await import('../pages/redux/store')
  const { userId } = store.getState().user?.userInfo
  return userId
}

const removeUserOutOfSystem = async () => {
  import('../pages/redux/store')
    .then((module) => {
      const { store } = module
      return store.dispatch(logout())
    })
    .then(() => {
      // showAlert()
    })
    .catch((error) => {
      console.error('Failed to load store:', error)
    })
}

api.interceptors.request.use(
  (config) => {
    const token = getUserToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      return config
    } else {
      handleLogout()
      // showAlert()+
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    let accessToken = getUserToken()
    let refreshToken = getRefreshToken()
    let deviceId = getDeviceId()
    let userId = await getUserId()

    // Check if the response status is 401 (Unauthorized)
    if (
      error?.response?.status === 401 &&
      (!originalRequest?._retry ||
        typeof originalRequest?._retry === 'undefined')
    ) {
      originalRequest._retry = true

      // Check if a token refresh is already in progress
      if (!isRefreshing) {
        isRefreshing = true

        // Make the call to refresh the tokens
        try {
          const response = await axios.post(
            `${getBaseUrl()}Account/Token/GetNewTokens`,
            {
              accessToken,
              refreshToken,
              deviceId,
              userId
            }
          )

          if (response?.data?.code === 200) {
            let newAccessToken = response?.data?.accessToken
            let newRefreshToken = response?.data?.refreshToken
            refreshToken = newRefreshToken
            localStorage.setItem('userToken', newAccessToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            isRefreshing = false

            retryRequest(newAccessToken)

            return api(originalRequest)
          } else if (response?.data?.code === 204) {
            removeUserOutOfSystem()
            isRefreshing = false
          } else {
            handleLogout()
            // showAlert()
            isRefreshing = false
          }
        } catch (error) {
          handleLogout()
          // showAlert()
          isRefreshing = false
        }
      } else {
        // If a token refresh is already in progress, add the request to the queue
        return new Promise((resolve, reject) => {
          requestQueue.push({ config: originalRequest, resolve, reject })
        })
      }
    }

    return Promise.reject(error)
  }
)

let isRefreshing = false

const requestQueue = []

const retryRequest = async (newAccessToken) => {
  while (requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift()
    config.headers.Authorization = `Bearer ${newAccessToken}`
    try {
      const response = await api(config)
      resolve(response)
    } catch (error) {
      reject(error)
    }
  }
}
