import React from 'react'
import { _homePageImg_ } from '../../lib/ImagePath.jsx'

const BottomImage = ({
  bottom,
  layoutsInfo,
  section,
  handleDelete,
  layoutDetails,
  setLayoutDetails
}) => {
  const fixedLengthArray = Array.from({ length: 2 })

  const renderComponent = (card, imgPath) => {
    return (
      <div key={card?.id ? card?.id : Math.floor(Math.random() * 100000)}>
        <a href='#'>
          <img
            onClick={() => {
              let layoutTypeDetailsId = layoutsInfo?.layout_details?.find(
                (obj) => obj?.section_type?.toLowerCase() === 'bottom'
              )?.layout_type_detail_id
              setLayoutDetails({
                show: !layoutDetails?.show,
                sectionId: section?.section_id,
                minImagesLength: 2,
                maxImagesLength: 2,
                layoutTypeDetailsId
              })
            }}
            style={{ width: '100%' }}
            src={
              card?.image
                ? `${process.env.REACT_APP_IMG_URL}${_homePageImg_}${card?.image}`
                : imgPath
            }
          />
        </a>
      </div>
    )
  }
  return (
    <>
      {bottom
        ?.map((obj) => renderComponent(obj))
        .concat(
          bottom?.length < 2 &&
            Array(2 - bottom?.length || 0)
              .fill(null)
              .map((_, index) =>
                renderComponent(null, 'https://placehold.jp/300x300.png')
              )
        )}
    </>
  )
}

export default BottomImage
