import Nookies from 'nookies'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import Loader from '../../components/Loader.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import LoginCredsForm from '../../components/auth/LoginCredsForm.jsx'
import OtpForm from '../../components/auth/OtpForm.jsx'
import vector from '../../images/vector.png'
import vector2 from '../../images/vector2.png'
import { isInventoryModel } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { setSellerDetails, setUserInfo } from '../redux/slice/userSlice.js'
import CredentialContentLogin from '../../components/CredentialContentLogin.jsx'

const Login = () => {
  const [formDetails, setFormDetails] = useState(false)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const handleSubmit = async (response, values) => {
    dispatch(setUserInfo(response?.data))
    localStorage.setItem('userToken', response?.data?.tokens?.accessToken)
    localStorage.setItem('refreshToken', response?.data?.tokens?.refreshToken)
    localStorage.setItem('deviceId', values?.deviceId)
    if (values.isRemember) {
      Nookies.set(null, 'isRemember', values?.isRemember, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      })

      Nookies.set(null, 'userName', values.userName, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      })

      Nookies.set(null, 'password', values?.password, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      })
    } else {
      Nookies.destroy(null, 'isRemember')
      Nookies.destroy(null, 'userName')
      Nookies.destroy(null, 'password')
    }
    if (isInventoryModel) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SellerData/search',
        queryString: `?searchText=&pageIndex=1&pageSize=10&status=Active`
      })
      if (response?.data?.code === 200) {
        dispatch(setSellerDetails(response?.data?.data[0]))
      }
    }
  }

  return (
    <div className="main_background">
      <img src={vector} className="location" alt="location" />
      <img src={vector2} className="vector2" alt="vector2" />
      <div className="container_custom">
        <div className="card_custom d-lg-flex justify-content-between gap-5 align-items-center">
          <CredentialContentLogin />
          <div className="login_Card d-flex bg-white rounded-4 rounded-lg-5 p-4 p-md-5">
            <div className="my-auto w-100">
              {!formDetails?.show ? (
                <LoginCredsForm
                  toast={toast}
                  setToast={setToast}
                  loading={loading}
                  setLoading={setLoading}
                  setFormDetails={setFormDetails}
                  handleSubmit={handleSubmit}
                />
              ) : (
                <OtpForm
                  toast={toast}
                  setToast={setToast}
                  loading={loading}
                  setLoading={setLoading}
                  formDetails={formDetails}
                  setFormDetails={setFormDetails}
                  handleSubmit={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {/* {loading && <Loader />} */}
    </div>
  )
}

export default Login
