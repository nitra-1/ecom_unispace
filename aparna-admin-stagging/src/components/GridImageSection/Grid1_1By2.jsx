import React from 'react'
import DoubleImageContainer from './DoubleImageContainer.jsx'
import SingleImage from './SingleImage.jsx'

function Grid1_1By2({
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
    <div className='grid_1-1by2'>
      <SingleImage
        column='column1'
        type='single'
        data={section?.columns?.left?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize='600x600'
      />
      <SingleImage
        column='column2'
        type='top'
        data={section?.columns?.right?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        section={section}
        handleImgDelete={handleImgDelete}
        imgsize='600x300'
      />
      <DoubleImageContainer
        column='column2'
        type='bottom'
        data={section?.columns?.right?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize='300x300'
      />
    </div>
  )
}

export default Grid1_1By2
