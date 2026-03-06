import React from 'react'
import TooltipComponent from '../Tooltip.jsx'

const Previewicon = ({ bg, height, width }) => {
  const WithBackground = () => {
    return (
      <TooltipComponent toolplace="top" tooltipText="View Details">
        {/* <svg
          className="rounded pv-previewicon-bg"
          xmlns="http://www.w3.org/2000/svg"
          width={width ? width : `20`}
          height={height ? height : `20`}
          viewBox="0 0 20 20"
        >
          <path
            d="M18.4026 8.95314C18.6262 9.24024 18.75 9.61325 18.75 10C18.75 10.3868 18.6262 10.7598 18.4026 11.0469C16.9864 12.8125 13.7629 16.25 10 16.25C6.23708 16.25 3.01364 12.8125 1.59748 11.0469C1.37381 10.7598 1.25 10.3868 1.25 10C1.25 9.61325 1.37381 9.24024 1.59748 8.95314C3.01364 7.1875 6.23708 3.75 10 3.75C13.7629 3.75 16.9864 7.1875 18.4026 8.95314Z"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9.99949 12.7782C11.5957 12.7782 12.8896 11.5345 12.8896 10.0004C12.8896 8.4663 11.5957 7.22266 9.99949 7.22266C8.40332 7.22266 7.10938 8.4663 7.10938 10.0004C7.10938 11.5345 8.40332 12.7782 9.99949 12.7782Z"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg> */}
        <svg
          className="rounded pv-previewicon-bg"
          width={width ? width : `20`}
          height={height ? height : `20`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.7221 7.16251C14.9009 7.3922 15 7.6906 15 8.00001C15 8.30942 14.9009 8.60783 14.7221 8.83751C13.5891 10.25 11.0103 13 8.00001 13C4.98966 13 2.41091 10.25 1.27799 8.83751C1.09905 8.60783 1 8.30942 1 8.00001C1 7.6906 1.09905 7.3922 1.27799 7.16251C2.41091 5.75 4.98966 3 8.00001 3C11.0103 3 13.5891 5.75 14.7221 7.16251Z"
            stroke="#8E8EA9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M7.99959 10.2217C9.27652 10.2217 10.3117 9.22683 10.3117 7.99954C10.3117 6.77225 9.27652 5.77734 7.99959 5.77734C6.72266 5.77734 5.6875 6.77225 5.6875 7.99954C5.6875 9.22683 6.72266 10.2217 7.99959 10.2217Z"
            stroke="#8E8EA9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </TooltipComponent>
    )
  }

  const WithoutBackground = () => {
    return (
      //   <svg
      //     className="pv-previewicon"
      //     xmlns="http://www.w3.org/2000/svg"
      //     width={width ? width : `20`}
      //     height={height ? height : `20`}
      //     viewBox="0 0 20 20"
      //   >
      //     <path
      //       d="M18.4026 8.95314C18.6262 9.24024 18.75 9.61325 18.75 10C18.75 10.3868 18.6262 10.7598 18.4026 11.0469C16.9864 12.8125 13.7629 16.25 10 16.25C6.23708 16.25 3.01364 12.8125 1.59748 11.0469C1.37381 10.7598 1.25 10.3868 1.25 10C1.25 9.61325 1.37381 9.24024 1.59748 8.95314C3.01364 7.1875 6.23708 3.75 10 3.75C13.7629 3.75 16.9864 7.1875 18.4026 8.95314Z"
      //       stroke-width="1.25"
      //       stroke-linecap="round"
      //       stroke-linejoin="round"
      //     />
      //     <path
      //       d="M9.99949 12.7782C11.5957 12.7782 12.8896 11.5345 12.8896 10.0004C12.8896 8.4663 11.5957 7.22266 9.99949 7.22266C8.40332 7.22266 7.10938 8.4663 7.10938 10.0004C7.10938 11.5345 8.40332 12.7782 9.99949 12.7782Z"
      //       stroke-width="1.25"
      //       stroke-linecap="round"
      //       stroke-linejoin="round"
      //     />
      //   </svg>
      <svg
        className="pv-previewicon"
        width={width ? width : `20`}
        height={height ? height : `20`}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.7221 7.16251C14.9009 7.3922 15 7.6906 15 8.00001C15 8.30942 14.9009 8.60783 14.7221 8.83751C13.5891 10.25 11.0103 13 8.00001 13C4.98966 13 2.41091 10.25 1.27799 8.83751C1.09905 8.60783 1 8.30942 1 8.00001C1 7.6906 1.09905 7.3922 1.27799 7.16251C2.41091 5.75 4.98966 3 8.00001 3C11.0103 3 13.5891 5.75 14.7221 7.16251Z"
          stroke="#8E8EA9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.99959 10.2217C9.27652 10.2217 10.3117 9.22683 10.3117 7.99954C10.3117 6.77225 9.27652 5.77734 7.99959 5.77734C6.72266 5.77734 5.6875 6.77225 5.6875 7.99954C5.6875 9.22683 6.72266 10.2217 7.99959 10.2217Z"
          stroke="#8E8EA9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    )
  }

  return (
    <div className="pv-previewicon-main">
      {bg ? <WithBackground /> : <WithoutBackground />}
    </div>
  )
}

export default Previewicon
