import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slice/userSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import thunk from 'redux-thunk'
import pageTitleReducer from './slice/pageTitleSlice.jsx'

const persistConfig = {
  key: 'root',
  storage,
  expire: 30 * 60 * 1000,
}

const persistedReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({
  reducer: {
    user: persistedReducer,
    pageTitle: pageTitleReducer,
  },
  middleware: [thunk],
})

export const persistor = persistStore(store)