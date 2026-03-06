import { allCrudNames, allPages, checkPageAccess } from './AllPageNames'

export const isMarketPlace = true
export const setMarginOnProductLevel = false
export const isMarginOnProductLevel = false
export const shippingOnCategoryLevel = false
export const maxWarehouseQty = 1000000
export const pageRangeDisplayed = 2
export const isAdharCardAllowed = false
export const isShippingOnCat = false
export const isSellerWithGST = true
export const isAllowOneProductMultipleSeller = false
export const isAllowPriceVariant = true
export const isAllowWarehouseManagement = true
export const isAllowExpiryDate = false
export const currencyIcon = '₹'
export const isAllowMultipleGST = false
export const isInventoryModel = false
export const isAllowCommissionInVariant = true
export const isMasterAdmin = [
  'harsh.p@hashtechy.com',
  'vipul.p@hashtechy.com',
  'admin@hashtechy.com'
]
export const isSellerPanel = false
export const isAllowTaxPro = false
export const dateFormat = 'DD/MM/YYYY / hh:mm:ss A'
export const isMoqAvailable = false
export const isAllowCustomProductName = true
export const signalRURL =
  'https://api.aparna.hashtechy.space/Hubs/uploadProgressHub'
export const notificationURL =
  'https://api.aparna.hashtechy.space/Hubs/notificationsLiveHub'

export const fontSizeConfig = {
  options: ['tiny', 'small', 'big', 'default']
}

export const headingStyles = {
  options: [
    { model: 'paragraph', title: 'Normal' },
    { model: 'heading1', view: 'h2', title: 'Heading 2' },
    { model: 'heading2', view: 'h3', title: 'Heading 3' },
    { model: 'heading3', view: 'h4', title: 'Heading 4' },
    { model: 'heading4', view: 'h5', title: 'Heading 5' },
    { model: 'heading5', view: 'h6', title: 'Heading 6' }
  ]
}

export const _orderStatus_ = {
  partial: 'Partial',
  cancelled: 'Cancelled',
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  ship: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  returnRejected: 'Return Rejected',
  returnRequest: 'Return Requested',
  returnApproved: 'Return Approved',
  replaced: 'Replaced',
  replaceRequest: 'Replace Requested',
  replaceRejected: 'Replace Rejected',
  replaceApproved: 'Replace Approved',
  partialDelivered: 'Partial Delivered',
  partialConfirmed: 'Partial Confirmed',
  partialPacked: 'Partial Packed',
  partialShipped: 'Partial Shipped',
  exchanged: 'Exchanged',
  initiate: 'Initiate',
  failed: 'Failed'
}

export const productStatus = [
  { value: 'Active', label: 'Active' },
  {
    value: 'Inactive',
    label: 'Inactive'
  },
  {
    value: 'Bulk Upload',
    label: 'Bulk Upload'
  }
]

export const redirectTo = [
  { value: 'Product List', label: 'Product List' },
  { value: 'Category List', label: 'Category List' },
  {
    value: 'Brand List',
    label: 'Brand List'
  },
  {
    label: 'Specification list',
    value: 'Specification list'
  },
  {
    value: 'Static Page',
    label: 'Static Page'
  },
  {
    value: 'Landing Page',
    label: 'Landing Page'
  },
  // {
  //   value: 'Collection Page',
  //   label: 'Collection Page'
  // },
  {
    label: 'Kitchen Inquiry',
    value: 'Kitchen Inquiry'
  },
  {
    label: 'Bulk Inquiry',
    value: 'Bulk Inquiry'
  },
  {
    label: 'RMC Inquiry',
    value: 'RMC Inquiry'
  },
  {
    label: 'Wardrobe Inquiry',
    value: 'Wardrobe Inquiry'
  },
  {
    label: 'Door Inquiry',
    value: 'Door Inquiry'
  },
  {
    label: 'Windows Inquiry',
    value: 'Windows Inquiry'
  },
  {
    value: 'Custom link',
    label: 'Custom link'
  }
]

export const ckEditorConfig = {
  toolbar: [
    '|',
    'bold',
    'italic',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'undo',
    'redo'
  ]
}

export const _offerType_ = [
  { label: 'Percentage', value: 'percentage discount' },
  { label: 'Flat Discount', value: 'flat discount' },
  { label: 'Free Shipping', value: 'free shipping' }
]

