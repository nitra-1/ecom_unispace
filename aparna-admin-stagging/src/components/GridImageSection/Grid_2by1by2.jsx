import React from 'react'
import SingleImage from './SingleImage'
import DoubleImageContainer from './DoubleImageContainer'

const Grid_2by1by2 = ({
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
    <div className="grid_2by1by2">
      <SingleImage
        column="column1"
        type="topleft"
        data={section?.columns?.left?.topleft ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="426x292"
      />
      <SingleImage
        column="column1"
        type="topright"
        data={section?.columns?.left?.topright ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="758x292"
      />
      <SingleImage
        column="column1"
        type="single"
        data={section?.columns?.left?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="1200x184"
      />
      <SingleImage
        column="column1"
        type="bottomleft"
        data={section?.columns?.left?.bottomleft ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="758x292"
      />
      <SingleImage
        column="column1"
        type="bottomright"
        data={section?.columns?.left?.bottomright ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        fromThemePage={fromThemePage}
        imgsize="426x292"
      />
    </div>
  )
}

export default Grid_2by1by2
