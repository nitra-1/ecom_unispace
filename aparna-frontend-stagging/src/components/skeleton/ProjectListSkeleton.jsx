import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProjectListSkeleton = () => {
  return [...Array(3)].map((_, i) => (
    <div
      key={i}
      className="rounded-xl bg-white p-0 shadow-sm border border-[#cdc9c9]"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <Skeleton className="h-5 w-40 mb-2" /> {/* Project Name */}
          <Skeleton className="h-4 w-24" /> {/* Product Count */}
        </div>
        <Skeleton className="h-5 w-5 rounded-full" /> {/* Chevron/Icon */}
      </div>
      <div className="px-4 pb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
      </div>
    </div>
  ));
};

export default ProjectListSkeleton;
