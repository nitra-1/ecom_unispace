import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import notFoundImg from '../../icons/notfound.png'

const NotFound = ({ title = '', subTitle = '' }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (title) {
      dispatch(setPageTitle(title))
    }
  }, [])

  return (
    <div className='flex-column align-items-center container d-flex'>
      <img src={notFoundImg} alt='not Found Img' />
      <h1 className='text-danger'>{title ? title : 'Access Denied'}</h1>
      <p>
        {subTitle
          ? subTitle
          : 'Sorry, you do not have the necessary rights to access this page.'}
      </p>
    </div>
  )
}

export default NotFound
