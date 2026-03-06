import { createSlice } from '@reduxjs/toolkit'

const initialState = { address: [] }

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addressData: (state, action) => {
      state.address = action.payload
    },
    clearAddress: (state, action) => {
      return initialState
    }
  }
})

export const { addressData, clearAddress } = addressSlice.actions
export default addressSlice;
