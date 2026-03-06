// import Skeleton from 'react-loading-skeleton'
// import 'react-loading-skeleton/dist/skeleton.css'

// const OrderDetailSkeleton = () => {
//   const SkeletonRows = () => {
//     const skeletonRows = new Array(4).fill().map((_, index) => (
//       <li key={index}>
//         <Skeleton height={60} />
//       </li>
//     ))

//     return <>{skeletonRows}</>
//   }
//   return (
//     <div className="site-container">
//       <div className="wish_main_flex">
//         <div className="wish_inner_20">
//           <div className="order-sidebar-main">
//             <h1 className="order-menu-title">
//               <Skeleton />
//             </h1>
//             <div className="order-menu">
//               <ul className="order-menu-list gap-2">
//                 <SkeletonRows />
//               </ul>
//             </div>
//           </div>
//         </div>
//         <div className="wish_inner_80-details">
//           <div className="orderconfirm-main orderconfirm-details-bg p-4">
//             <div className="order-title-orderid">
//               <div className="titlebar-order-section">
//                 <h1 className="order-menu-title-orderid">
//                   <span className="font-semibold">
//                     <Skeleton height={20} width={400} />
//                   </span>
//                 </h1>
//               </div>
//             </div>
//             <div className="order-details-header">
//               <div className="flex items-center mt-3">
//                 {/* <Image
//                   alt={`${data?.mainData?.productName}`}
//                   src={encodeURI(
//                     `${reactImageUrl}${_orderImg_}${data?.mainData?.productImage}`
//                   )}
//                   width={140}
//                   height={150}
//                 ></Image> */}

//                 <Skeleton height={200} width={200} />
//               </div>
//               <div className="order-details-title">
//                 <span className="font-semibold">
//                   <Skeleton height={20} width={500} />
//                 </span>
//               </div>
//               <div className={'order-details-confirmed-badge-skeleton'}>
//                 <Skeleton height={40} />
//               </div>

//               <div className="express-day-box">
//                 <Skeleton height={30} width={200} />
//               </div>
//             </div>

//             {/* <OrderSkeleton showMenu={false} /> */}
//           </div>

//           <div className="orderconfirm-main orderconfirm-details-bg p-2">
//             <Skeleton height={130} />
//           </div>

//           <div className="orderconfirm-main orderconfirm-details-bg p-2">
//             <Skeleton height={150} />
//           </div>

//           <div className="orderconfirm-main orderconfirm-details-bg p-2">
//             <Skeleton height={140} />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default OrderDetailSkeleton

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const OrderDetailSkeleton = () => {
  const SkeletonRows = () => {
    const skeletonRows = new Array(4).fill().map((_, index) => (
      <li key={index}>
        <Skeleton height={60} />
      </li>
    ))

    return skeletonRows
  }
  return (
    <>
      <div className="wish_main_flex w-full">
        <div className="w-full">
          {/* Breadcrumb Skeleton */}
          <div className="breadcrumb_wrapper mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Skeleton width={60} height={20} />
                </div>
              ))}
            </div>
          </div>
          <h1 className="mb-4 p-3 bg-[#fbfbfb] shadow rounded-xl w-full">
            <span className="font-semibold inline-block w-full">
              <div className="flex w-full">
                <Skeleton containerClassName="flex-1" height={20} />
              </div>
            </span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="orderconfirm-details-bg col-span-3">
              <div className="">
                <div className="sm:flex items-center order-product-list-image-info mb-4 shadow">
                  <div
                    href={`/`}
                    className="order-list-product-image !h-[120px] !w-[120px] rounded"
                  >
                    <div>
                      <Skeleton width={110} height={100} />
                    </div>
                  </div>

                  <div className="order-details-title">
                    <div>
                      <span className="font-semibold mb-3 line-clamp-1">
                        <Skeleton width={300} height={20} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Skeleton width={100} height={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-[#FBFBFB] rounded-[12px] mb-4 p-4 shadow">
                  <p className="order-details-badge-title flex gap-3">
                    <Skeleton width={32} height={32} />

                    <Skeleton width={150} height={20} />
                  </p>
                  <span className="order-details-badge-desc pb-2 mb-2 border-b border-[eeeeee6f]">
                    <Skeleton width={140} height={25} />
                  </span>
                  <Skeleton width={200} height={100} />

                  <div className="order-title-orderid">
                    <div className="titlebar-order-section !p-0">
                      <h2 className="order-menu-title-orderid">
                        <Skeleton width={100} height={30} />
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-[eeeeee6f]">
                    <Skeleton width={180} height={20} />
                    <Skeleton width={130} height={30} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 !m-0 border-1 border-[#CBD5E1] rounded">
                <Skeleton width={100} height={25} />

                <Skeleton width={80} height={30} />
              </div>
            </div>
            <div className="orderconfirm-details-bg col-span-2">
              <div className="order-details-address p-6 mb-4 bg-[#fbfbfb]">
                <div className="">
                  <Skeleton width={130} height={20} />

                  <Skeleton width={100} height={30} />

                  <Skeleton width={200} height={20} />

                  <Skeleton width={150} height={20} />
                </div>
              </div>
              <div className="order-details-address p-4 !rounded-t !rounded-none bg-[#fbfbfb]">
                <div className="flex gap-2">
                  <Skeleton width={32} height={32} />

                  <Skeleton width={150} height={20} />
                </div>
                <div className="font-09-rem mt-2">
                  <span>
                    <Skeleton width={200} height={30} />
                  </span>
                  <br />
                  <span className="capitalize text-1rem">
                    <Skeleton width={150} height={20} />
                  </span>
                  <br />
                  <span className="text-1rem">
                    <Skeleton width={130} height={30} />
                  </span>
                </div>
              </div>
              <span className="border-t border-[#eeeeee6f] !rounded-b-lg !rounded-none  order-details-address p-6 mb-4 bg-[#fbfbfb]">
                <h3 className="font-bold text-[1.2rem] mb-2">
                  <Skeleton width={150} height={25} />
                </h3>

                <table
                  className="order-price-list"
                  style={{ width: '100%', borderCollapse: 'collapse' }}
                >
                  <tbody>
                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} /> {/* MRP (X item) */}
                      </td>
                      <td className="text-end font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end text-[#2A8703] font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    {/* Coupon Discount */}
                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    {/* Extra Charges - 2 rows */}
                    {[...Array(2)].map((_, i) => (
                      <tr key={`extra-skel-${i}`}>
                        <td className="text-start">
                          <Skeleton width={120} />
                        </td>
                        <td className="text-end font-bold py-2">
                          <Skeleton width={60} />
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    <tr>
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end font-bold py-2">
                        <Skeleton width={60} />
                      </td>
                    </tr>

                    <tr className="border-t border-[eeeeee6f]">
                      <td className="text-start">
                        <Skeleton width={120} />
                      </td>
                      <td className="text-end font-bold py-4">
                        <Skeleton width={80} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </span>

              <span className="mt-3">
                <Skeleton height={40} className="!w-full" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailSkeleton
