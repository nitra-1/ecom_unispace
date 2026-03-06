import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import App from './App.js'
import './css/style.scss'
import { persistor, store } from './pages/redux/store.js'
import reportWebVitals from './reportWebVitals.js'
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.Fragment>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.Fragment>
)

reportWebVitals()
