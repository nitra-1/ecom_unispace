import React from 'react'
import SingleImage from './SingleImage.jsx'

function Grid1_1By1({
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
    <div className="grid_1-1by1">
      <SingleImage
        renderSmallImage={true}
        column="column1"
        type="top"
        data={section?.columns?.left?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize={'600x600'}
      />

      <SingleImage
        renderSmallImage={true}
        column="column2"
        type="single"
        data={section?.columns?.right?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize={'600x300'}
        fromThemePage={fromThemePage}
      />

      <SingleImage
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
        fromThemePage={fromThemePage}
        imgsize={'600x300'}
      />
    </div>
  )
}

export default Grid1_1By1
