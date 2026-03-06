import { convertStringFormat } from '../lib/AllGlobalFunction'
import { isAllowCustomProductName } from '../lib/AllStaticVariables'

export const selectOptionConfig = {
  taxValue: {
    endpoint: 'TaxTypeValue/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  hsn: {
    endpoint: 'HSNCode/search',
    pageSize: 20,
    mapper: ({ id, hsnCode }) => ({ value: id, label: hsnCode })
  },
  tax: {
    endpoint: 'Tax/search',
    pageSize: 20,
    mapper: ({ id, taxType }) => ({ value: id, label: taxType })
  },
  taxType: {
    endpoint: 'TaxType/byParentId',
    pageSize: 20,
    mapper: ({ id, taxType }) => ({ value: id, label: taxType })
  },
  category: {
    endpoint: 'MainCategory/getAllCategory',
    pageSize: 20,
    mapper: ({ id, pathNames }) => ({ value: id, label: pathNames })
  },
  subCategory: {
    endpoint: 'SubCategory/search',
    pageSize: 20,
    mapper: ({ id, pathNames }) => ({ value: id, label: pathNames })
  },
  endCategory: {
    endpoint: 'MainCategory/getEndCategory',
    pageSize: 20,
    mapper: ({ id, pathNames, name }) => ({
      value: id,
      label: pathNames,
      categoryName: name
    })
  },
  mainCategory: {
    endpoint: 'SubCategory/bindMainCategories',
    pageSize: 20,
    mapper: ({ id, pathNames, currentLevel }) => ({
      value: id,
      label: convertStringFormat(pathNames),
      currentLevel
    })
  },
  staticPage: {
    endpoint: 'ManageStaticPages/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  landingPage: {
    endpoint: 'LendingPage/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  collection: {
    endpoint: 'ManageCollection/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  brand: {
    endpoint: 'Brand/BindBrands',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  specification: {
    endpoint: 'MainCategory/GetAllSpecFilters',
    pageSize: 20,
    mapper: ({ specTypeId, specTypeName }) => ({
      value: specTypeId,
      label: specTypeName
    })
  },
  brandSearch: {
    endpoint: 'Brand/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  collectionByType: {
    endpoint: 'ManageCollection/byType',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  country: {
    endpoint: 'Country/Search',
    pageSize: 20,
    mapper: ({ id, name, status }) => ({ value: id, label: name, status })
  },
  stateByCountry: {
    endpoint: 'State/ByCountryId',
    pageSize: 20,
    mapper: ({ id, name, status }) => ({ value: id, label: name, status })
  },
  cityByState: {
    endpoint: 'City/ByStateId',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  userRoleType: {
    endpoint: 'GetAllRoleTypes',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  noSuperAdminAccount: {
    endpoint: 'Account/Admin/NoSuperAdminList',
    pageSize: 20,
    mapper: ({ id, userName, userTypeId, firstName, lastName }) => ({
      value: id,
      label: `${firstName} ${lastName} - ${userName}`,
      roleTypeId: userTypeId
    })
  },
  returnAction: {
    endpoint: 'ManageOrder/GetReturnActions',
    pageSize: 20,
    mapper: ({ id, returnAction }) => ({ value: id, label: returnAction })
  },
  issueTypeByAction: {
    endpoint: 'IssueType/byActionId',
    pageSize: 20,
    mapper: ({ id, issue }) => ({ value: id, label: issue })
  },
  configKey: {
    endpoint: 'ManageConfigkey/search',
    pageSize: 20,
    mapper: ({ id, name }) => ({ value: id, label: name })
  },
  sizeType: {
    endpoint: 'SizeType/search',
    pageSize: 20,
    mapper: ({ id, typeName }) => ({ value: id, label: typeName })
  },
  product: {
    endpoint: 'Product/GetAllProduct',
    pageSize: 20,
    mapper: ({ id, productName, customeProductName, companySKUCode }) => ({
      value: id,
      label: isAllowCustomProductName
        ? `${customeProductName} (${companySKUCode})`
        : productName
    })
  },
  productByGuId: {
    endpoint: 'Product/GetAllProduct',
    pageSize: 20,
    mapper: ({ guid, productName, companySKUCode }) => ({
      value: guid,
      label: `${productName} (${companySKUCode})`
    })
  },
  seller: {
    endpoint: 'SellerData/BindUsers',
    pageSize: 20,
    mapper: ({ userId, displayName, shipmentBy, shipmentPaidByName }) => ({
      value: userId,
      label: displayName,
      shipmentBy: shipmentBy,
      shipmentPaidBy: shipmentPaidByName
    })
  },
  users: {
    endpoint: 'CustomerData/search',
    pageSize: 20,
    mapper: ({ id, firstName, lastName, userName }) => ({
      value: id,
      label: `${firstName} ${lastName} - ${userName}`
    })
  },
  inquiry: {
    endpoint: 'ManageInquiryForm',
    pageSize: 20,
    mapper: ({ id, name }) => ({
      value: id,
      label: name
    })
  },
  formSteps: {
    endpoint: 'ManageFormSteps',
    pageSize: 20,
    mapper: ({ id, name, linkWith, formName }) => ({
      value: id,
      label: `${name} - ${formName}`,
      linkWith
    })
  },
  formStepsField: {
    endpoint: 'ManageFormStepsField',
    pageSize: 20,
    mapper: ({ id, title }) => ({
      value: id,
      label: title
    })
  }
}
