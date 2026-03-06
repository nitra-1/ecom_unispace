import React from 'react'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import { isInventoryModel } from '../../../lib/AllStaticVariables.jsx'

const AppliesOn = ({
  values,
  setFieldValue,
  setAllState,
  allState,
  toast,
  setToast,
  isDisabled
}) => {
  return (
    <>
      <div className="col-md-6 input-file-wrapper mb-3">
        <InfiniteScrollSelect
          name="applyOn"
          id="applyOn"
          isDisabled={isDisabled}
          value={
            values?.applyOn && {
              label: values?.applyOn,
              value: values?.applyOn
            }
          }
          placeholder="Apply Coupon On"
          label="Apply Coupon On"
          options={
            isInventoryModel
              ? [
                  { label: 'All Products', value: 'All Products' },
                  { label: 'Specific Products', value: 'Specific Products' },
                  {
                    label: 'Specific Categories',
                    value: 'Specific Categories'
                  },
                  { label: 'Specific Brands', value: 'Specific Brands' },
                  { label: 'Specific Users', value: 'Specific Users' }
                ]
              : [
                  { label: 'All Products', value: 'All Products' },
                  { label: 'Specific Products', value: 'Specific Products' },
                  {
                    label: 'Specific Categories',
                    value: 'Specific Categories'
                  },
                  { label: 'Specific Sellers', value: 'Specific Sellers' },
                  { label: 'Specific Brands', value: 'Specific Brands' },
                  { label: 'Specific Users', value: 'Specific Users' }
                ]
          }
          required={true}
          onChange={(e) => {
            setFieldValue('applyOn', e?.value)
            setFieldValue('offerItems', [])
          }}
        />
      </div>

      {values?.applyOn === 'Specific Categories' && (
        <div className="col-md-6">
          <div className="input-file-wrapper mb-3">
            <InfiniteScrollSelect
              isMulti
              isDisabled={isDisabled}
              name="offerItems"
              id="offerItems"
              placeholder="Select Category"
              label="Select Category"
              value={
                values?.offerItems?.map((data) => ({
                  value: data?.categoryId,
                  label:
                    allState?.category?.data?.find(
                      (obj) => obj?.value === data?.categoryId
                    )?.label || `Category ${data?.categoryId}`
                })) || []
              }
              options={allState?.category?.data || []}
              isLoading={allState?.category?.loading || false}
              queryParams={{
                status: 'Active'
              }}
              allState={allState}
              setAllState={setAllState}
              stateKey="category"
              toast={toast}
              setToast={setToast}
              required={true}
              onChange={(e) => {
                const offerItems = e?.map((item) => ({
                  categoryId: item?.value,
                  productId: 0,
                  brandId: 0,
                  sellerId: '',
                  userId: '',
                  status: '',
                  optInSellerIds: '',
                  getDiscountType: '',
                  offerId: 0,
                  getProductId: 0,
                  getDiscountValue: 0,
                  getProductPrice: 0,
                  sellerOptIn: values?.sellerOptIn,
                  brandids: '',
                  categoryIds: '',
                  sellerIds: ''
                }))
                setFieldValue('offerItems', offerItems)
              }}
            />
          </div>
        </div>
      )}

      {values?.applyOn === 'Specific Products' && (
        <div className="col-md-6">
          <div className="input-file-wrapper mb-3">
            <InfiniteScrollSelect
              isMulti
              isDisabled={isDisabled}
              name="offerItems"
              id="offerItems"
              value={
                values?.offerItems?.map((data) => ({
                  value: data?.productId,
                  label:
                    allState?.product?.data?.find(
                      (obj) => obj?.value === data?.productId
                    )?.label || data?.productName
                })) || []
              }
              placeholder="Select Product"
              label="Select Product"
              options={allState?.product?.data || []}
              isLoading={allState?.product?.loading || false}
              queryParams={{
                IsArchive: false
              }}
              allState={allState}
              setAllState={setAllState}
              stateKey="product"
              toast={toast}
              setToast={setToast}
              required={true}
              onChange={(e) => {
                const offerItems = e?.map((item) => ({
                  productId: item?.value,
                  productName: item?.label,
                  categoryId: 0,
                  brandId: 0,
                  sellerId: '',
                  userId: '',
                  status: '',
                  optInSellerIds: '',
                  getDiscountType: '',
                  offerId: 0,
                  getProductId: 0,
                  getDiscountValue: 0,
                  getProductPrice: 0,
                  sellerOptIn: values?.sellerOptIn
                }))
                setFieldValue('offerItems', offerItems)
              }}
            />
          </div>
        </div>
      )}

      {values?.applyOn === 'Specific Sellers' && (
        <>
          <div className="col-md-6">
            <div className="input-file-wrapper mb-3">
              <InfiniteScrollSelect
                isMulti
                isDisabled={isDisabled}
                name="offerItems"
                id="offerItems"
                value={
                  values?.offerItems?.map((data) => ({
                    value: data?.sellerId,
                    label:
                      allState?.seller?.data?.find(
                        (obj) => obj?.value === data?.sellerId
                      )?.label || data?.sellerName
                  })) || []
                }
                placeholder="Select Seller"
                label="Select Seller"
                options={allState?.seller?.data || []}
                isLoading={allState?.seller?.loading || false}
                queryParams={{
                  UserStatus: 'Active,Inactive',
                  KycStatus: 'Approved'
                }}
                allState={allState}
                setAllState={setAllState}
                stateKey="seller"
                toast={toast}
                setToast={setToast}
                required={true}
                onChange={(e) => {
                  const brandids = values?.offerItems[0]?.brandids || ''
                  const categoryIds = values?.offerItems[0]?.categoryIds || ''

                  const offerItems = e?.map((item) => ({
                    sellerId: item?.value,
                    sellerName: item?.label,
                    productId: 0,
                    brandId: 0,
                    categoryId: 0,
                    userId: '',
                    status: '',
                    optInSellerIds: '',
                    getDiscountType: '',
                    offerId: 0,
                    getProductId: 0,
                    getDiscountValue: 0,
                    getProductPrice: 0,
                    sellerOptIn: values?.sellerOptIn,
                    brandids,
                    categoryIds,
                    productIds: ''
                  }))
                  setFieldValue('offerItems', offerItems)
                }}
              />
            </div>
          </div>
          {values?.offerItems?.length > 0 && (
            <>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <InfiniteScrollSelect
                    isMulti
                    isDisabled={isDisabled}
                    name="offerItems"
                    id="offerItems"
                    placeholder="Select brands"
                    label="Select brands"
                    value={
                      values?.offerItems[0]?.brandids
                        ?.split(',')
                        .filter(Boolean)
                        .map((id) => ({
                          value: parseInt(id),
                          label:
                            allState?.brand?.data?.find(
                              (obj) => obj?.value === parseInt(id)
                            )?.label || `Brand ${id}`
                        })) || []
                    }
                    options={allState?.brand?.data || []}
                    isLoading={allState?.brand?.loading || false}
                    queryParams={{
                      status: 'Active'
                    }}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="brand"
                    toast={toast}
                    setToast={setToast}
                    required={true}
                    onChange={(e) => {
                      const offerItems = values?.offerItems?.map(
                        (offerItem) => ({
                          ...offerItem,
                          brandids: e?.map((brand) => brand?.value).join(',')
                        })
                      )
                      setFieldValue('offerItems', offerItems)
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <InfiniteScrollSelect
                    isMulti
                    isDisabled={isDisabled}
                    name="offerItems"
                    id="offerItems"
                    placeholder="Select Category"
                    label="Select Category"
                    value={
                      values?.offerItems[0]?.categoryIds
                        ?.split(',')
                        .filter(Boolean)
                        .map((id) => ({
                          value: parseInt(id),
                          label:
                            allState?.category?.data?.find(
                              (obj) => obj?.value === parseInt(id)
                            )?.label || `Category ${id}`
                        })) || []
                    }
                    options={allState?.category?.data || []}
                    isLoading={allState?.category?.loading || false}
                    queryParams={{
                      status: 'Active'
                    }}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="category"
                    toast={toast}
                    setToast={setToast}
                    required={true}
                    onChange={(e) => {
                      const offerItems = values?.offerItems?.map(
                        (offerItem) => ({
                          ...offerItem,
                          categoryIds: e
                            ?.map((category) => category?.value)
                            .join(',')
                        })
                      )
                      setFieldValue('offerItems', offerItems)
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {values?.applyOn === 'Specific Brands' && (
        <>
          <div className="col-md-6">
            <div className="input-file-wrapper mb-3">
              <InfiniteScrollSelect
                isMulti
                isDisabled={isDisabled}
                name="offerItems"
                id="offerItems"
                placeholder="Select brand"
                label="Select brand"
                value={
                  values?.offerItems?.map((data) => ({
                    value: data?.brandId,
                    label:
                      allState?.brand?.data?.find(
                        (obj) => obj?.value === data?.brandId
                      )?.label || `Brand ${data?.brandId}`
                  })) || []
                }
                options={allState?.brand?.data || []}
                isLoading={allState?.brand?.loading || false}
                queryParams={{
                  status: 'Active'
                }}
                allState={allState}
                setAllState={setAllState}
                stateKey="brand"
                toast={toast}
                setToast={setToast}
                required={true}
                onChange={(e) => {
                  const categoryIds = values?.offerItems[0]?.categoryIds || ''
                  const offerItems = e?.map((item) => ({
                    brandId: item?.value,
                    brandName: item?.label,
                    productId: 0,
                    sellerId: null,
                    categoryId: 0,
                    userId: null,
                    status: null,
                    optInSellerIds: null,
                    getDiscountType: null,
                    offerId: 0,
                    getProductId: 0,
                    getDiscountValue: 0,
                    getProductPrice: 0,
                    sellerOptIn: values?.sellerOptIn,
                    categoryIds
                  }))
                  setFieldValue('offerItems', offerItems)
                }}
              />
            </div>
          </div>
          {values?.offerItems?.length > 0 && (
            <div className="col-md-6">
              <div className="input-file-wrapper mb-3">
                <InfiniteScrollSelect
                  isMulti
                  isDisabled={isDisabled}
                  name="offerItems"
                  id="offerItems"
                  placeholder="Select Category"
                  label="Select Category"
                  value={
                    values?.offerItems[0]?.categoryIds
                      ?.split(',')
                      .filter(Boolean)
                      .map((id) => ({
                        value: parseInt(id),
                        label:
                          allState?.category?.data?.find(
                            (obj) => obj?.value === parseInt(id)
                          )?.label || `Category ${id}`
                      })) || []
                  }
                  options={allState?.category?.data || []}
                  isLoading={allState?.category?.loading || false}
                  allState={allState}
                  setAllState={setAllState}
                  stateKey="category"
                  queryParams={{
                    status: 'Active'
                  }}
                  toast={toast}
                  setToast={setToast}
                  required={true}
                  onChange={(e) => {
                    const offerItems = values?.offerItems?.map((offerItem) => ({
                      ...offerItem,
                      categoryIds: e
                        ?.map((category) => category?.value)
                        .join(',')
                    }))
                    setFieldValue('offerItems', offerItems)
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {values?.applyOn === 'Specific Users' && (
        <div className="col-md-6">
          <div className="input-file-wrapper mb-3">
            <InfiniteScrollSelect
              isMulti
              isDisabled={isDisabled}
              name="offerItems"
              id="offerItems"
              placeholder="Select User"
              label="Select User"
              value={
                values?.offerItems?.map((data) => ({
                  value: data?.userId,
                  label:
                    allState?.users?.data?.find(
                      (obj) => obj?.value === data?.userId
                    )?.label || `User ${data?.userId}`
                })) || []
              }
              options={allState?.users?.data || []}
              isLoading={allState?.users?.loading || false}
              allState={allState}
              setAllState={setAllState}
              stateKey="users"
              toast={toast}
              setToast={setToast}
              required={true}
              onChange={(e) => {
                const offerItems = e?.map((item) => ({
                  brandId: 0,
                  brandName: null,
                  productId: 0,
                  sellerId: null,
                  categoryId: 0,
                  userId: item?.value,
                  userName: item?.label,
                  status: null,
                  optInSellerIds: null,
                  getDiscountType: null,
                  offerId: 0,
                  getProductId: 0,
                  getDiscountValue: 0,
                  getProductPrice: 0,
                  sellerOptIn: values?.sellerOptIn
                }))
                setFieldValue('offerItems', offerItems)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default AppliesOn
