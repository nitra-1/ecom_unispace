import { getBaseUrl } from './lib/GetBaseUrl'

const baseUrl = getBaseUrl()

const apiPath = {
  getHomePage: baseUrl + `ManageHomePageSection/GetNewHomePageSection`,
  getLendingPage: baseUrl + `ManageLendingPageSection/GetNewLendingPageSection`,
  getStaticPages: baseUrl + 'ManageStaticPages',
  getStaticPagesDetails: baseUrl + 'ManageStaticPages/byId',
  getStaticPagesDetailsBySearch: baseUrl + 'ManageStaticPages/search',
  getMenu: baseUrl + 'ManageHomePageSection/GetMenu',
  getTopMenu: baseUrl + 'TopHeaderMenu/search',
  getOrders: baseUrl + 'User/Order/bysearchText',
  getOrder: baseUrl + 'User/Order/byId',
  getUserProduct: baseUrl + 'user/Product',
  getUserProductDetails: baseUrl + 'user/Product/NewProductDetails',
  getNewUserProductList: baseUrl + 'user/Product/NewProductList',
  getProductFilter: baseUrl + 'user/Product/ProductFilters',
  getProductDetailsMetadata: baseUrl + 'user/Product/seo',
  getProductListMetadata: baseUrl + 'user/Product/ProductSeo',
  getBrandMetadata: baseUrl + 'user/Product/BrandSeo',
  getBrands: baseUrl + 'MainCategory/GetCategoryWiseBrands',
  getBrandsById: baseUrl + 'Brand',
  getCategory: baseUrl + 'MainCategory/GetAllCategory',
  getSpecifications: baseUrl + `MainCategory/GetAllCategoryFilters`
}

export default apiPath
