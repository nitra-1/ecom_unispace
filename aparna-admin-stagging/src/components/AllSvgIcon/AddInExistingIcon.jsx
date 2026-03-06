import React from 'react'

function AddInExistingIcon({ width, height }) {
  return (
    <div className="pv-withoutBg-main">
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        width={width ? width : `20`}
        height={height ? height : `20`}
      >
        <defs>
          <clipPath id="clip-Add_in_Existing">
            <rect width="50" height="50" />
          </clipPath>
        </defs>
        <g
          id="Add_in_Existing"
          data-name="Add in Existing"
          clipPath="url(#clip-Add_in_Existing)"
        >
          <g
            id="noun-add-to-existing-1517211"
            transform="translate(-119 -47.004)"
          >
            <path
              id="Subtraction_29"
              data-name="Subtraction 29"
              d="M13.83,27.661A1.426,1.426,0,0,1,12.4,26.238V15.256H1.423a1.425,1.425,0,0,1,0-2.85H12.4V1.425a1.425,1.425,0,1,1,2.85,0V12.407h10.98a1.425,1.425,0,1,1,0,2.85H15.255V26.238A1.426,1.426,0,0,1,13.83,27.661Z"
              transform="translate(130.649 58.651)"
            />
            <path
              id="Rectangle_208"
              data-name="Rectangle 208"
              d="M4,1.5A2.5,2.5,0,0,0,1.5,4V44A2.5,2.5,0,0,0,4,46.5H44A2.5,2.5,0,0,0,46.5,44V4A2.5,2.5,0,0,0,44,1.5H4M4,0H44a4,4,0,0,1,4,4V44a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V4A4,4,0,0,1,4,0Z"
              transform="translate(120 48.004)"
            />
          </g>
        </g>
      </svg> */}
      <svg
        width={width ? width : `20`}
        height={height ? height : `20`}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.33301 8H10.6663"
          stroke="#8E8EA9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 10.6654V5.33203"
          stroke="#8E8EA9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.99967 14.6654H9.99967C13.333 14.6654 14.6663 13.332 14.6663 9.9987V5.9987C14.6663 2.66536 13.333 1.33203 9.99967 1.33203H5.99967C2.66634 1.33203 1.33301 2.66536 1.33301 5.9987V9.9987C1.33301 13.332 2.66634 14.6654 5.99967 14.6654Z"
          stroke="#8E8EA9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  )
}

export default AddInExistingIcon
