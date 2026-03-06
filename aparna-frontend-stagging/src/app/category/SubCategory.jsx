"use client";

import Image from "next/image";
import Link from "next/link";
import { reactImageUrl, spaceToDash } from "@/lib/GetBaseUrl";
import { _categoryImg_ } from "@/lib/ImagePath";
import BreadCrumb from "@/components/misc/BreadCrumb";

const SubCategoryGrid = ({ subCategories, category }) => {
  const transformData = (pathIds, pathNames) => {
    if (!pathIds || !pathNames) return [{ text: "Home", link: "/" }];

    const pathIdsArray = Array.isArray(pathIds) ? pathIds : pathIds.split(">");
    const pathNamesArray = Array.isArray(pathNames)
      ? pathNames
      : pathNames.split(">");

    const result = [{ text: "Home", link: "/" }];

    for (
      let i = 0;
      i < Math.min(pathIdsArray.length, pathNamesArray.length);
      i++
    ) {
      result.push({
        text: pathNamesArray[i]?.trim(),
        link: `/category/${pathNamesArray[i]
          ?.trim()
          ?.replace(/\s+/g, "-")
          ?.toLowerCase()}?CategoryId=${pathIdsArray[i]}`,
      });
    }

    return result;
  };

  if (!subCategories || subCategories.length === 0) {
    return (
      <div className="site-container">
        <div className="flex flex-col items-center justify-center text-center p-12 my-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-slate-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-slate-700">
            No Categories Found
          </h3>
          <p className="text-slate-500 mt-2">
            There are currently no categories to display here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full h-auto ${
          category?.color === null ? "bg-primary/10" : `bg-${category?.color}`
        }`}
      >
        <div className="site-container">
          <div className="pt-4">
            <BreadCrumb
              items={transformData(category?.pathIds, category?.pathNames)}
            />
          </div>
          <div className="mx-auto grid sm:grid-cols-4 gap-5 sm:gap-10 pt-4 pb-4 sm:pb-8">
            <div className="flex flex-col gap-4 max-sm:order-1 sm:col-span-3">
              <h1 className="text-24 font-semibold text-TextTitle">
                {category?.title}
              </h1>
              <p
                dangerouslySetInnerHTML={{
                  __html: category?.description || "",
                }}
              />
            </div>
            <div className="max-sm:order-none mx-auto">
              <Image
                src={`${reactImageUrl}${_categoryImg_}${category.image}`}
                alt={category.name}
                className="w-32 sm:w-40 min-h-32 sm:min-h-40 object-contain"
                height={0}
                width={0}
                quality={100}
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4 site-container"> */}
      <div className="py-8 site-container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {subCategories.map((cat) => (
            <Link
              href={`/products/${spaceToDash(cat.name)}?CategoryId=${cat?.id}`}
              key={cat.id}
              className="group flex flex-col"
            >
              <div className="bg-[#F6F6F9] transition-all group-hover:shadow-[0_0_10px_#eee] p-5 flex items-center justify-center rounded">
                <Image
                  src={`${reactImageUrl}${_categoryImg_}${cat.image}`}
                  alt={cat.name}
                  height={400}
                  width={400}
                  quality={100}
                  sizes="100vw"
                  className="object-contain min-h-full lg:max-h-[188px]"
                />
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold text-TextTitle transition-colors cursor-pointer group-hover:underline">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default SubCategoryGrid;
