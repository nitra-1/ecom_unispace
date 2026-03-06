;import { createSlice } from '@reduxjs/toolkit'

const initialState = { cart: {}, cartCount: 0 }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartData: (state, action) => {
      state.cart = action.payload
    },
    setCartCount: (state, action) => {
      state.cartCount = action.payload
    },
    clearCart: (state, action) => {
      return initialState
    }
  }
})

export const { cartData, setCartCount, clearCart } = cartSlice.actions
export default cartSlice
