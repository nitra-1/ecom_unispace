import { createSlice } from '@reduxjs/toolkit'
import { destroyCookie } from 'nookies'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    userToken: null,
    refreshToken: null,
    deviceId: null,
    sessionId: null
  },
  reducers: {
    logout: (state) => {
      document.cookie =
        'deviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie =
        'userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie =
        'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // document.cookie =
      //   'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie =
        'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

      localStorage.removeItem('hk-compare-data')

      // Object.keys(state).forEach((key) => {
      //   state[key] = null
      // })
      state.user = {}
      state.userToken = null
      state.refreshToken = null
    },

    unconditionalLogout: (state) => {
      destroyCookie(null, 'refreshToken')
      // destroyCookie(null, 'sessionId')
      destroyCookie(null, 'userId')

      // Object.keys(state).forEach((key) => {
      //   state[key] = null
      // })
      state.user = {}
      state.userToken = null
      state.refreshToken = null
    },

    addUser: (state, action) => {
      const { user, userToken, refreshToken, deviceId } = action.payload
      state.user = user
      state.userToken = userToken
      state.refreshToken = refreshToken
      state.deviceId = deviceId
    },

    setSessionId: (state, action) => {
      state.sessionId = action.payload
    }
  }
})

export const { addUser, logout, unconditionalLogout, setSessionId } =
  userSlice.actions

export default userSlice