export const _status_ = [
  {
    label: 'Active',
    value: 'Active'
  },
  {
    label: 'Inactive',
    value: 'Inactive'
  }
]

export const videoFormats = [
  'mp4',
  'avi',
  'mov',
  'mkv',
  'wmv',
  'flv',
  'webm',
  'mpeg',
  '3gp'
]

export const chargesIn = [
  {
    label: 'Absolute',
    value: 'Absolute'
  },
  {
    label: 'Percentage',
    value: 'Percentage'
  }
]

export const sidebarTabs = (pageAccess) => {
  return [
    {
      name: 'Dashboard',
      isAllowed: true,
      pathname: '/dashboard',
      icon: 'm-icon--dashboard',
      activeKey: 'dashboard'
    },
    {
      name: 'Product',
      isAllowed: checkPageAccess(
        pageAccess,
        [allPages?.product, allPages?.archiveProduct],
        allCrudNames?.read
      ),
      pathname: '/manage-product',
      icon: 'm-icon--products',
      activeKey: 'product',
      childMenu: [
        {
          name: 'Manage Product',
          pathname: '/manage-product',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.product,
            allCrudNames?.read
          ),
          childMenu: [
            {
              name: 'Add Product',
              pathname: '/manage-product/add-product',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.archiveProduct,
                allCrudNames?.read
              )
            }
          ]
        },
        // updated code
        {
          name: 'Add Existing Product',
          pathname: '/existing-product',
          isAllowed:
            !isInventoryModel &&
            checkPageAccess(
              pageAccess,
              allPages?.addInExisting,
              allCrudNames?.read
            ),
          activeKey: 'manage-product'
        },
        {
          name: 'Archive Products',
          pathname: '/manage-product/archive-products',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.archiveProduct,
            allCrudNames?.read
          ),
          activeKey: 'manage-product'
        }
      ]
    },
    {
      name: 'Order',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.order,
        allCrudNames?.read
      ),
      pathname: '/order',
      icon: 'm-icon--orders',
      activeKey: 'order',
      childMenu: [
        { name: 'All Orders', pathname: '/order', isAllowed: true },
        {
          name: 'Product Returns',
          pathname: '/order/return-list',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Initiate Orders',
          pathname: '/order/initiate-order',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Failed Orders',
          pathname: '/order/failed-order',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Refund List',
          pathname: '/order/refund-list',
          isAllowed: true,
          activeKey: 'order'
        }
      ]
    },
    {
      name: 'Customer Invoice',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.invoice,
        allCrudNames?.read
      ),
      pathname: '/customer-invoice',
      icon: 'm-icon--invoices',
      activeKey: 'customer invoice'
    },
    {
      name: 'Seller',
      isAllowed:
        !isInventoryModel &&
        checkPageAccess(pageAccess, allPages?.manageSeller, allCrudNames?.read),
      pathname: '/manage-seller',
      icon: 'm-icon--sellers',
      activeKey: 'seller'
    },
    {
      name: 'Warehouse',
      isAllowed:
        isInventoryModel &&
        checkPageAccess(pageAccess, allPages?.manageSeller, allCrudNames?.read),
      pathname: '/im-warehouse',
      icon: 'm-icon--sellers',
      activeKey: 'warehouse'
    },
    {
      name: 'Brand',
      isAllowed: checkPageAccess(
        pageAccess,
        [allPages?.Brand, allPages?.assignBrandToSeller],
        allCrudNames?.read
      ),
      pathname: '/manage-brand',
      icon: 'm-icon--brands',
      activeKey: 'brand'
    },
    {
      name: 'Catalogue',
      isAllowed: checkPageAccess(
        pageAccess,
        [
          allPages?.category,
          allPages?.size,
          allPages?.color,
          allPages?.assignAttributes,
          allPages?.manageSpecifications
        ],
        allCrudNames?.read
      ),
      pathname: '/category/manage-category',
      icon: 'm-icon--Categories',
      activeKey: 'category',
      childMenu: [
        {
          name: 'Category',
          pathname: '/category/manage-category',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.category,
            allCrudNames?.read
          ),
          activeKey: 'category'
        },
        {
          name: 'Attributes',
          pathname: '/category/manage-attributes',
          isAllowed: checkPageAccess(
            pageAccess,
            [allPages?.size, allPages?.color, allPages?.manageSpecifications],
            allCrudNames?.read
          ),
          activeKey: 'category'
        },
        {
          name: 'Assign Attributes',
          pathname: '/category/assign-category',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.assignAttributes,
            allCrudNames?.read
          ),
          activeKey: 'category',
          childMenu: [
            {
              name: 'Edit Attributes',
              pathname: '/category/assign-category/manage-filter',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.category,
                allCrudNames?.read
              )
            }
          ]
        }
      ]
    },
    {
      name: 'User Details',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.user,
        allCrudNames?.read
      ),
      pathname: '/users/manage-user',
      icon: 'm-icon--User',
      activeKey: 'userDetails'
    },
    {
      name: 'Report',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.report,
        allCrudNames?.read
      ),
      pathname: '/report',
      icon: 'm-icon--reports',
      activeKey: 'report'
    },
    {
      name: 'Reconciliation',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.reconciliation,
        allCrudNames?.read
      ),
      pathname: '/reconciliation',
      icon: 'm-icon--reconciliation',
      activeKey: 'reconciliation'
    },
    {
      name: 'Coupon',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.manageCoupon,
        allCrudNames?.read
      ),
      pathname: '/manage-coupons',
      icon: 'm-icon--coupons',
      activeKey: 'coupon'
    },
    {
      name: 'Rating & Review',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.reviews,
        allCrudNames?.read
      ),
      pathname: '/reviews',
      icon: 'm-icon--ratting',
      activeKey: 'reviews'
    },

    // {
    //   name: "Settings",
    //   isAllowed: checkPageAccess(
    //     pageAccess,
    //     [
    //       allPages?.hsnCode,
    //       allPages?.assignTaxRateToHSN,
    //       allPages?.manageTax,
    //       allPages?.manageLayout,
    //       allPages?.manageMenu,
    //       allPages?.flashSaleTabbing,
    //       allPages?.productCollection,
    //       allPages?.manageStaticPage,
    //       allPages?.homePage,
    //       allPages?.lendingPage,
    //       allPages?.manageCountry,
    //       allPages?.manageState,
    //       allPages?.manageCity,
    //       allPages?.manageDelivery,
    //       allPages?.weightSlab,
    //       allPages?.manageAdmin,
    //       allPages?.manageIssueandRejection,
    //       allPages?.manageChargesPaidBy,
    //       allPages?.manageConfig,
    //       allPages?.manageReturn,
    //       allPages?.assignReturnToCategory,
    //     ],
    //     allCrudNames?.read
    //   ),
    //   pathname: "/settings",
    //   icon: "m-icon--setting",
    //   activeKey: "settings",
    // },
    {
      name: 'Settings',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.settings,
        allCrudNames?.read
      ),
      pathname: '/settings',
      icon: 'm-icon--setting',
      activeKey: 'settings'
    },
    {
      name: 'Logs',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.logs,
        allCrudNames?.read
      ),
      pathname: '/logs',
      icon: 'm-icon--Logs',
      activeKey: 'logs'
    }
  ]
}

