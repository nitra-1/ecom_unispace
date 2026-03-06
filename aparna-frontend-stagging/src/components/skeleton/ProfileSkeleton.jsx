import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ProfileSkeleton = () => {
  return (
    <div className='profile-main-info'>
      <div className='wish_inner_80 profile-main'>
        <div className='p-head-image-main'>
          <div className='profile-head'>
            <h2 className='profile-label'>Profile Details</h2>
          </div>
          <div className='profile-image'>
            <div className='profile-pic'>
              <Skeleton height={110} width={110} borderRadius={5} />
            </div>
          </div>
        </div>
        <div className='profile-data'>
          {/* <Skeleton height={208} borderRadius={5} /> */}

          <table>
            <tbody>
              <tr>
                <td>Full Name:</td>
                <td className='pv-profile-data'>
                  <Skeleton />
                </td>
              </tr>

              <tr>
                <td>Mobile Number:</td>
                <td className='pv-profile-data'>
                  <Skeleton />
                </td>
              </tr>

              <tr>
                <td>Email ID:</td>
                <td className='pv-profile-data'>
                  {' '}
                  {/* {data?.userName?.toLowerCase()} */}
                  <Skeleton />
                </td>
              </tr>

              <tr>
                <td>Gender:</td>
                <td className='pv-profile-data'>
                  <Skeleton />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className='profile-edit'>
        <button
          className='m-btn btn-primary'
          onClick={() => {
            setModalOpen({ ...modalOpen, updateProfile: true })
          }}
        >
          Update Profile
        </button>
        <button
          onClick={() => {
            setModalOpen({ ...modalOpen, changePassword: true })
          }}
          className='m-btn btn-edit-myprofile'
        >
          change password
        </button>
      </div>
    </div>
  )
}

export default ProfileSkeleton
