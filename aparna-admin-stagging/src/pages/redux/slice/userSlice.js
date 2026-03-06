import { createSlice } from '@reduxjs/toolkit'
import { getUserToken } from '../../../lib/GetBaseUrl.jsx'

// initialize userToken from local storage
const userToken = getUserToken()

const initialState = {
  userInfo: null,
  pageAccess: null,
  sellerDetails: {},
  userToken
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('deviceId')
      state.userInfo = null
      state.userToken = null
      state.sellerDetails = {}
      state.pageAccess = null
    },
    setSellerDetails: (state, action) => {
      state.sellerDetails = action.payload
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload.currentUser
      state.pageAccess = action.payload.pageAccess
      state.userToken = action.payload.tokens.accessToken
    },
    updateUserDetails: (state, action) => {
      state.userInfo = action?.payload
    }
  }
})

export const { logout, setSellerDetails, setUserInfo, updateUserDetails } =
  userSlice.actions

export default userSlice.reducer
