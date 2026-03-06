import React from 'react'
import DoubleImageContainer from './DoubleImageContainer'
import SingleImage from './SingleImage'

function Grid2_1By1({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete,
  fromThemePage
}) {
  return (
    <div className="grid_2-1-1">
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
        type="single"
        data={section?.columns?.center?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize="592x400"
      />
      <SingleImage
        renderSmallImage={true}
        column="column3"
        type="single"
        data={section?.columns?.right?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize="592x400"
      />
    </div>
  )
}

export default Grid2_1By1
