import React from 'react'
import MBtn from '../base/MBtn'

const FilterBadgesWatching = ({ text, ...props }) => {
  return (
    text && (
      <MBtn
        buttonClass={'filterbadges_btn'}
        btnText={text}
        withIcon
        iconClass={'closetoggle-icon'}
        {...props}
      />
    )
  )
}

export default FilterBadgesWatching
