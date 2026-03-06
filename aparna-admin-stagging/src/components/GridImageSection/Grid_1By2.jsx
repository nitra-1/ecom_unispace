import React from "react";
import DoubleImageContainer from "./DoubleImageContainer.jsx";
import SingleImage from "./SingleImage.jsx";

const Grid_1By2 = ({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete,
}) => {
  return (
    <div className="grid_1by2">
      <SingleImage
        column="column1"
        type="single"
        data={section?.columns?.left?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="600x300"
      />
      <DoubleImageContainer
        column="column2"
        type="single"
        data={section?.columns?.right?.single ?? []}
        layoutsInfo={layoutsInfo}
        layoutDetails={layoutDetails}
        setLayoutDetails={setLayoutDetails}
        handleDelete={handleDelete}
        section={section}
        fromLendingPage={fromLendingPage}
        handleImgDelete={handleImgDelete}
        imgsize="300x300"
      />
    </div>
  );
};

export default Grid_1By2;
