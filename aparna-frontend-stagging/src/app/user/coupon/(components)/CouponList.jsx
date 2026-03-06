'use client'

import Loader from '@/components/Loader'
import MyaccountMenu from '@/components/MyaccountMenu'
import Popover from '@/components/Popover'
import axiosProvider from '@/lib/AxiosProvider'
import { currencyIcon } from '@/lib/GetBaseUrl'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const CouponList = () => {
  const { user } = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(false)
  const [offer, setOffer] = useState([])

  const fetchCoupon = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/ManageOffers/search',
        queryString: `?userId=${user?.userId ?? ''}&showToCustomer=true`
      })
      setOffer(response)
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.userId) {
      fetchCoupon()
    }
  }, [user])

  return (
    <>
      {loading && <Loader />}
      <div className="site-container">
        <div className="wish_main_flex">
          <div className="wish_inner_20">
            <MyaccountMenu activeTab="coupon" />
          </div>
          <div className="wish_inner_80">
            <div className="mb-4">
              <h1 className="order-menu-title">Available Coupons</h1>
            </div>

            {offer?.data?.data?.length > 0 ? (
              offer.data.data.map((item) => (
                <div className="sp_coupon_box" key={item?.id}>
                  <div className="sp-coupon_wrapper">
                    <div>
                      <p className="text-base font-semibold text-gray-800">
                        {item?.name}
                      </p>
                      <h3 className="sp_coupon_offer">
                        {item?.offerType === 'free shipping'
                          ? 'You will get free shipping using this coupon'
                          : item?.offerType === 'flat discount'
                          ? `${currencyIcon}${item?.value} off on orders above ${currencyIcon}${item?.minimumOrderValue}`
                          : `${item?.value}% off (up to ${currencyIcon}${item?.maximumDiscountAmount}) on orders above ${currencyIcon}${item?.minimumOrderValue}`}
                      </h3>
                    </div>
                    <p className="sp_coupon_date">
                      Valid till {moment(item?.endDate).format('DD MMM, YYYY')}
                    </p>
                  </div>
                  <div className="sp-coupon_wrapper">
                    <p className="sp_coupon_details">{item?.code}</p>
                    <Popover
                      btntext="View T&C"
                      content={item?.terms || 'N/A'}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No coupons available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CouponList
