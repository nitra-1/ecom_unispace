import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  const { userInfo } = useSelector((state) => state.user)

  // show unauthorized screen if no user is found in redux store
  if (!userInfo) {
    localStorage.clear();
    return < Navigate to={'/login'} />
  }

  return <Outlet />
}

export default ProtectedRoute
