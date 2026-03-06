import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  show: false,
  text: null,
  variation: null,
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast: (state, action) => {
      state.show = action.payload.show;
      state.text = action.payload.text;
      state.variation = action.payload.variation;
    },
    clearToast: (state) => {
      state.show = initialState.show;
      state.text = initialState.text;
      state.variation = initialState.variation;
    },
  },
});

export const { setToast, clearToast } = toastSlice.actions;
export default toastSlice;
