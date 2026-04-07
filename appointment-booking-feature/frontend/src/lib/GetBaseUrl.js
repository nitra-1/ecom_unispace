import { parseCookies } from 'nookies'

/**
 * Returns the base API URL.
 * Uses the NEXT_PUBLIC_API_URL env variable when set, otherwise the production URL.
 */
export const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.aparna.hashtechy.space/api/'

/** Returns the JWT access token stored in the userToken cookie by nookies. */
export const getUserToken = () => {
  const cookies = parseCookies()
  return cookies['userToken'] || null
}

/** Returns the refresh token stored in the refreshToken cookie. */
export const getRefreshToken = () => {
  const cookies = parseCookies()
  return cookies['refreshToken'] || null
}

/**
 * Returns the device ID stored in the deviceId cookie.
 * Sent as X-Device-Id header on every API request.
 */
export const getDeviceId = () => {
  const cookies = parseCookies()
  return cookies['deviceId'] || null
}

/** Returns the stored user ID from the userId cookie. */
export const getUserId = () => {
  const cookies = parseCookies()
  return cookies['userId'] || null
}
