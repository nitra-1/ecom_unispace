import React from 'react'
import { Badge } from 'react-bootstrap'

const HKBadge = ({ badgesBgName, badgesTxtName, badgeClassName }) => {
  return (
    <div className="badges-wrraper">
      <Badge
        bg={badgesBgName || 'primary'}
        className={badgeClassName || 'text-capitalize'}
      >
        {badgesTxtName || 'Primary'}
      </Badge>
    </div>
  )
}

export default HKBadge
