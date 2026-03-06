import React from 'react'
import TooltipComponent from '../Tooltip.jsx'

const PlusIcon = ({ bg }) => {
  const WithBackground = () => {
    return (
      // onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} fill={isHovered ? bgfillhovercolor : bgfillstaticolor} style={{ "width": "2rem", "height": "2rem", "backgroundColor": `${isHovered ? bghoverColor : bgfillColor}` }}
      <TooltipComponent toolplace="top" tooltipText="Add">
        <svg
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          width="2rem"
          height="2rem"
          viewBox="0 0 18.411 18.411"
          className="rounded p-1 pv-addicon-bg"
        >
          <g
            id="Group_2156"
            data-name="Group 2156"
            transform="translate(-322.178 -656.178)"
          >
            <g
              id="Group_2047"
              data-name="Group 2047"
              transform="translate(-0.072 13.928)"
            >
              <g
                id="Icon-5"
                data-name="Icon"
                transform="translate(327.466 647.466)"
              >
                <g id="Icon-6" data-name="Icon" transform="translate(0 0)">
                  <line
                    id="Line-3"
                    data-name="Line"
                    y2="8.19"
                    transform="translate(4.095)"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  />
                  <line
                    id="Line-4"
                    data-name="Line"
                    x2="8.19"
                    transform="translate(0 4.095)"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </TooltipComponent>
    )
  }

  const WithoutBackground = () => {
    return (
      <TooltipComponent toolplace="top" tooltipText="Add">
        <svg
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18.411 18.411"
          width="2rem"
          height="2rem"
          className="rounded pv-addicon"
        >
          <g
            id="Group_2156"
            data-name="Group 2156"
            transform="translate(-322.178 -656.178)"
          >
            <g
              id="Group_2047"
              data-name="Group 2047"
              transform="translate(-0.072 13.928)"
            >
              <g
                id="Icon-5"
                data-name="Icon"
                transform="translate(327.466 647.466)"
              >
                <g id="Icon-6" data-name="Icon" transform="translate(0 0)">
                  <line
                    id="Line-3"
                    data-name="Line"
                    y2="8.19"
                    transform="translate(4.095)"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  />
                  <line
                    id="Line-4"
                    data-name="Line"
                    x2="8.19"
                    transform="translate(0 4.095)"
                    fill="none"
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </TooltipComponent>
    )
  }

  // if (bg) {
  //     return <WithBackground />;
  // } else {
  //     return <WithoutBackground />;
  // }
  return (
    <div className="pv-addicon-main">
      {bg ? <WithBackground /> : <WithoutBackground />}
    </div>
  )
}

export default PlusIcon
