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
import cartSlice from "./features/cartSlice";
import toastSlice from "./features/toastSlice";
import userSlice from "./features/userSlice";
import wishlistReducer from "./features/wishlistSlice";

const rootReducer = combineReducers({
  [addressSlice.name]: addressSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [cartSlice.name]: cartSlice.reducer,
  [toastSlice.name]: toastSlice.reducer,
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
