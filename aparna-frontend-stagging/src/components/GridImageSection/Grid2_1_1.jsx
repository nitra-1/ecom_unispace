import React from 'react'
import DoubleImage from './DoubleImage'
import SingleImage from './SingleImage'

const Grid2_1_1 = ({ fromLendingPage, layoutsInfo, section }) => {
  return (
    <div className="grid_2-1-1">
      <DoubleImage
        fromLendingPage={fromLendingPage}
        data={section?.columns?.left?.bottom ?? []}
      />
      <SingleImage
        fromLendingPage={fromLendingPage}
        data={section?.columns?.center?.single ?? []}
      />
      <SingleImage
        fromLendingPage={fromLendingPage}
        data={section?.columns?.right?.single ?? []}
      />
    </div>
  )
}

export default Grid2_1_1
