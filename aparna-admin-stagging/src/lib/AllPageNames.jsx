export const allPages = {
  category: 'Manage Category',
  size: 'Manage Size',
  color: 'Manage Color',
  assignAttributes: 'Assign Specs to categories',
  seller: 'Manage Seller',
  hsnCode: 'HSN Code',
  manageTax: 'Manage Tax',
  manageLayout: 'Manage Layout',
  manageMenu: 'Manage Menu',
  // top Menu
  topMenu: 'Top Menu',
  bulkInquiry: 'Bulk Inquiry',
  rmcInquiry: 'RMC Inquiry',
  doorwindowInquiry: 'Door & Window Inquiry',
  kitchenwardrobeInquiry: 'Kitchen & Wardrobe Inquiry',
  //   inquiry: 'All Inquiry',
  appointment: 'Appointment',
  designServices: 'Design Services',
  refundList: 'Refund List',
  manageStaticPage: 'Manage Static Page',
  AdvancedStaticPage: 'Advanced Manage Static Page',
  manageCountry: 'Manage Country',
  manageState: 'Manage State',
  manageCity: 'Manage City',
  manageDelivery: 'Manage Delivery',
  manageSpecifications: 'Manage Specifications',
  manageShippingCharges: 'Manage Shipping Charges',
  manageChargesPaidBy: 'Manage Charges Paid By',
  ManageHSNCode: 'Manage HSN Code',
  manageInvoice: 'Invoice',
  manageAttributes: 'Manage Attributes',
  Brand: 'Brand',
  weightSlab: 'Weight Slab',
  manageAdmin: 'Manage Admin',
  manageOrderStatus: 'Manage Order Status',
  manageIssueandRejection: 'Manage Issue and Rejection',
  manageRoles: 'Manage Roles',
  manageUserRole: 'Manage User Role',
  assignPageRole: 'Assign Page Role',
  manageConfig: 'Manage Config',
  manageReturn: 'Manage Return',
  assignReturnToCategory: 'Assign Return To Category',
  manageSeller: 'Manage Seller',
  assignBrandToSeller: 'Assign Brand To Seller',
  manageCoupon: 'Manage Coupon',
  product: 'Product',
  manageSubMenu: 'Manage Sub Menu',
  manageChildMenu: 'Manage Child Menu',
  notification: 'Notification',
  lendingPage: 'Landing Page',
  //   customForm: "Custom Form",
  homePage: 'Manage Home Page',
  archiveProduct: 'Archive Product',
  addInExisting: 'Add In Existing',
  user: 'Manage User',
  order: 'Order',
  settings: 'Settings',
  logs: 'Logs',
  report: 'Report',
  assignManageSpecification: 'Assign Manage Specification',
  manageCommission: 'Manage Commission',
  extraCharges: 'Extra Charges',
  invoice: 'Invoice',
  contact: 'Contact',
  reconciliation: 'Reconciliation',
  subscription: 'Subscription',
  warranty: 'Category wise warranty',
  reviews: 'Reviews'
}

export const allCrudNames = {
  read: 'read',
  write: 'write',
  update: 'update',
  delete: 'delete'
}

// old  code
{
  /*
export const checkPageAccess = (pageAccess = [], pageNames, rightNames) => {
  if (typeof pageNames === 'string') {
    pageNames = [pageNames]
  }

  const accessiblePages = pageAccess?.filter((page) =>
    pageNames?.includes(page.pageName)
  )

  if (accessiblePages?.length === 0) {
    return false
  }

  if (!rightNames) {
    return true
  }

  if (typeof rightNames === 'string') {
    rightNames = [rightNames]
  }

  return accessiblePages?.some((page) =>
    rightNames?.some(
      (rightName) => page?.hasOwnProperty(rightName) && page[rightName]
    )
  )
}
  */
}

// update code
export const checkPageAccess = (pageAccess = [], pageNames, rightNames) => {
  if (!Array.isArray(pageAccess)) {
    return false
  }

  if (typeof pageNames === 'string') {
    pageNames = [pageNames]
  }

  const accessiblePages = pageAccess.filter((page) =>
    pageNames?.includes(page.pageName)
  )

  if (accessiblePages?.length === 0) {
    return false
  }

  // If no rights specified, access is granted based on page match
  if (!rightNames) {
    return true
  }

  // Normalize single string to array for rights
  if (typeof rightNames === 'string') {
    rightNames = [rightNames]
  }

  // Check if any matched page has at least one required right
  return accessiblePages.some((page) =>
    rightNames.some(
      (rightName) => page?.hasOwnProperty(rightName) && page[rightName]
    )
  )
}
