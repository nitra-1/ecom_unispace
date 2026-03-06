import React from "react";
import Skeleton from "react-loading-skeleton";

const MainCategorySkeleton = () => {
  return (
    <div>
      <section className="mb-6">
        <div className="site-container">
          <div className="mb-8">
            <Skeleton height="32px" width="250px" borderRadius={6} />
            <Skeleton
              height="20px"
              width="180px"
              borderRadius={6}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-200 bg-white flex flex-col"
              >
                <div className="flex gap-2 items-center mb-3">
                  <Skeleton
                    containerClassName="flex-shrink-0 h-[56px] w-[56px]"
                    borderRadius={8}
                  />
                  <Skeleton className="h-[56px] w-[56px]" borderRadius={6} />
                </div>

                <ul className="space-y-1">
                  {Array.from({ length: 5 }).map((__, idx) => (
                    <li key={idx}>
                      <Skeleton height="14px" width="70%" borderRadius={4} />
                    </li>
                  ))}
                </ul>
                <Skeleton
                  height="16px"
                  width="80px"
                  borderRadius={4}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainCategorySkeleton;
