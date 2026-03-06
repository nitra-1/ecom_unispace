import React from "react";
import Link from "next/link";

function SectionTitle({ titleText, isViewAllVisible, Viewlink }) {
  return (
    <div className="section-titel-wrapper">
      <h2 className="section-titel-name">{titleText}</h2>
      {isViewAllVisible ? (
        <Link href={Viewlink} className="section-titel-viewall">
          View all <i className="m-icon viewall-icon"></i>
        </Link>
      ) : (
        ""
      )}
    </div>
  );
}
export default SectionTitle;
