import React from 'react'
import TooltipComponent from '../Tooltip.jsx'

const InfoRoundedIcon = ({ tooltipText }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  let fillColor = '#6c6c6c'
  let hoverColor = '101010'

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <>
      <TooltipComponent toolplace="top" tooltipText={tooltipText}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8.00008 14.6693C4.33342 14.6693 1.33342 11.6693 1.33342 8.0026C1.33342 4.33594 4.33342 1.33594 8.00008 1.33594C11.6667 1.33594 14.6667 4.33594 14.6667 8.0026C14.6667 11.6693 11.6667 14.6693 8.00008 14.6693Z"
            stroke="#666687"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8 5.33594V8.66927"
            stroke="#666687"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8.00366 10.6641H7.99767"
            stroke="#666687"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </TooltipComponent>
    </>
  )
}

export default InfoRoundedIcon
