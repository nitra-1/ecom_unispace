import React, { useState, useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables'
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap'
import '../../../css/_reviews-approval.scss'
import axiosProvider from '../../../lib/AxiosProvider'
import { _exception, _SwalDelete } from '../../../lib/exceptionMessage'
import DescriptionModal from '../../../components/DescriptionModal'
import { useImmer } from 'use-immer'
import { encodedSearchText, showToast } from '../../../lib/AllGlobalFunction'
import { _productImg_, _productRating_ } from '../../../lib/ImagePath'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader'
import { useSelector } from 'react-redux'
import CustomToast from '../../../components/Toast/CustomToast'
import Swal from 'sweetalert2'
import BasicFilterComponents from '../../../components/BasicFilterComponents'
import useDebounce from '../../../lib/useDebounce'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'

const ProductReviewsApproval = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [modalImage, setModalImage] = useState(null)
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [modalShow, setModalShow] = useState({ show: false, type: '' })
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const debounceSearchText = useDebounce(searchText, 500)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    status: 'In Review',
    searchText: ''
  })

  const openImageModal = (images, index = 0) => {
    setModalImage(images)
    setCurrentImageIndex(index)
  }

  const closeImageModal = () => {
    setModalImage(null)
    setCurrentImageIndex(0)
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ProductRating/bySearch',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&status=${filterDetails?.status}&pageIndex=${
          filterDetails?.pageIndex
        }&pageSize=${filterDetails?.pageSize}`
      })
      if (response?.status === 200) {
        const rawDataArray = response?.data?.data

        const updatedData = rawDataArray.map((item) => {
          const productImages = [
            item.image1,
            item.image2,
            item.image3,
            item.image4,
            item.image5
          ].filter(Boolean)

          return {
            ...item,
            productImages
          }
        })

        setData({
          ...response,
          data: {
            ...response?.data,
            data: updatedData
          }
        })
      }
    } catch (err) {
      console.log(err)
      // showToast(toast, setToast, {
      //   data: {
      //     message: _exception?.message,
      //     code: 204
      //   }
      // })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = ({ reviewId, status }) => {
    Swal.fire({
      title: `Are you sure want to ${
        status === 'Approved' ? 'approve' : 'reject'
      } this review?`,
      text: '',
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true)
          const response = await axiosProvider({
            method: 'PUT',
            endpoint: 'ProductRating/RatingApprovedAndRejected',
            queryString: `?Id=${reviewId}&Status=${status}`,
            userId: userInfo?.userId,
            location: location.pathname
          })
          if (response?.data?.code === 200) {
            if (
              filterDetails?.pageIndex > 1 &&
              data?.data?.data?.length === 1
            ) {
              setFilterDetails((draft) => {
                draft.pageIndex = filterDetails?.pageIndex - 1
              })
            } else {
              fetchData()
            }
          }
          showToast(toast, setToast, response)
        } catch {
          showToast(toast, setToast, {
            data: {
              message: _exception?.message,
              code: 204
            }
          })
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`review-star ${
          i < rating ? 'text-warning-b' : 'text-secondary-b'
        }`}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="#FFA500"
        width="18"
        height="18"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === modalImage.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? modalImage.length - 1 : prevIndex - 1
    )
  }

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText
        draft.pageIndex = 1
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 1
      })
    }
  }, [debounceSearchText])

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  return (
    <>
      {loading && <Loader />}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <div className="reviews-approval-container">
        <div className="reviews-header">
          <div className="custom-tabs ">
            <button
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('pending')
                setFilterDetails((draft) => {
                  draft.status = 'In Review'
                  draft.pageIndex = 1
                })
              }}
            >
              <span className="tab-label">Req. for Approvel</span>
              <span className="tab-indicator"></span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('approved')
                setFilterDetails((draft) => {
                  draft.status = 'Approved'
                  draft.pageIndex = 1
                })
              }}
            >
              <span className="tab-label">Approved</span>
              <span className="tab-indicator"></span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('rejected')
                setFilterDetails((draft) => {
                  draft.status = 'Rejected'
                  draft.pageIndex = 1
                })
              }}
            >
              <span className="tab-label">Rejected</span>
              <span className="tab-indicator"></span>
            </button>
          </div>
          {data && (
            <BasicFilterComponents
              data={data}
              filterDetails={filterDetails}
              setFilterDetails={setFilterDetails}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          )}
        </div>

        <Table responsive className="align-middle table-list">
          <thead>
            <tr>
              <th>Customer & Rating</th>
              <th>Order number</th>
              <th
                style={{
                  width: '30%'
                }}
              >
                Review
              </th>
              <th>Images</th>
              <th>Details</th>
              <th
                style={{
                  width: '20%'
                }}
              >
                Product
              </th>
              {checkPageAccess(
                pageAccess,
                [allPages?.reviews],
                allCrudNames?.update
              ) && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data?.data?.data?.length > 0
              ? data?.data?.data?.map((review) => (
                  <>
                    <tr key={review.id} className="position-relative">
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <div>
                            <Link
                              to={`/users/manage-user/${review?.userId}`}
                              target="_blank"
                              className="mb-1 fw-medium"
                            >
                              {review?.username}
                            </Link>
                            <div className="d-flex align-items-center gap-1">
                              {renderStars(review?.rate)}
                              <span className="text-muted medium">
                                ({review?.rate}/5)
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="text-muted medium">
                            {review?.orderNo}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="">
                          {review?.title || review?.comments ? (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>{review?.title}</Tooltip>}
                              >
                                <strong
                                  className="mb-0 text-truncate d-inline-flex"
                                  style={{ maxWidth: '200px' }}
                                >
                                  {review?.title}
                                </strong>
                              </OverlayTrigger>
                              <p className="mb-0">
                                {review?.comments?.length > 100 ? (
                                  <>
                                    {(review?.comments).slice(0, 100)}
                                    ...
                                    <span
                                      onClick={() =>
                                        setModalShow({
                                          show: true,
                                          type: 'description',
                                          comment: review?.comments,
                                          title: review?.title
                                        })
                                      }
                                      className="text-link cursor-pointer-tooltip"
                                    >
                                      Show More
                                    </span>
                                  </>
                                ) : (
                                  review?.comments
                                )}
                              </p>
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>

                      <td>
                        {review?.productImages &&
                        review?.productImages.length > 0 ? (
                          <div className="position-relative">
                            <img
                              src={`${process.env.REACT_APP_IMG_URL}${_productRating_}${review?.productImages[0]}?tr=h-100,w-100,c-at_max`}
                              alt="Review"
                              className="img-thumbnail cursor-pointer"
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'contain'
                              }}
                              onClick={() =>
                                openImageModal(review?.productImages, 0)
                              }
                            />
                            {review?.productImages.length > 1 && (
                              <span
                                className="badge bg-secondary position-absolute top-0 translate-middle"
                                style={{ fontSize: '10px' }}
                              >
                                +{review?.productImages.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">No images</span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {/* <div className="">
                            <span className="fw-medium">Order No: </span>
                            {review?.orderNo}
                          </div> */}
                          <div className="">
                            <span className="fw-medium">Review Date: </span>
                            {new Date(review?.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-2 align-items-center overflow-hidden">
                          <img
                            src={
                              `${process.env.REACT_APP_IMG_URL}${_productImg_}${review.productImage}?tr=h-100,w-100,c-at_max` ||
                              'https://placehold.co/60x60?text=No+Image'
                            }
                            alt={review?.productName}
                            className="img-thumbnail"
                            style={{ width: '50px', height: '50px' }}
                          />
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{review?.productName}</Tooltip>}
                          >
                            <p
                              className="mb-0 text-truncate"
                              style={{ maxWidth: '200px' }}
                            >
                              {review?.productName}
                            </p>
                          </OverlayTrigger>
                        </div>
                      </td>
                      {checkPageAccess(
                        pageAccess,
                        [allPages?.reviews],
                        allCrudNames?.update
                      ) && (
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            {(activeTab === 'approved' ||
                              activeTab === 'pending') && (
                              <button
                                className="btn btn-sm btn-danger"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onClick={() =>
                                  handleChange({
                                    reviewId: review.id,
                                    status: 'Rejected'
                                  })
                                }
                                title="Reject"
                              >
                                <svg
                                  className="reject-icon"
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            )}
                            {(activeTab === 'rejected' ||
                              activeTab === 'pending') && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() =>
                                  handleChange({
                                    reviewId: review.id,
                                    status: 'Approved'
                                  })
                                }
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Approve"
                              >
                                <svg
                                  className="approve-icon"
                                  viewBox="0 0 24 24"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  </>
                ))
              : !loading && (
                  <tr>
                    <td colSpan={7} className="text-center">
                      <div className="empty-state py-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="empty-icon mb-3"
                        >
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                        </svg>
                        <h5 className="empty-title">No reviews found</h5>
                        <p className="empty-message text-muted">
                          No reviews match the current filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
          </tbody>
        </Table>

        {data?.data?.pagination?.pageCount > 0 && (
          <ReactPaginate
            className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
            breakLabel="..."
            nextLabel=""
            onPageChange={handlePageClick}
            pageRangeDisplayed={pageRangeDisplayed}
            pageCount={data?.data?.pagination?.pageCount}
            previousLabel=""
            renderOnZeroPageCount={null}
            forcePage={filterDetails?.pageIndex - 1}
          />
        )}

        {modalImage && (
          <div className="image-modal-overlay" onClick={closeImageModal}>
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {modalImage?.length > 1 && (
                <button
                  className="nav-arrow left-arrow"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}

              <img
                src={`${process.env.REACT_APP_IMG_URL}${_productRating_}${modalImage[currentImageIndex]}?tr=h-400,w-400,c-at_max`}
                alt={`Review ${currentImageIndex + 1}`}
                className="modal-image"
              />

              {modalImage?.length > 1 && (
                <button
                  className="nav-arrow right-arrow"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}

              <button className="close-modal-btn" onClick={closeImageModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <DescriptionModal
        show={modalShow?.show && modalShow?.type === 'description'}
        onClose={() => setModalShow({ show: false })}
        description={modalShow.comment}
        title={modalShow?.title}
      />
    </>
  )
}

export default ProductReviewsApproval