export const globalSearchData = (pageAccess, userInfo) => {
  return [
    {
      name: 'Dashboard',
      isAllowed: true,
      pathname: '/dashboard',
      activeKey: 'dashboard'
    },
    {
      name: 'Product',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.product,
        allCrudNames?.read
      ),
      pathname: '/manage-product',
      activeKey: 'product'
    },
    {
      name: 'Order',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.order,
        allCrudNames?.read
      ),
      pathname: '/order',
      activeKey: 'order',
      childMenu: [
        { name: 'All Orders', pathname: '/order', isAllowed: true },
        {
          name: 'Product Returns',
          pathname: '/order/return-list',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Initiate Orders',
          pathname: '/order/initiate-order',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Failed Orders',
          pathname: '/order/failed-order',
          isAllowed: true,
          activeKey: 'order'
        },
        {
          name: 'Refund List',
          pathname: '/order/refund-list',
          isAllowed: true,
          activeKey: 'order'
        }
      ]
    },
    {
      name: 'Customer Invoice',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.invoice,
        allCrudNames?.read
      ),
      pathname: '/customer-invoice',
      activeKey: 'customer invoice'
    },
    {
      name: 'Seller',
      isAllowed:
        !isInventoryModel &&
        checkPageAccess(pageAccess, allPages?.manageSeller, allCrudNames?.read),
      pathname: '/manage-seller',
      activeKey: 'seller',
      childMenu: [
        { name: 'Seller', pathname: '/manage-seller', isAllowed: true },
        {
          name: 'Seller archive',
          pathname: '/manage-seller#archived',
          isAllowed: true
        },
        {
          name: 'Seller suspended',
          pathname: '/manage-seller#suspended',
          isAllowed: true,
          activeKey: 'seller'
        }
      ]
    },
    {
      name: 'Brand',
      isAllowed: checkPageAccess(
        pageAccess,
        [allPages?.Brand, allPages?.assignBrandToSeller],
        allCrudNames?.read
      ),
      pathname: '/manage-brand',
      activeKey: 'brand',
      childMenu: [
        { name: 'Brand', pathname: '/manage-brand#brand', isAllowed: true },
        {
          name: 'Assign Brand To Seller',
          pathname: '/manage-brand#assign-brand',
          isAllowed: true
        }
      ]
    },
    {
      name: 'Catalogue',
      isAllowed: checkPageAccess(
        pageAccess,
        [
          allPages?.category,
          allPages?.size,
          allPages?.color,
          allPages?.assignAttributes,
          allPages?.manageSpecifications
        ],
        allCrudNames?.read
      ),
      pathname: '/category/manage-category',
      activeKey: 'category',
      childMenu: [
        {
          name: 'Category',
          pathname: '/category/manage-category',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.category,
            allCrudNames?.read
          ),
          activeKey: 'category',
          childMenu: [
            {
              name: 'Main Category',
              pathname: '/category/manage-category#main',
              isAllowed: true
            },
            {
              name: 'Sub Category',
              pathname: '/category/manage-category#sub',
              isAllowed: true
            }
          ]
        },
        {
          name: 'Attributes',
          pathname: '/category/manage-attributes',
          isAllowed: checkPageAccess(
            pageAccess,
            [allPages?.size, allPages?.color, allPages?.manageSpecifications],
            allCrudNames?.read
          ),
          activeKey: 'category',
          childMenu: [
            {
              name: 'Size',
              pathname: '/category/manage-attributes#size',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.size,
                allCrudNames?.read
              )
            },
            {
              name: 'Color',
              pathname: '/category/manage-attributes#colors',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.color,
                allCrudNames?.read
              )
            },
            {
              name: 'Specification',
              pathname: '/category/manage-attributes#specification',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageSpecifications,
                allCrudNames?.read
              )
            }
          ]
        },
        {
          name: 'Assign Attributes',
          pathname: '/category/assign-category',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.assignAttributes,
            allCrudNames?.read
          ),
          activeKey: 'category'
        }
      ]
    },
    {
      name: 'User Details',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.user,
        allCrudNames?.read
      ),
      pathname: '/users/manage-user',
      activeKey: 'userDetails',
      childMenu: [
        {
          name: 'User',
          pathname: '/users/manage-user#user',
          isAllowed: true
        },
        {
          name: 'Abandoned Cart',
          pathname: '/users/manage-user#cart',
          isAllowed: true
        }
      ]
    },
    {
      name: 'Report',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.report,
        allCrudNames?.read
      ),
      pathname: '/report',
      activeKey: 'report',
      childMenu: [
        {
          name: 'Order Report',
          pathname: '/report#order',
          isAllowed: true
        },
        {
          name: 'Product Report',
          pathname: '/report#product',
          isAllowed: true
        },
        {
          name: 'Commission Report',
          pathname: '/report#commission',
          isAllowed: true
        }
      ]
    },
    {
      name: 'Review',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.reviews,
        allCrudNames?.read
      ),
      pathname: '/reviews',
      activeKey: 'reviews',
      childMenu: [
        {
          name: 'Product Review',
          pathname: '/report#product-review',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.reviews,
            allCrudNames?.read
          )
        },
        {
          name: 'GBA Review',
          pathname: '/report#gba-review',
          isAllowed: checkPageAccess(
            pageAccess,
            allPages?.reviews,
            allCrudNames?.read
          )
        }
      ]
    },
    {
      name: 'Reconciliation',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.reconciliation,
        allCrudNames?.read
      ),
      pathname: '/reconciliation',
      activeKey: 'reconciliation'
    },
    {
      name: 'Coupon',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.manageCoupon,
        allCrudNames?.read
      ),
      pathname: '/manage-coupons',
      activeKey: 'coupon',
      childMenu: [
        {
          name: 'Active Coupons',
          pathname: '/manage-coupons#active-coupons',
          isAllowed: true
        },
        {
          name: 'Expire Coupons',
          pathname: '/manage-coupons#expired-coupons',
          isAllowed: true
        }
      ]
    },
    {
      name: 'Settings',
      isAllowed: checkPageAccess(
        pageAccess,
        [
          allPages?.hsnCode,
          allPages?.assignTaxRateToHSN,
          allPages?.manageTax,
          allPages?.manageLayout,
          allPages?.manageMenu,
          allPages?.flashSaleTabbing,
          allPages?.productCollection,
          allPages?.manageStaticPage,
          allPages?.homePage,
          allPages?.lendingPage,
          allPages?.manageCountry,
          allPages?.manageState,
          allPages?.manageCity,
          allPages?.manageDelivery,
          allPages?.weightSlab,
          allPages?.manageAdmin,
          allPages?.manageIssueandRejection,
          allPages?.manageChargesPaidBy,
          allPages?.manageConfig,
          allPages?.manageReturn,
          allPages?.assignReturnToCategory,
          allPages?.topMenu,
          allPages.bulkInquiry,
          allPages.rmcInquiry
        ],
        allCrudNames?.read
      ),
      pathname: '/settings',
      icon: 'm-icon--setting',
      activeKey: 'settings',
      childMenu: [
        {
          name: 'Finance',
          pathname: '/settings/finance',
          isAllowed: checkPageAccess(
            pageAccess,
            [
              allPages?.manageCommission,
              allPages?.extraCharges,
              allPages?.hsnCode,
              allPages?.assignTaxRateToHSN,
              allPages?.manageTax
            ],
            allCrudNames?.read
          ),
          childMenu: [
            {
              name: 'Commission Management',
              pathname: '/settings/finance/#commission-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageCommission,
                allCrudNames?.read
              )
            },
            {
              name: 'Extra Charges Setup',
              pathname: '/settings/finance/#extra-charges-setup',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.extraCharges,
                allCrudNames?.read
              )
            },
            {
              name: 'HSN Code Management',
              pathname: '/settings/finance/#hsn-code-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.hsnCode,
                allCrudNames?.read
              )
            },
            {
              name: 'Tax Settings',
              pathname: '/settings/finance/#tax-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageTax,
                allCrudNames?.read
              )
            },
            {
              name: 'Category Based Warranty',
              pathname: '/settings/finance/#category-based-warranty',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.warranty,
                allCrudNames?.read
              )
            }
          ]
        },
        {
          name: 'Appearance',
          pathname: '/settings/appearance',
          isAllowed: checkPageAccess(
            pageAccess,
            [
              allPages?.manageLayout,
              allPages?.manageMenu,
              allPages?.topMenu,
              allPages?.flashSaleTabbing,
              allPages?.productCollection,
              allPages?.manageStaticPage,
              allPages?.homePage,
              allPages?.lendingPage
            ],
            allCrudNames?.read
          ),
          childMenu: [
            {
              name: 'Layout Customization',
              pathname: '/settings/appearance/#layout-customization',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageLayout,
                allCrudNames?.read
              )
            },
            {
              name: 'Menu Configuration',
              pathname: '/settings/appearance/#menu-configuration',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageMenu,
                allCrudNames?.read
              )
            },
            {
              name: 'Book Appointment',
              pathname: '/settings/appearance/#top-menu',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.topMenu,
                allCrudNames?.read
              )
            },
            {
              name: 'Flash Sale Collection Setup',
              pathname: '/settings/appearance/#flash-sale-collection-setup',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.flashSaleTabbing,
                allCrudNames?.read
              )
            },
            {
              name: 'Collection Management',
              pathname: '/settings/appearance/#collection-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.productCollection,
                allCrudNames?.read
              )
            },
            {
              name: 'Static Pages Settings',
              pathname: '/settings/appearance/#static-page-settings',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageStaticPage,
                allCrudNames?.read
              )
            },
            {
              name: 'Homepage Customization',
              pathname: '/settings/appearance/#homepage-customization',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.homePage,
                allCrudNames?.read
              )
            },
            {
              name: 'Landing Page Design',
              pathname: '/settings/appearance/#landing-page-design',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.lendingPage,
                allCrudNames?.read
              )
            }
            // {
            //   name: 'Custom Form',
            //   pathname: '/settings/appearance/#custom-form',
            //   isAllowed: checkPageAccess(
            //     pageAccess,
            //     allPages?.lendingPage,
            //     allCrudNames?.read
            //   )
            // }
          ]
        },
        {
          name: 'Inquiry',
          pathname: '/settings/inquiry',
          isAllowed: checkPageAccess(pageAccess, [
            allPages.contact,
            allPages.subscription
          ]),
          childMenu: [
            {
              name: 'Contacts',
              pathname: '/settings/inquiry/#contacts',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.contact,
                allCrudNames?.read
              )
            },
            {
              name: 'Subscription',
              pathname: '/settings/inquiry/#subscription',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.subscription,
                allCrudNames?.read
              )
            },
            {
              name: 'Bulk Inquiry',
              pathname: '/settings/inquiry/#bulk-inquiry',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.bulkInquiry,
                allCrudNames?.read
              )
            },
            {
              name: 'Book Appointment',
              pathname: '/settings/inquiry/#book-appointment',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.bookAppointment,
                allCrudNames?.read
              )
            },
            {
              name: 'RMC Inquiry',
              pathname: '/settings/inquiry/#rmc-inquiry',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.rmcInquiry,
                allCrudNames?.read
              )
            }
          ]
        },
        {
          name: 'Shipping',
          pathname: '/settings/shipping',
          isAllowed: checkPageAccess(
            pageAccess,
            [
              allPages?.manageCountry,
              allPages?.manageState,
              allPages?.manageCity,
              allPages?.manageDelivery
            ],
            allCrudNames?.read
          ),
          childMenu: [
            {
              name: 'Country, State, and City Management',
              pathname: '/settings/shipping/#country-state-city-management',
              isAllowed: checkPageAccess(
                pageAccess,
                [
                  allPages?.manageCountry,
                  allPages?.manageState,
                  allPages?.manageCity
                ],
                allCrudNames?.read
              )
            },
            {
              name: 'Delivery Options',
              pathname: '/settings/shipping/#delivery-options',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageDelivery,
                allCrudNames?.read
              )
            }
          ]
        },
        {
          name: 'Management',
          pathname: '/settings/management',
          isAllowed: checkPageAccess(
            pageAccess,
            [
              allPages?.weightSlab,
              allPages?.manageAdmin,
              allPages?.manageIssueandRejection,
              allPages?.manageChargesPaidBy,
              allPages?.manageConfig,
              allPages?.assignReturnToCategory,
              allPages?.manageReturn
            ],
            allCrudNames?.read
          ),
          childMenu: [
            {
              name: 'Weight Slab Settings',
              pathname: '/settings/management/#weight-slab-setting',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.weightSlab,
                allCrudNames?.read
              )
            },
            {
              name: 'Admin Configuration',
              pathname: '/settings/management/#admin-configuration',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageAdmin,
                allCrudNames?.read
              )
            },
            {
              name: 'Issue And Rejection Handling',
              pathname: '/settings/management/#issue-and-rejection-handling',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageIssueandRejection,
                allCrudNames?.read
              )
            },
            {
              name: 'Charges Paid By Management',
              pathname: '/settings/management/#charges-paid-by-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageChargesPaidBy,
                allCrudNames?.read
              )
            },
            {
              name: 'Role Management',
              pathname: '/settings/management/#role-management',
              isAllowed:
                userInfo?.userType?.toLowerCase() === 'super admin' ||
                userInfo?.userType?.toLowerCase() === 'developer'
                  ? true
                  : false
            },
            {
              name: 'Page Role Assignment',
              pathname: '/settings/management/#page-role-assignment',
              isAllowed:
                userInfo?.userType?.toLowerCase() === 'super admin' ||
                userInfo?.userType?.toLowerCase() === 'developer'
                  ? true
                  : false
            },
            {
              name: 'System Configuration',
              pathname: '/settings/management/#system-configuration',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageConfig,
                allCrudNames?.read
              )
            },
            {
              name: 'Return Management',
              pathname: '/settings/management/#return-management',
              isAllowed: checkPageAccess(
                pageAccess,
                allPages?.manageReturn,
                allCrudNames?.read
              )
            }
          ]
        }
      ]
    },
    {
      name: 'Logs',
      isAllowed: checkPageAccess(
        pageAccess,
        allPages?.logs,
        allCrudNames?.read
      ),
      pathname: '/logs',
      activeKey: 'logs'
    }
  ]
}
