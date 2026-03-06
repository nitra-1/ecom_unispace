'use client'
import { addUser } from '@/redux/features/userSlice'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MyaccountMenu from '../../../../components/MyaccountMenu'
import ProfileSkeleton from '../../../../components/skeleton/ProfileSkeleton'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _exception } from '../../../../lib/exceptionMessage'
import { reactImageUrl } from '../../../../lib/GetBaseUrl'
import { _userProfileImg_ } from '../../../../lib/ImagePath'
import ChangePassword from './ChangePassword'
import UpdateProfile from './UpdateProfile'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { _alphabetRegex_ } from '@/lib/Regex'
import InputComponent from '@/components/base/InputComponent'
import IpRadio from '@/components/base/IpRadio'
import { showToast } from '../../../../lib/GetBaseUrl'

const MyProfile = () => {
  const [modalOpen, setModalOpen] = useState({
    updateProfile: false,
    changePassword: false
  })
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentURL, setCurrentURL] = useState(false)
  const [data, setData] = useState()
  const dispatch = useDispatch()
  const { user, userToken, refreshToken, deviceId } = useSelector(
    (state) => state?.user
  )

  const defaultPicture =
    'https://img.freepik.com/premium-vector/man-avatar-profile-round-icon_24640-14044.jpg?w=2000'

  const [selectedPicture, setSelectedPicture] = useState(defaultPicture)
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']
  const initialValues = {
    Id: user?.userId ?? '',
    UserName: user?.userName ?? '',
    FirstName: data?.firstName ?? '',
    LastName: data?.lastName ?? '',
    MobileNo: data?.mobileNo ?? '',
    Gender: data?.gender ?? '',
    IsEmailConfirmed: true ?? '',
    IsPhoneConfirmed: true ?? '',
    ProfileImage: data?.profileImage ?? '',
    FileName: data?.profileImage ?? '',
    editProfile: true,
    EmailId: data?.emailId
  }

  const validationSchema = Yup.object().shape(
    {
      FirstName: Yup.string()
        .matches(
          _alphabetRegex_,
          'Numeric value and special charecters are not allowed'
        )
        .required('First name is required')
        .test('First name is required', (value) => !value.includes(' ')),
      LastName: Yup.string()
        .matches(
          _alphabetRegex_,
          'Numeric value and special charecters are not allowed'
        )
        .required('Last name is required')
        .test('Last name is required', (value) => !value.includes(' ')),
      FileName: Yup.mixed().when('FileName', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File format is not supported, Please use .jpg/.png/.jpeg format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['FileName', 'FileName']
  )

  const closeModal = () => {
    setModalOpen({ updateProfile: false, changePassword: false })
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Account/Customer/ById',
        queryString: `?Id=${user?.userId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response?.data?.data)
        let userObj = {
          ...response?.data?.data,
          userId: response?.data?.data?.id,
          fullName:
            response?.data?.data?.firstName +
            ' ' +
            response?.data?.data?.lastName
        }

        if (JSON.stringify(user) !== JSON.stringify(userObj)) {
          dispatch(
            addUser({
              user: userObj,
              userToken: userToken,
              refreshToken: refreshToken,
              deviceId: deviceId
            })
          )
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchUser()
    }
  }, [user])

  const onSubmit = async (values) => {
    if (!values?.FileName?.name) {
      values = { ...values, OldProfileImage: values?.FileName }
    }
    const submitFormData = new FormData()
    const keys = Object.keys(values)
    keys.forEach((key) => {
      submitFormData.append(key, values[key])
    })
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: `Account/Customer/Update`,
        data: submitFormData
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchUser()
      }
      showToast(dispatch, response)
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    fetchUser()
    setCurrentURL(window?.location?.href)
  }, [])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user])
  return (
    <>
      {modalOpen?.changePassword && <ChangePassword onClose={closeModal} />}

      {modalOpen?.updateProfile && (
        <UpdateProfile
          data={data}
          onClose={closeModal}
          fetchUser={fetchUser}
          setLoading={setLoading}
        />
      )}

      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab={'profile'} />
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          //   <div className="profile-main-info">
          //     <div className="wish_inner_80 profile-main">
          //       <div className="p-head-image-main">
          //         <div className="profile-head">
          //           <h2 className="profile-label">Profile Details</h2>
          //         </div>
          //         <div className="profile-image">
          //           <div className="profile-pic">
          //             <label className="-label" htmlFor="file">
          //               <span className="glyphicon glyphicon-camera"></span>
          //               <span>Change Image</span>
          //             </label>
          //             <input id="file" type="file" />
          //             {data?.profileImage && data?.profileImage !== 'null' ? (
          //               <Image
          //                 src={`${reactImageUrl}${_userProfileImg_}${data?.profileImage}`}
          //                 alt="Selected Profile Picture"
          //                 id="output"
          //                 width={100}
          //                 height={100}
          //               />
          //             ) : (
          //               data && (
          //                 <Image
          //                   src={defaultPicture}
          //                   alt="Selected Profile Picture"
          //                   id="output"
          //                   width={100}
          //                   height={100}
          //                 />
          //               )
          //             )}
          //             {/* <label htmlFor='file' className='user-lable-pro'>
          //               <div className='user-profile-icon'>
          //                 <i className='m-icon user-icon-p'></i>
          //               </div>
          //             </label> */}
          //           </div>
          //         </div>
          //       </div>
          //       <div className="profile-data">
          //         {data && (
          //           <table>
          //             <tbody>
          //               <tr>
          //                 <td>Full Name:</td>
          //                 <td className="pv-profile-data">
          //                   {data?.firstName} {data?.lastName}
          //                 </td>
          //               </tr>

          //               <tr>
          //                 <td>Mobile Number:</td>
          //                 <td className="pv-profile-data"> {data?.mobileNo}</td>
          //               </tr>

          //               <tr>
          //                 <td>Email ID:</td>
          //                 <td className="pv-profile-data">
          //                   {' '}
          //                   {data?.userName?.toLowerCase()}
          //                 </td>
          //               </tr>

          //               <tr>
          //                 <td>Gender:</td>
          //                 <td className="pv-profile-data">
          //                   {data?.gender ?? `-`}
          //                 </td>
          //               </tr>

          //               {/* <tr>
          //                 <td>Date of Birth</td>
          //                 <td>23 MAY 2019</td>
          //               </tr> */}
          //             </tbody>
          //           </table>
          //         )}
          //       </div>
          //     </div>
          //     <div className="profile-edit">
          //       <button
          //         className="m-btn btn-primary"
          //         onClick={() => {
          //           setModalOpen({ ...modalOpen, updateProfile: true })
          //         }}
          //       >
          //         Update Profile
          //       </button>
          //       <button
          //         onClick={() => {
          //           setModalOpen({ ...modalOpen, changePassword: true })
          //         }}
          //         className="m-btn btn-edit-myprofile"
          //       >
          //         change password
          //       </button>
          //     </div>
          //   </div>
          <div className="profile-main-info">
            <h2 className="profile-label">Profile Details</h2>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="wish_inner_80 profile-main md:!p-[2rem]">
                  <div className="p-head-image-main">
                    <div className="profile-head">
                      {/* <h2 className="profile-label">Profile Details</h2> */}
                    </div>
                    <div className="profile-image">
                      <div className="profile-pic">
                        <label className="-label" htmlFor="file">
                          <span className="glyphicon glyphicon-camera"></span>
                          <span>Change Image</span>
                        </label>
                        <input
                          id="file"
                          type="file"
                          name="FileName"
                          accept="image/jpg, image/png, image/jpeg"
                          onChange={(e) => {
                            setFieldValue('FileName', e?.target?.files[0])
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedPicture(
                                URL.createObjectURL(e.target.files[0])
                              )
                              setFieldValue('ProfileImage', null)
                            }
                          }}
                        />
                        <Image
                          src={
                            values?.ProfileImage &&
                            values?.ProfileImage !== 'null'
                              ? encodeURI(
                                  `${reactImageUrl}${_userProfileImg_}${values?.ProfileImage}?tr=h-250,w-250,c-at_max`
                                )
                              : selectedPicture
                          }
                          alt="Selected Profile Picture"
                          id="output"
                          width={100}
                          height={100}
                          quality={100}
                        />
                        {!values?.editProfile &&
                          (values?.ProfileImage &&
                          values?.ProfileImage !== 'null' ? (
                            <div
                              className="user-profile-icon"
                              onClick={() => {
                                setFieldValue('ProfileImage', null)
                                setSelectedPicture(defaultPicture)
                                setFieldValue('FileName', null)
                              }}
                            >
                              <i className="m-icon mp-close bg-body"></i>
                            </div>
                          ) : (
                            <label htmlFor="file" className="user-lable-pro">
                              <div className="user-profile-icon">
                                <i className="m-icon m-edit-icon w-4 h-4"></i>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="profile-data !pt-0 md:pl-16">
                    <div>
                      <button
                        type="button"
                        className="text-primary underline float-end"
                        onClick={() => {
                          setFieldValue('editProfile', !values?.editProfile)
                          if (!values?.editProfile) {
                            setFieldValue('FirstName', data?.firstName ?? '')
                            setFieldValue('LastName', data?.lastName ?? '')
                            setFieldValue('Gender', data?.gender ?? '')
                          }
                        }}
                      >
                        {values?.editProfile ? 'Edit Profile' : 'Cancel'}
                      </button>
                    </div>
                    {data && (
                      <table>
                        <div>
                          <div>
                            <InputComponent
                              name="FirstName"
                              labelText={'First Name'}
                              id={'FirstName'}
                              type={'text'}
                              disabled={values?.editProfile}
                              labelClass={'sign-com-label'}
                              onChange={(e) => {
                                setFieldValue('FirstName', e?.target?.value)
                              }}
                              value={values?.FirstName}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                          <div>
                            <InputComponent
                              name={'LastName'}
                              labelText={'Last Name'}
                              id={'LastName'}
                              type={'text'}
                              disabled={values?.editProfile}
                              labelClass={'sign-com-label'}
                              onChange={(e) => {
                                setFieldValue('LastName', e?.target?.value)
                              }}
                              value={values?.LastName}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>

                          <div>
                            <InputComponent
                              name={'MobileNo'}
                              labelText={'Contact Number'}
                              id={'MobileNo'}
                              type={'number'}
                              labelClass={'sign-com-label'}
                              value={data?.mobileNo}
                              disabled={true}
                              className={
                                'profile-inp-b !bg-[#EBEBE4] cursor-not-allowed'
                              }
                            />
                          </div>

                          <div>
                            <InputComponent
                              name={'UserName'}
                              labelText={'Email Address'}
                              id={'UserName'}
                              type={'email'}
                              labelClass={'sign-com-label'}
                              className={
                                'profile-inp-b !bg-[#EBEBE4] cursor-not-allowed'
                              }
                              disabled={true}
                              value={values?.UserName?.toLowerCase()}
                              inputClass="bg-red-500"
                            />
                          </div>

                          <div>
                            <p className="form-c-label sign-com-label">
                              Gender
                            </p>
                            <div className="radio_box profile_radio !gap-[2rem] !justify-start radio_profile">
                              <IpRadio
                                rdclass={'gendar-man'}
                                labelText={<span>Male</span>}
                                id={'men'}
                                name={'Gender'}
                                disabled={values?.editProfile}
                                checked={values?.Gender === 'Male'}
                                onChange={(e) => {
                                  setFieldValue('Gender', 'Male')
                                }}
                              />

                              <IpRadio
                                rdclass={'gendar-female'}
                                labelClass={'ico_fl_mn'}
                                labelText={<span>female</span>}
                                id={'female'}
                                name={'Gender'}
                                disabled={values?.editProfile}
                                checked={values?.Gender === 'Female'}
                                onChange={(e) => {
                                  setFieldValue('Gender', 'Female')
                                }}
                              />
                              <IpRadio
                                rdclass={'gendar-notToSay'}
                                labelClass={'ico_fl_mn'}
                                labelText={<span>Not to Say</span>}
                                id={'notToSay'}
                                name={'gender'}
                                disabled={values?.editProfile}
                                checked={values?.Gender === 'Not to Say'}
                                onChange={(e) => {
                                  setFieldValue('Gender', 'Not to Say')
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </table>
                    )}
                    {!values?.editProfile && (
                      <div className="profile_gender_wrapper !mt-4  profile_btn_wrapper">
                        <div className="send-rest-forgot profile_edit_btn">
                          <button type="submit" className="m-btn btn-primary">
                            Save Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </>
  )
}

export default MyProfile
