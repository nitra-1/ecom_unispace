// import { createSlice } from "@reduxjs/toolkit";

// const wishlistSlice = createSlice({
//   name: "wishlist",
//   initialState: {
//     items: [],
//   },
//   reducers: {
//     addToWishlist: (state, action) => {
//       const exists = state.items.find((guid) => guid === action.payload);
//       if (!exists) {
//         state.items.push(action.payload);
//       }
//     },
//     removeFromWishlist: (state, action) => {
//       state.items = state.items.filter((guid) => guid !== action.payload);
//     },
//     setWishlist: (state, action) => {
//       state.items = action.payload;
//     },
//     clearWishlist: (state ) => {
//       state.items = [];
//     },
//   },
// });

// export const { addToWishlist, removeFromWishlist, setWishlist,clearWishlist } =
//   wishlistSlice.actions;
// export default wishlistSlice;
import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: []
  },
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.items.find(
        (item) => item.productId === action.payload.productId
      )

      if (!exists) {
        state.items.push(action.payload)
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      )
    },
    setWishlist: (state, action) => {
      state.items = action.payload
    },
    clearWishlist: (state) => {
      state.items = []
    }
  }
})

export const { addToWishlist, removeFromWishlist, setWishlist, clearWishlist } =
  wishlistSlice.actions
export default wishlistSlice.reducer
