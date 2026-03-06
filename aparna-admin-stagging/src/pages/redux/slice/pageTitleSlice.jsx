import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  pageTitle: 'Dashboard'
}

const pageTitleSlice = createSlice({
  name: 'pageTitleSlice.jsx',
  initialState,
  reducers: {
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload
    }
  }
})

export const { setPageTitle } = pageTitleSlice.actions

export default pageTitleSlice.reducer
