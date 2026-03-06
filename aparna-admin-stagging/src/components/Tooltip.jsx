import React from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

const TooltipComponent = (props) => {
  return (
    <>
      <OverlayTrigger
        trigger={['hover', 'focus']}
        key={props.toolplace}
        placement={props.toolplace}
        overlay={
          <Tooltip
            id={`tooltip-${props.toolplace}`}
            style={{ position: 'fixed' }}
          >
            {props.tooltipText}
          </Tooltip>
        }
      >
        {props.children}
      </OverlayTrigger>
    </>
  )
}
export default TooltipComponent
