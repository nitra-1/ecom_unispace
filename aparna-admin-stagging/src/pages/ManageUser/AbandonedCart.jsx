import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Offcanvas, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useLocation, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Previewicon from '../../components/AllSvgIcon/Previewicon'
import BasicFilterComponents from '../../components/BasicFilterComponents'
import Loader from '../../components/Loader'
import RecordNotFound from '../../components/RecordNotFound'
import { encodedSearchText, showToast } from '../../lib/AllGlobalFunction'
import { pageRangeDisplayed } from '../../lib/AllStaticVariables'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception } from '../../lib/exceptionMessage'

const ProductCartDetails = lazy(() => import('./ProductCartDetails'))

const AbandonedCart = ({ activeDetails }) => {
  const location = useLocation()
  const [searchText, setSearchText] = useState('')
  const dataId = parseInt(location?.href?.split('#')[2])
  const navigate = useNavigate()
  const [data, setData] = useState()
  const [showOffCanvas, setShowOffCanvas] = useState({
    show: false,
    title: '',
    content: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Cart/AbandonedCart',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText?.trim()
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })
      if (response?.status === 200) {
        setData(response)
      }

      if (dataId) {
        const data = response?.data?.data?.find((item) => item?.id === dataId)
        setShowOffCanvas({
          show: true,
          title: 'Product Details',
          content: <ProductCartDetails data={data} />
        })
      }
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
  }, [
    filterDetails?.pageIndex,
    filterDetails?.pageSize,
    filterDetails?.searchText
  ])

  const handlePageClick = useCallback(
    (event) => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setFilterDetails((draft) => {
        draft.pageIndex = event.selected + 1
      })
    },
    [setFilterDetails]
  )

  const OffCanvasComponent = ({ show, onHide, title, children }) => {
    return (
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="end"
        className="pv-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{children}</Offcanvas.Body>
      </Offcanvas>
    )
  }

  const handleClose = () => {
    navigate(`${location?.pathname}#cart`)
    setShowOffCanvas({ show: false, title: '', content: '' })
  }

  const LinkRender = () => {
    return (
      <OffCanvasComponent
        show={showOffCanvas?.show}
        onHide={handleClose}
        title={showOffCanvas?.title}
      >
        {showOffCanvas?.content}
      </OffCanvasComponent>
    )
  }

  useEffect(() => {
    fetchData()
  }, [fetchData, filterDetails])

  return (
    <React.Fragment>
      {loading && <Loader />}
      <LinkRender />

      <div className="d-flex align-items-center mb-3 gap-3">
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
            <th>User Name</th>
            <th>Email Id</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>
                    {data?.firstName} {data?.lastName}
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                      {data?.userName}
                    </div>
                  </td>
                  <td>{data?.mobileNo}</td>
                  <td
                    onClick={() => {
                      setShowOffCanvas({
                        show: true,
                        title: 'Product Details',
                        content: <ProductCartDetails data={data} />
                      })
                    }}
                    className="text-center"
                  >
                    <Previewicon bg={'bg'} />
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={4} className="text-center">
                    <RecordNotFound showSubTitle={false} />
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

      <Suspense fallback={<Loader />}>
        {showOffCanvas?.show && <ProductCartDetails />}
      </Suspense>
    </React.Fragment>
  )
}

export default AbandonedCart
