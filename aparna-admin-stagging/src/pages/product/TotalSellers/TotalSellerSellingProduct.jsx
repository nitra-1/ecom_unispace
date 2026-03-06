import React, { useEffect } from 'react'
import { Dropdown, DropdownButton, Offcanvas, Table } from 'react-bootstrap'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import ArchieveIcon from '../../../components/AllSvgIcon/ArchieveIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import Loader from '../../../components/Loader.jsx'
import SearchBox from '../../../components/Searchbox.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import { searchArray } from '../../../lib/AllGlobalFunction.jsx'
import { useSelector } from 'react-redux'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { _SwalDelete } from '../../../lib/exceptionMessage.jsx'

const TotalSellerSellingProduct = ({
  loading,
  modalShow,
  setModalShow,
  quickUpdate,
  setQuickUpdate,
  toast,
  handleArchive
}) => {
  let { data } = modalShow
  const [filterDetails, setFilterDetails] = useImmer({
    sellerId: null,
    searchText: ''
  })
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    if (filterDetails?.sellerId || filterDetails?.searchText) {
      let sellerList = data?.sellerProducts
      if (filterDetails?.sellerId) {
        sellerList = sellerList?.filter(
          (item) => item?.sellerID === filterDetails?.sellerId
        )
      }

      if (filterDetails?.searchText) {
        sellerList = searchArray(sellerList, filterDetails?.searchText?.trim())
      }

      setModalShow({
        ...modalShow,
        data: {
          ...modalShow?.data,
          filteredSellerProducts: sellerList
        }
      })
    }
  }, [filterDetails])
  return (
    <Offcanvas
      className="pv-offcanvas"
      placement="end"
      show={modalShow?.show}
      backdrop="static"
      onHide={() => {
        setModalShow({ show: false, type: '' })
      }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="bold">Total Seller</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="d-flex flex-wrap mb-3 card p-3 flex-row">
          {toast?.show && (
            <CustomToast text={toast?.text} variation={toast?.variation} />
          )}
          {loading && <Loader />}
          <div className="col-md-4 mt-2">
            <div className="d-flex align-content-center">
              <span className="bold">Product Name:&nbsp;</span>
              <span>{data?.productName ?? '-'}</span>
            </div>
          </div>
          <div className="col-md-4 mt-2">
            <div className="d-flex align-content-center">
              <span className="bold">Brand Name:&nbsp;</span>
              <span>{data?.sellerProducts[0]?.brandName ?? '-'}</span>
            </div>
          </div>
          <div className="col-md-4 mt-2">
            <div className="d-flex align-content-center">
              <span className="bold">Product sku Code:&nbsp;</span>
              <span>{data?.companySKUCode}</span>
            </div>
          </div>
          {data?.sellerProducts[0]?.productPrices[0]?.sizeTypeName && (
            <div className="col-md-4 mt-2">
              <div className="d-flex align-content-center">
                {/* <span className="bold">Size:&nbsp;</span>  */}
                <span className="bold">
                  {' '}
                  {`${
                    data?.sellerProducts[0]?.productPrices[0]?.sizeTypeName
                      ? 'Size'
                      : ''
                  }`}
                  &nbsp;
                </span>

                <span>
                  {data?.sellerProducts[0]?.productPrices[0]?.sizeTypeName ??
                    '-'}
                </span>
              </div>
            </div>
          )}

          <div className="col-md-4 mt-2">
            <div className="d-flex align-content-center">
              <span className="bold">Color:&nbsp;</span>
              <span>{data?.productColorMapping[0]?.colorName ?? '-'}</span>
            </div>
          </div>
          <div className="col-md-4 mt-2">
            <div className="d-flex align-content-center">
              <span className="bold">No. of Sellers:&nbsp;</span>
              <span>{data?.sellerProducts?.length}</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            <Select
              id="sellerID"
              styles={customStyles}
              menuPortalTarget={document.body}
              value={
                filterDetails?.sellerId && {
                  label: filterDetails?.sellerName,
                  value: filterDetails?.sellerId
                }
              }
              isClearable
              placeholder="Select Seller"
              options={
                data?.sellerProducts?.length > 0 &&
                data?.sellerProducts?.map(({ sellerID, sellerName }) => ({
                  value: sellerID,
                  label: sellerName
                }))
              }
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.sellerId = e?.value ?? null
                  draft.sellerName = e?.label ?? ''
                })

                let sellerProducts = data?.sellerProducts
                if (e?.value)
                  sellerProducts = sellerProducts?.filter(
                    (data) => data?.sellerID === e?.value
                  )
                setModalShow({
                  ...modalShow,
                  data: {
                    ...modalShow?.data,
                    filteredSellerProducts: sellerProducts
                  }
                })
              }}
            />
          </div>
          <div className="col-md-3">
            <SearchBox
              placeholderText={'Search'}
              searchClassNameWrapper={'searchbox-wrapper ms-auto'}
              value={filterDetails?.searchText}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.searchText = e?.target?.value ?? ''
                })

                let sellerDetails = data?.sellerProducts
                let searchResult = searchArray(
                  sellerDetails,
                  e?.target?.value?.trim()
                )
                setModalShow({
                  ...modalShow,
                  data: {
                    ...modalShow?.data,
                    filteredSellerProducts: searchResult
                  }
                })
              }}
            />
          </div>
        </div>
        {data?.filteredSellerProducts?.length > 0 && (
          <>
            <Table className="align-middle table-list mt-4 bg-white rounded">
              <thead>
                <tr>
                  <th>Seller Name</th>
                  <th>SKU Code</th>
                  <th>Unit Rate</th>
                  <th>Discounted Unit Rate</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Live</th>
                  {checkPageAccess(
                    pageAccess,
                    [allPages?.product, allPages?.archiveProduct],
                    [allCrudNames?.update, allCrudNames?.delete]
                  ) && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {data?.filteredSellerProducts?.length > 0 ? (
                  data?.filteredSellerProducts?.map((data, index) => (
                    <tr
                      className="position-relative"
                      //   key={Math.floor(Math.random() * 10000000)}
                      key={index}
                    >
                      <td>{data?.sellerName}</td>
                      <td>{data?.sellerSKU}</td>
                      <td>
                        {data?.productPrices?.reverse()[0]?.mrp}
                        {/* {Math.max(
                          ...data?.productPrices?.map((product) => product.mrp)
                        )} */}
                      </td>
                      <td>
                        {/* {Math.max(
                          ...data?.productPrices?.map(
                            (product) => product.sellingPrice
                          )
                        )} */}
                        {data?.productPrices[0]?.sellingPrice}
                      </td>
                      <td>
                        {data?.productPrices?.reduce((curr, acc) => {
                          return curr + acc.quantity
                        }, 0)}
                      </td>
                      <td>
                        <HKBadge
                          badgesBgName={
                            data?.status?.toLowerCase() === 'active'
                              ? 'success'
                              : 'danger'
                          }
                          badgesTxtName={data?.status}
                          badgeClassName={''}
                        />
                      </td>
                      <td>{data?.live ? 'Yes' : 'No'}</td>
                      {checkPageAccess(
                        pageAccess,
                        [allPages?.product, allPages?.archiveProduct],
                        [allCrudNames?.update, allCrudNames?.delete]
                      ) && (
                        <td className="text-center">
                          <DropdownButton
                            align="end"
                            title={<i className="m-icon m-icon--dots"></i>}
                            id="dropdown-menu-align-end"
                            className="custom_dropdown"
                          >
                            {checkPageAccess(
                              pageAccess,
                              allPages?.product,
                              allCrudNames?.update
                            ) && (
                              <Dropdown.Item
                                eventKey="1"
                                onClick={() => {
                                  setQuickUpdate({
                                    sellerId: data?.sellerID,
                                    id: data.productID,
                                    show: !quickUpdate.show
                                  })
                                }}
                              >
                                <EditIcon />
                                Edit
                              </Dropdown.Item>
                            )}
                            {checkPageAccess(
                              pageAccess,
                              allPages?.archiveProduct,
                              allCrudNames?.delete
                            ) &&
                              data?.status?.toLowerCase() === 'active' && (
                                <Dropdown.Item
                                  eventKey="2"
                                  onClick={() => {
                                    Swal.fire({
                                      title: 'Archive Product',
                                      text: 'Are you sure you want to archive this product?',
                                      icon: _SwalDelete.icon,
                                      showCancelButton:
                                        _SwalDelete.showCancelButton,
                                      confirmButtonColor:
                                        _SwalDelete.confirmButtonColor,
                                      cancelButtonColor:
                                        _SwalDelete.cancelButtonColor,
                                      confirmButtonText: 'Archive',
                                      cancelButtonText:
                                        _SwalDelete.cancelButtonText
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        handleArchive({
                                          productId: data?.productID,
                                          sellerProductId: data?.id
                                        })
                                      } else if (result.isDenied) {
                                      }
                                    })
                                  }}
                                >
                                  <ArchieveIcon />
                                  Archive
                                </Dropdown.Item>
                              )}
                          </DropdownButton>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      {data?.data?.message}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default TotalSellerSellingProduct
