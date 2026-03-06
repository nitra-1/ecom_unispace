import React from "react";

const MBtn = ({ buttonClass, btnText, iconClass, withIcon, btnPosition, ...props }) => {
  const buttonClassName = `m-btn ${buttonClass || ""}`;
  const iconClassName = `m-icon ${iconClass || ""}`;

  let alignmentClass = '';
  if (btnPosition === 'left') {
    alignmentClass = 'left';
  } else if (btnPosition === 'center') {
    alignmentClass = 'center';
  } else if (btnPosition === 'right') {
    alignmentClass = 'right';
  }

  return (
    <div className={`pv-btnposition-${alignmentClass}`}>
      <button className={buttonClassName} {...props}>
        {withIcon ? <i className={`${iconClassName}`}></i> : ""}
        {btnText}
      </button>
    </div>
  );
};

export default MBtn;
