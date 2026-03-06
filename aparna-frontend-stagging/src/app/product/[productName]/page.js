import apiPath from "@/api-urls";
import ProductDetailsPage from "./(components)/ProductDetailsPage";
import { fetchServerSideApi } from "@/security/Token";
import { reactImageUrl, truncateParagraph } from "@/lib/GetBaseUrl";
import { _productImg_ } from "@/lib/ImagePath";

export async function generateMetadata({ searchParams }) {
  const { productGuid } = searchParams;
  let meta = false;
  const queryParams = `?ProductGUID=${productGuid}`;
  const fetchMetadata = async () => {
    try {
      const res = await fetchServerSideApi({
        endpoint: apiPath?.getProductDetailsMetadata,
        queryParams,
      });
      meta = res?.data;
    } catch (error) {
      return error;
    }
  };
  await fetchMetadata();

  return {
    title: meta?.metaTitle ? meta?.metaTitle : meta?.customeProductName,
    description: meta?.metaDescription
      ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ""))
      : truncateParagraph(meta?.description?.replace(/<[^>]+>/g, "")),
    keywords: meta?.keywords,
    openGraph: {
      title: meta?.metaTitle ? meta?.metaTitle : meta?.customeProductName,
      description: meta?.metaDescription
        ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ""))
        : truncateParagraph(meta?.description?.replace(/<[^>]+>/g, "")),
      images: [
        meta?.productImage && meta?.productImage !== ""
          ? reactImageUrl + _productImg_ + meta?.productImage
          : "/images/logo.png",
      ],
    },
  };
}

const page = async ({ searchParams }) => {
  const { productGuid } = searchParams;
  if (!productGuid) {
    return {
      notFound: true,
    };
  }

  const queryParams = `?Guid=${productGuid}`;

  const getProducts = await fetchServerSideApi({
    endpoint: apiPath.getUserProductDetails,
    queryParams,
  })
    .then((response) => {
      if (response?.code) {
        return response;
      } else {
        return [];
      }
    })
    .catch((error) => {
      return error;
    });

  const getProductsResponse = JSON.parse(JSON.stringify(getProducts));

  return <ProductDetailsPage product={getProductsResponse} />;
};

export default page;
