import React from 'react'
import SingleImage from './SingleImage'
import DoubleImageContainer from './DoubleImageContainer'

const Grid_2By1_1By2 = ({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete,
  fromThemePage
}) => {
  return (
    <div className="grid_2by1-2by1">
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
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize="300x300"
      />
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
        fromThemePage={fromThemePage}
        imgsize="600x300"
      />
      <DoubleImageContainer
        column="column2"
        type="bottom"
        data={section?.columns?.right?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        handleImgDelete={handleImgDelete}
        imgsize="300x300"
      />
      <SingleImage
        column="column1"
        type="bottom"
        data={section?.columns?.left?.bottom ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
        section={section}
        handleImgDelete={handleImgDelete}
        imgsize="600x300"
      />
    </div>
  )
}

export default Grid_2By1_1By2
