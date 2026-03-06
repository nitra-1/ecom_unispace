import { logout } from '../pages/redux/slice/userSlice'
import { getDeviceId, getRefreshToken } from './GetBaseUrl.jsx'
import axiosProvider from './AxiosProvider.jsx'
export const handleLogout = async () => {
  try {
    const { store } = await import('../pages/redux/store')
    const state = store.getState()

    if (state?.user?.userInfo?.userId) {
      await axiosProvider({
        method: 'POST',
        endpoint: 'Account/Admin/logout',
        data: {
          userId: state?.user?.userInfo?.userId,
          deviceid: getDeviceId(),
          refreshToken: getRefreshToken()
        }
      })

      store.dispatch(logout())
    }
  } catch (error) {
    console.error('Failed to load store:', error)
  }
}
