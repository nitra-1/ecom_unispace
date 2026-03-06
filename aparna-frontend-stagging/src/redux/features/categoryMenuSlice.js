import { createSlice } from '@reduxjs/toolkit'

const categoryMenuSlice = createSlice({
  name: 'categoryMenu',
  initialState: {
    data: null
  },
  reducers: {
    addData: (state, action) => {
      state.data = action.payload
    }
  }
})
export default categoryMenuSlice
export const { addData } = categoryMenuSlice.actions
