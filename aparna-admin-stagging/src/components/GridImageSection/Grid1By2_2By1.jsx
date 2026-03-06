import React from 'react'
import DoubleImageContainer from './DoubleImageContainer.jsx'
import SingleImage from './SingleImage.jsx'
import { useSearchParams } from 'react-router-dom'

function Grid1By2_2By1({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete,
  homepageFor,
  lendingPageFor
}) {
  return (
    <div
      className={`${
        lendingPageFor === 'mobile' || homepageFor === 'mobile'
          ? 'grid_1by2_2by1'
          : 'grid_1by2-2by1'
      }`}
    >
      <SingleImage
        column="column1"
        type="top"
        data={section?.columns?.left?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="600x300"
      />
      <DoubleImageContainer
        column="column2"
        type="top"
        data={section?.columns?.right?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="300x300"
      />

      <DoubleImageContainer
        column="column1"
        type="bottom"
        data={section?.columns?.left?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="300x300"
      />

      <SingleImage
        column="column2"
        type="bottom"
        data={section?.columns?.right?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="600x300"
      />
    </div>
  )
}

export default Grid1By2_2By1
