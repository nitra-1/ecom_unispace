import apiPath from "@/api-urls";
import {
  getSiteUrl,
  objectToQueryString,
  validateQuery,
} from "@/lib/GetBaseUrl";
import { fetchServerSideApi } from "@/security/Token";
import ProductListPage from "../products/(product-helper)/ProductListPage";

export const metadata = {
  title: "Explore Collections - Aparna",
  description:
    "Discover curated collections of top-rated, trending, and seasonal products on Aparna. Shop by category and find exactly what you need.",
  keywords:
    "product collections, trending products, top-rated items, shop by category, Aparna collections",
  openGraph: {
    title: "Shop Curated Product Collections - Aparna",
    description:
      "Explore Aparna's curated product collections to find bestsellers, new arrivals, and handpicked items across all categories.",
    url: `${getSiteUrl()}collections`,
    siteName: "Aparna",
    images: [
      {
        url: `${getSiteUrl()}images/collections-banner.png`,
        width: 1200,
        height: 630,
        alt: "Product Collections - Aparna",
      },
    ],
    type: "website",
  },
};

const page = async ({ searchParams }) => {
  let query = objectToQueryString(
    {
      ...searchParams,
      productCollectionId: searchParams?.productCollectionId,
    },
    true
  );

  if (query) {
    const isValid = validateQuery(query);
    if (!isValid) return { data: null, code: 500 };
  }

  if (!searchParams?.productCollectionId) {
    return { notFound: true };
  }
  const queryParams = `?${query}&pageIndex=1&pageSize=10`;

  const getProducts = await fetchServerSideApi({
    endpoint: apiPath.getUserProduct,
    queryParams,
  })
    .then((response) => {
      if (response) {
        return response;
      }
    })
    .catch((error) => {
      return error;
    });

  const getProductsResponse = JSON.parse(JSON.stringify(getProducts));

  return <ProductListPage products={getProductsResponse} module="collection" />;
};

export default page;
