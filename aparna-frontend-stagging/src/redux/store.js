import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import addressSlice from "./features/addressSlice";
// appointmentSlice manages the customer's appointment booking state
// (list, pagination, loading, error) persisted via redux-persist.
import appointmentSlice from "./features/appointmentSlice";
import cartSlice from "./features/cartSlice";
import toastSlice from "./features/toastSlice";
import userSlice from "./features/userSlice";
import wishlistReducer from "./features/wishlistSlice";

const rootReducer = combineReducers({
  [addressSlice.name]: addressSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [cartSlice.name]: cartSlice.reducer,
  [toastSlice.name]: toastSlice.reducer,
  // Register the appointment slice so Appointments.jsx and
  // AppointmentBookig.jsx can dispatch thunks and read state
  // via useSelector((state) => state.appointments)
  [appointmentSlice.name]: appointmentSlice.reducer,
  wishlist: wishlistReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: true,
});

const persistor = persistStore(store);

export { persistor, store };
