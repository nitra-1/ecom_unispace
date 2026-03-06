import React, { Suspense, useEffect, useState } from 'react'
import { Image, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Toggle from 'react-toggle'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../../components/AllSvgIcon/EditIcon.jsx'
import Previewicon from '../../../../components/AllSvgIcon/Previewicon.jsx'
import BasicFilterComponents from '../../../../components/BasicFilterComponents.jsx'
import Loader from '../../../../components/Loader.jsx'
import RecordNotFound from '../../../../components/RecordNotFound.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import {
  convertStringFormat,
  encodedSearchText,
  showToast
} from '../../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _categoryImg_ } from '../../../../lib/ImagePath.jsx'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../../lib/useDebounce.js'

const SubCategoryDetails = React.lazy(() => import('./SubCategoryDetails.jsx'))
const SubCategoryForm = React.lazy(() => import('./SubCategoryForm.jsx'))

const SubCategoryList = ({
  initialValues,
  modalShow,
  setModalShow,
  setInitialValues
}) => {
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [allState, setAllState] = useImmer({
    mainCategory: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: '',
      hasInitialized: false
    }
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const debounceSearchText = useDebounce(searchText, 500)
  const location = useLocation()

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SubCategory/search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })
      if (response?.status === 200) {
        setData(response)
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
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'SubCategory',
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      if (response?.data?.code === 200) {
        // After delete, refresh main categories
        const mainCatResponse = await axiosProvider({
          method: 'GET',
          endpoint: 'SubCategory/bindMainCategories',
          queryString: '?pageIndex=1&pageSize=20'
        })
        if (mainCatResponse?.status === 200) {
          const newOptions = Array.isArray(mainCatResponse.data?.data)
            ? mainCatResponse.data.data.map(
                ({ id, pathNames, currentLevel }) => ({
                  value: id,
                  label: convertStringFormat(pathNames),
                  currentLevel
                })
              )
            : []
          setAllState((draft) => {
            draft.mainCategory.data = newOptions
            draft.mainCategory.page = 1
            draft.mainCategory.hasMore = newOptions.length >= 20
            draft.mainCategory.loading = false
            draft.mainCategory.hasInitialized = true
          })
        }
        if (filterDetails?.pageIndex > 1 && data?.data?.data?.length === 1) {
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

  const onSubmit = async (values, resetForm) => {
    let seokeywords = values.metaKeywords.toString()

    let subCategoryData = {
      Name: values.name ?? '',
      ParentId: values.parentId,
      MetaTitles: !values.metaTitles ? '' : values.metaTitles,
      MetaDescription: !values.metaDescription ? '' : values.metaDescription,
      MetaKeywords: !seokeywords ? '' : seokeywords,
      FileName: values.filename,
      CurrentLevel: values?.id
        ? values?.currentLevel
        : values?.currentLevel + 1,
      Status: values?.status,
      IsImageAvailable: values?.filename || values?.image ? true : false,
      SubTitle: values?.subTitle ?? '',
      title: values?.title ?? '',
      Description: values?.description ?? ''
    }

    if (values?.id) {
      subCategoryData = { ...subCategoryData, Id: values?.id }
    }

    const subCategoryForm = new FormData()

    const keys = Object.keys(subCategoryData)

    keys.forEach((key) => {
      subCategoryForm.append(key, subCategoryData[key])
    })

    try {
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `SubCategory`,
        data: subCategoryForm,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(false)

      if (response?.data?.code === 200) {
        if (typeof values?.index === 'number' && values.index >= 0) {
          let updatedArray = [...data?.data?.data]
          if (updatedArray.length > 0) {
            updatedArray[values?.index].status = values.status
            setData({
              ...data,
              data: { ...data?.data, data: updatedArray }
            })
          }
        } else {
          // Refetch mainCategory list and put the latest at the top
          const fetchMainCategories = async () => {
            try {
              const mainCatResponse = await axiosProvider({
                method: 'GET',
                endpoint: 'SubCategory/bindMainCategories',
                queryString: '?pageIndex=1&pageSize=20'
              })
              if (mainCatResponse?.status === 200) {
                const newOptions = Array.isArray(mainCatResponse.data?.data)
                  ? mainCatResponse.data.data.map(
                      ({ id, pathNames, currentLevel }) => ({
                        value: id,
                        label: convertStringFormat(pathNames),
                        currentLevel
                      })
                    )
                  : []
                // Place the newly created category at the top if found
                if (newOptions.length > 0 && response?.data?.data?.id) {
                  const latestId = response.data.data.id
                  const latestOption = newOptions.find(
                    (opt) => opt.value === latestId
                  )
                  const rest = newOptions.filter(
                    (opt) => opt.value !== latestId
                  )
                  setAllState((draft) => {
                    draft.mainCategory.data = latestOption
                      ? [latestOption, ...rest]
                      : newOptions
                    draft.mainCategory.page = 1
                    draft.mainCategory.hasMore = newOptions.length >= 20
                    draft.mainCategory.loading = false
                    draft.mainCategory.hasInitialized = true
                  })
                } else {
                  setAllState((draft) => {
                    draft.mainCategory.data = newOptions
                    draft.mainCategory.page = 1
                    draft.mainCategory.hasMore = newOptions.length >= 20
                    draft.mainCategory.loading = false
                    draft.mainCategory.hasInitialized = true
                  })
                }
              }
            } catch (e) {
              // ignore
            }
          }
          await fetchMainCategories()
          resetForm({ values: '' })
          fetchData()
          setModalShow({ show: false, type: '' })
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

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim()
        draft.pageIndex = 1
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 1
      })
    }
  }, [debounceSearchText])

  return (
    <React.Fragment>
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
            <th>Sub Categories</th>
            <th>Parent Name</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((subCategoryData, index) => (
                <tr key={subCategoryData.id}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      <Image
                        src={
                          subCategoryData?.image
                            ? `${process.env.REACT_APP_IMG_URL}${_categoryImg_}${subCategoryData.image}`
                            : 'https://placehold.jp/50x50.png'
                        }
                        className="img-thumbnail table-img-box"
                      />
                      <span>{subCategoryData.name}</span>
                    </div>
                  </td>
                  <td>
                    {subCategoryData?.parentName} <br />
                    <small>
                      {convertStringFormat(subCategoryData?.parentPathNames)}
                    </small>
                  </td>
                  <td className="text-center">
                    <Toggle
                      id="cheese-status"
                      checked={subCategoryData?.status === 'Active'}
                      disabled={
                        !checkPageAccess(
                          pageAccess,
                          allPages?.category,
                          allCrudNames?.update
                        )
                      }
                      onChange={(e) => {
                        const values = {
                          ...subCategoryData,
                          status: e?.target?.checked ? 'Active' : 'Inactive',
                          index: index
                        }
                        Swal.fire({
                          title: `Are you sure you want to ${values?.status} this Sub Category ?`,
                          text: '',
                          icon: _SwalDelete.icon,
                          showCancelButton: _SwalDelete.showCancelButton,
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
                          cancelButtonColor: _SwalDelete.cancelButtonColor,
                          confirmButtonText: 'Yes',
                          cancelButtonText: _SwalDelete.cancelButtonText
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onSubmit(values)
                          }
                        })
                      }}
                    />
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <span
                        onClick={() => {
                          setModalShow({ show: true, type: 'details' })
                          setInitialValues(subCategoryData)
                        }}
                      >
                        <Previewicon bg={'bg'} />
                      </span>
                      {checkPageAccess(
                        pageAccess,
                        allPages?.category,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={() => {
                            setModalShow({ show: true, type: 'form' })
                            setInitialValues({
                              ...subCategoryData,
                              metaKeywords: subCategoryData?.metaKeywords
                                ? subCategoryData?.metaKeywords?.split(',')
                                : []
                            })
                          }}
                        >
                          <EditIcon bg={'bg'} />
                        </span>
                      )}

                      {checkPageAccess(
                        pageAccess,
                        allPages?.category,
                        allCrudNames?.delete
                      ) && (
                        <span
                          onClick={() => {
                            Swal.fire({
                              title: _SwalDelete.title,
                              text: _SwalDelete.text,
                              icon: _SwalDelete.icon,
                              showCancelButton: _SwalDelete.showCancelButton,
                              confirmButtonColor:
                                _SwalDelete.confirmButtonColor,
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(subCategoryData.id)
                              } else if (result.isDenied) {
                              }
                            })
                          }}
                        >
                          <DeleteIcon bg={'bg'} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={4} className="text-center">
                    <RecordNotFound />
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

      {toast?.show && !modalShow?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && !modalShow?.show && <Loader />}

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === 'form' && (
          <SubCategoryForm
            initialValues={initialValues}
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            onSubmit={onSubmit}
            allState={allState}
            setAllState={setAllState}
          />
        )}

        {modalShow?.show && modalShow?.type === 'details' && (
          <SubCategoryDetails
            initialValues={initialValues}
            setModalShow={setModalShow}
            modalShow={modalShow}
          />
        )}
      </Suspense>
    </React.Fragment>
  )
}

export default SubCategoryList
