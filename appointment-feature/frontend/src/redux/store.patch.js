// ──────────────────────────────────────────────────────────────────────────────
// PATCH FILE – Do NOT copy this file directly.
// Apply the changes below to:  aparna-frontend-stagging/src/redux/store.js
// ──────────────────────────────────────────────────────────────────────────────
//
// 1. Add this import near the top of store.js (with the other feature imports):
//
//    import appointmentSlice from './features/appointmentSlice';
//
// 2. Add `appointment: appointmentSlice.reducer` inside combineReducers({...}):
//
//    const rootReducer = combineReducers({
//      [addressSlice.name]: addressSlice.reducer,
//      [userSlice.name]:    userSlice.reducer,
//      [cartSlice.name]:    cartSlice.reducer,
//      [toastSlice.name]:   toastSlice.reducer,
//      wishlist:            wishlistReducer,
//      // ↓ ADD THIS LINE:
//      [appointmentSlice.name]: appointmentSlice.reducer,
//    });
//
// No other changes to store.js are required.
// ──────────────────────────────────────────────────────────────────────────────
