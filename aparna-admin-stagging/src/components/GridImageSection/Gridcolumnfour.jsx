import React, { useEffect, useState } from 'react'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import DoubleImageContainer from './DoubleImageContainer.jsx'

function Gridcolumnfour({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  setModalShow,
  modalShow,
  fromLendingPage,
  handleImgDelete,
  fromThemePage
}) {
  const [data, setData] = useState()
  const prepareIdsData = (data) => {
    return data?.map((option) => option?.productId).join(',') ?? ''
  }

  const isRenderForProduct = section?.list_type
    ?.toLowerCase()
    ?.includes('product')
    ? true
    : false

  const categoryId = section?.category_id ? section?.category_id : 0
  const topProduct = section?.top_products ? section?.top_products : 0
  const productId =
    section?.columns?.left?.single?.length > 0
      ? prepareIdsData(section?.columns?.left?.single)
      : ''

  const fetchData = async (sectionId) => {
    let url = fromThemePage
      ? 'ManageThemeSection/GetProductHomePageSection'
      : 'ManageHomePageSections/GetProductHomePageSection'

    if (layoutsInfo?.layout_type_name === 'Category Grid') {
      url = 'ManageHomePageSections/getCategoryHomePageSection'
    }

    await axiosProvider({
      method: 'GET',
      endpoint: url,
      queryString: `?categoryId=${!productId ? categoryId : 0}&topProduct=${
        !productId ? topProduct : 0
      }&productId=${productId}`
    })
      .then((res) => {
        if (res.status === 200) {
          setData({ ...res, sectionId })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    if (isRenderForProduct) {
      data?.sectionId !== section?.section_id && fetchData(section?.section_id)
    }
  }, [])

  return (
    <div className="grid_column_four">
      <DoubleImageContainer
        type="top"
        data={
          isRenderForProduct
            ? data?.data?.data ?? []
            : section?.columns?.left?.single ?? []
        }
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        setModalShow={setModalShow}
        modalShow={modalShow}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="300x300"
      />
    </div>
  )
}

export default Gridcolumnfour
