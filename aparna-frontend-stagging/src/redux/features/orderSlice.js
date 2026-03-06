import { createSlice } from '@reduxjs/toolkit'

const initialState = { orders: {} }

const OrdersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload
        }
        // cartData: (state, action) => {
        //     state.cart = action.payload
        // },
        // setCartCount: (state, action) => {
        //     state.cartCount = action.payload
        // },
        // clearCart: (state, action) => {
        //     return initialState
        // }
    }
})

export const { setOrders } = cartSlice.actions
export default OrdersSlice
