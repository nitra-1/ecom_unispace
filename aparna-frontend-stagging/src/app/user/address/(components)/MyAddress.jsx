'use client'
import { addressData } from '@/redux/features/addressSlice'
import { cartData } from '@/redux/features/cartSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import EmptyComponent from '../../../../components/EmptyComponent'
import MyaccountMenu from '../../../../components/MyaccountMenu'
import IpRadio from '../../../../components/base/IpRadio'
import axiosProvider from '../../../../lib/AxiosProvider'
import { showToast } from '../../../../lib/GetBaseUrl'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage'
import AddressModal from './AddressModal'

const MyAddress = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const [data, setData] = useState()
  const [modalShow, setModalShow] = useState({ show: false, data: null })

  const fetchDefaultAddress = async (id) => {
    const data = {
      id: id,
      userId: user?.userId,
      setDefault: true
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Address/setDefault',
        data
      })

      setLoading(false)
      if (response?.status === 200) {
        setData((prevState) => ({
          ...prevState,
          data: {
            ...data?.data,
            data: prevState.data?.data.map((item) =>
              item.id === id
                ? { ...item, setDefault: true }
                : { ...item, setDefault: false }
            )
          }
        }))
        showToast(dispatch, response)
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Address',
        queryString: `?id=${id}`
      })

      setLoading(false)
      if (response?.data?.code === 200) {
        fetchData()
      }
      showToast(dispatch, response)
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const fetchData = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Address/byUserId',
        queryString: `?userId=${user?.userId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        const setDefaultAddress =
          response?.data?.data?.length > 0 &&
          response?.data?.data?.find((item) => item?.setDefault)
        if (id) {
          dispatch(
            cartData({
              ...cart,
              deliveryData: response?.data?.data?.find(
                (item) => item?.id === id
              )
            })
          )
        } else {
          const deliveryData =
            response?.data?.data?.length === 1
              ? response.data.data[0]
              : setDefaultAddress?.id
              ? setDefaultAddress
              : null

          dispatch(cartData({ ...cart, deliveryData }))
        }
        if (response?.data?.data?.length === 1) {
          if (!response?.data?.data[0]?.setDefault) {
            fetchDefaultAddress(response?.data?.data[0]?.id)
          }
        }
        setData(response)
        dispatch(addressData(response?.data?.data))
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  //   useEffect(() => {
  //     fetchData()
  //   }, [data])
  useEffect(() => {
    if (user?.userId) {
      fetchData()
    }
  }, [user?.userId])

  return (
    <>
      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab={'address'} />
        </div>
        <div className="wish_inner_80">
          {data && data?.data?.data?.length > 0 ? (
            <>
              <div className="address_main_fl">
                <div className="address_main_fl_first">
                  <h1 className="order-menu-title">Saved Address</h1>
                </div>
                <div className="address_main_fl_second">
                  <button
                    className="m-btn address_new_add"
                    onClick={() => {
                      setModalShow({ show: !modalShow.show, data: null })
                    }}
                  >
                    <i className="m-icon m-new-address-icon bg-primary"></i>Add
                    new address
                  </button>
                </div>
              </div>

              <div className="add_fl-main">
                {data?.data?.data?.map((item, index) => (
                  <div className="main-mb_3" key={index}>
                    <div className="card_default-address">
                      <div className="def_fl">
                        <p className="default_name">
                          {item?.fullName} - {item?.addressType}
                        </p>

                        <IpRadio
                          id={item?.id}
                          labelText={'Set Default'}
                          MainHeadClass={'mb_none'}
                          name={'setDefalt'}
                          onChange={() => fetchDefaultAddress(item?.id)}
                          checked={item?.setDefault}
                        />
                      </div>
                      <p className="default_add-add">
                        {item?.addressLine1}, {item?.addressLine2},
                        {item?.cityName} - {item?.stateName} {item?.pincode}
                      </p>
                      <p className="default_add-add">{item?.Landmark}</p>
                      <p className="default_add-add">
                        Mobile: {item?.mobileNo}
                      </p>
                    </div>
                    <div className="addressAccordian-buttons">
                      <button
                        className="addressAccordian-button"
                        onClick={() => {
                          setModalShow({ show: !modalShow.show, data: item })
                        }}
                      >
                        Edit
                      </button>
                      <div className="addressAccordian-buttonDivider"></div>
                      <button
                        className="addressAccordian-button removeaddress_btn"
                        onClick={() => {
                          Swal.fire({
                            title: '',
                            text: 'Are you sure you want to delete this address?',
                            icon: _SwalDelete?.icon,
                            showCancelButton: _SwalDelete?.showCancelButton,
                            confirmButtonColor: _SwalDelete?.confirmButtonColor,
                            cancelButtonColor: _SwalDelete?.cancelButtonColor,
                            confirmButtonText: 'Yes, Delete',
                            cancelButtonText: 'Cancel',
                            customClass: {
                              title: 'sweet-alert-text'
                            }
                          }).then((result) => {
                            if (result?.isConfirmed) {
                              handleDelete(item?.id, item?.userID)
                            }
                          })
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            data && (
              <EmptyComponent
                title={'No Addresses Found'}
                description={
                  'Save preferred delivery locations to make checkout faster every time.'
                }
                src={'/images/myaddresses-empty.png'}
                alt={'empty_Add'}
                isButton
                btnText={'Add Address'}
                onClick={() =>
                  setModalShow({ show: !modalShow?.show, data: null })
                }
                redirectTo={'#.'}
              />
            )
          )}
        </div>
      </div>
      {modalShow?.show && (
        <AddressModal
          modalShow={modalShow}
          setModalShow={setModalShow}
          fetchAllAddress={fetchData}
          setLoading={setLoading}
        />
      )}
    </>
  )
}

export default MyAddress
