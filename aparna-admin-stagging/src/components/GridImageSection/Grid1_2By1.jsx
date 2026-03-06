import React from 'react'
import DoubleImageContainer from './DoubleImageContainer.jsx'
import SingleImage from './SingleImage.jsx'

function Grid1_2By1({
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
    <div className='grid_1-2by1'>
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

      <DoubleImageContainer
        column='column2'
        type='top'
        data={section?.columns?.right?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize='300x300'
      />
      <SingleImage
        column='column2'
        type='bottom'
        data={section?.columns?.right?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize='600x300'
      />
    </div>
  )
}

export default Grid1_2By1
