import React from 'react'
import SingleImage from './SingleImage.jsx'

function Grid1_2_1({
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
    <div className='grid_1-2-1'>
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
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize='400x400'
      />
      <SingleImage
        renderSmallImage={true}
        column='column2'
        type='top'
        data={section?.columns?.center?.top ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize='400x200'
      />
      <SingleImage
        column='column3'
        type='single'
        data={section?.columns?.right?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize='400x400'
      />
      <SingleImage
        renderSmallImage={true}
        column='column2'
        type='bottom'
        data={section?.columns?.center?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize='400x200'
      />
    </div>
  )
}

export default Grid1_2_1
