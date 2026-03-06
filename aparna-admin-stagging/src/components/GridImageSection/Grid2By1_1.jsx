import React from 'react'
import DoubleImageContainer from './DoubleImageContainer.jsx'
import SingleImage from './SingleImage.jsx'

function Grid2By1_1({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete
}) {
  return (
    <div className='grid_2by1-1'>
      <DoubleImageContainer
        column='column1'
        type='top'
        data={section?.columns?.left?.top ?? []}
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
        type='single'
        column='column2'
        data={section?.columns?.right?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        fromLendingPage={fromLendingPage}
        section={section}
        handleImgDelete={handleImgDelete}
        imgsize="600x600"
      />

      <SingleImage
        column='column1'
        type='bottom'
        data={section?.columns?.left?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        fromLendingPage={fromLendingPage}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        handleImgDelete={handleImgDelete}
        imgsize="600x300"
      />
    </div>
  )
}

export default Grid2By1_1
