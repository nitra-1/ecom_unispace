'use client'
import Image from 'next/image'
import Link from 'next/link'
import { parseCookies } from 'nookies'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import axiosProvider from '../../../lib/AxiosProvider'
import TierPricing from '@/components/TierPricing'
import {
  convertToNumber,
  currencyIcon,
  encodeURIForName,
  reactImageUrl,
  showToast
} from '../../../lib/GetBaseUrl'
import { _productImg_ } from '../../../lib/ImagePath'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage'
import { useState } from 'react'
import { Tooltip } from '@heroui/react'

const AddToCartProduct = ({
  data,
  setData,
  stateValues,
  cartCalculation,
  setLoading,
  loading
}) => {
  const dispatch = useDispatch()
  const { user, sessionId } = useSelector((state) => state?.user)
  const [selectedSlabs, setSelectedSlabs] = useState({})

  const handleChangeQty = async (value) => {
    const cookies = parseCookies()

    const Values = {
      id: value?.cartId,
      userId: stateValues?.userId || user?.userId,
      sessionId: user?.userId || sessionId || cookies?.sessionId,
      sellerProductMasterId: value?.sellerProductID,
      quantity: value?.qty,
      createdBy: stateValues?.userId || user?.userId,
      sizeId: value?.sizeId ?? 0,
      tempMRP: Number(value?.itemPrice?.mrp) ?? 0,
      tempSellingPrice: Number(value?.itemPrice?.selling_price) ?? 0,
      tempDiscount: Number(value?.itemPrice?.discount) ?? 0,
      subTotal: convertToNumber(value?.ItemSubTotal) ?? 0,
      warrantyId: 0
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Cart',
        data: Values
      })
      setLoading(false)
      if (response?.status === 200) {
        cartCalculation({ pinCodeData: stateValues?.addressVal })
        showToast(dispatch, {
          data: {
            message: `Quantity for ${value?.productName} updated to ${value?.qty}.`,
            code: 200
          }
        })
      } else {
        showToast(dispatch, response)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { message: _exception?.message, code: 204 }
      })
    }
  }
  const handleSlabSelected = (slab, cartItem) => {
    if (selectedSlabs[cartItem.cartId]?.id !== slab.id) {
      setSelectedSlabs((prev) => ({
        ...prev,
        [cartItem.cartId]: slab
      }))
    }
  }
  const handleDelete = async (cart) => {
    const cookies = parseCookies()

    try {
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Cart',
        queryString: `?sessionId=${
          user?.userId
            ? user?.userId
            : sessionId
            ? sessionId
            : cookies?.sessionId
        }&id=${cart?.cartId}`
      })

      if (response?.status === 200) {
        cartCalculation({ pinCodeData: stateValues?.addressVal })
        showToast(dispatch, {
          data: {
            message: `Successfully removed item from cart: ${cart?.productName}.`,
            code: 200
          }
        })
      } else {
        showToast(dispatch, response)
      }
    } catch {
      showToast(dispatch, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  //   const handleQty = (cartType, cartValue) => {
  //     const quantity =
  //       cartType === 'input'
  //         ? Number(cartValue?.qty) || 1
  //         : cartType === 'plus'
  //         ? Number(cartValue?.qty) + 1
  //         : Number(cartValue?.qty) - 1

  //     const isTierPricingAvailable =
  //       cartValue?.itemTierPrice && cartValue.itemTierPrice.length > 0

  //     if (isTierPricingAvailable) {
  //       const updatedTierPriceInSize = data.data.items.map((item) =>
  //         item.cartId === cartValue.cartId
  //           ? {
  //               ...item,
  //               qty: quantity,
  //               itemTierPrice: item.itemTierPrice.map((tier, index, array) => ({
  //                 ...tier,
  //                 selected:
  //                   (Number(quantity) >= Number(tier.FromSlabs) &&
  //                     (Number(quantity) <= Number(tier.ToSlabs) ||
  //                       index === array.length - 1)) ||
  //                   (Number(quantity) >= Number(tier.FromSlabs) && !tier.ToSlabs)
  //               }))
  //             }
  //           : item
  //       )

  //       const selectedTier = updatedTierPriceInSize
  //         .find((item) => item.cartId === cartValue.cartId)
  //         ?.itemTierPrice.find((item) => item.selected)

  //       const updatedItems = updatedTierPriceInSize.map((item) =>
  //         item.cartId === cartValue.cartId
  //           ? {
  //               ...item,
  //               itemPrice: {
  //                 ...item.itemPrice,
  //                 selling_price: selectedTier?.TierSellingPrice,
  //                 discount: Number(
  //                   (
  //                     ((cartValue.itemPrice.mrp -
  //                       selectedTier?.TierSellingPrice) /
  //                       cartValue.itemPrice.mrp) *
  //                     100
  //                   ).toFixed(2)
  //                 )
  //               }
  //             }
  //           : item
  //       )

  //       handleChangeQty(
  //         updatedItems.find((item) => item.cartId === cartValue.cartId)
  //       )

  //       if (setData) {
  //         setData({ ...data, data: { ...data.data, items: updatedItems } })
  //       }
  //     } else {
  //       handleChangeQty({ ...cartValue, qty: quantity })
  //     }
  //   }
  const handleQty = (cartType, cartValue) => {
    const quantity =
      cartType === 'input'
        ? Number(cartValue?.qty) || 1
        : cartType === 'plus'
        ? Number(cartValue?.qty) + 1
        : Number(cartValue?.qty) - 1

    const isTierPricingAvailable =
      cartValue?.itemTierPrice && cartValue.itemTierPrice.length > 0

    if (isTierPricingAvailable) {
      let bestTier = null
      cartValue.itemTierPrice.forEach((tier) => {
        const fromSlab = Number(tier.FromSlabs)
        if (quantity >= fromSlab) {
          if (!bestTier || fromSlab > Number(bestTier.FromSlabs)) {
            bestTier = tier
          }
        }
      })
      const updatedItem = { ...cartValue, qty: quantity }

      if (bestTier) {
        const newSellingPrice = bestTier.TierSellingPrice
        updatedItem.itemPrice = {
          ...cartValue.itemPrice,
          selling_price: newSellingPrice,
          discount: Number(
            (
              ((cartValue.itemPrice.mrp - newSellingPrice) /
                cartValue.itemPrice.mrp) *
              100
            ).toFixed(2)
          )
        }
      } else {
        updatedItem.itemPrice = {
          ...cartValue.itemPrice,
          selling_price: cartValue.itemPrice.selling_price,
          discount: cartValue.itemPrice.discount
        }
      }

      if (setData) {
        const updatedItems = data.data.items.map((item) =>
          item.cartId === cartValue.cartId ? updatedItem : item
        )
        setData({ ...data, data: { ...data.data, items: updatedItems } })
      }
      handleChangeQty(updatedItem)
    } else {
      handleChangeQty({ ...cartValue, qty: quantity })
    }
  }
  return (
    <>
      <div className="space-y-4">
        {data?.data?.items?.length > 0 &&
          data.data.items.map((cart) => (
            <div
              className="rounded-lg border border-[#DCDCE4] shadow-[0px_3px_10px_0px_#5C5C5C1A]"
              key={cart.cartId}
            >
              <div
                className={`cart-product-main relative p-3 flex flex-col sm:flex-row gap-3 ${
                  cart?.status !== 'In stock' ? 'cart-instock' : ''
                }`}
              >
                {cart?.status !== 'In stock' && (
                  <div className="pv-product-inner"></div>
                )}
                {cart && cart?.selling_price !== cart?.old_selling_price && (
                  <div className="pv-product-oldselling">
                    The selling prices have changed!
                  </div>
                )}
                <div className="cart-product-image relative">
                  {cart?.Image ? (
                    <Link
                      className="block w-[9.375rem] h-[9.375rem] bg-[#F6F6F9] overflow-hidden"
                      href={`/product/${encodeURIForName(
                        cart?.productName
                      )}?productGuid=${cart?.ProductGuid}&sp_id=${
                        cart?.sellerProductID
                      }&s_id=${cart?.sizeId}`}
                    >
                      <Image
                        className="product-img-add-to-cart"
                        src={
                          cart?.Image &&
                          encodeURI(
                            `${reactImageUrl}${_productImg_}${cart?.Image}`
                          )
                        }
                        alt={cart?.productName}
                        width={300}
                        height={300}
                        quality={100}
                      />
                    </Link>
                  ) : (
                    <Image
                      className="product-img-add-to-cart"
                      src="https://placehold.co/300x300.png"
                      alt={cart?.productName ?? 'image'}
                      width={180}
                      height={210}
                      quality={100}
                    />
                  )}
                </div>
                <div className="cart-product-details w-full">
                  <div className="flex items-start justify-between gap-3 flex-col md:flex-row">
                    <Link
                      href={`/product/${encodeURIForName(
                        cart?.productName
                      )}?productGuid=${cart?.ProductGuid}&sp_id=${
                        cart?.sellerProductID
                      }&s_id=${cart?.sizeId}`}
                    >
                      <Tooltip
                        content={cart?.productName}
                        classNames={{
                          content:
                            'capitalize text-white text-sm px-2 py-1 max-w-[800px]'
                        }}
                        color="secondary"
                        placement="top"
                      >
                        <h2 className="cart-product-title text-lg font-medium text-TextTitle mb-2 line-clamp-2">
                          {cart?.productName}
                        </h2>
                      </Tooltip>

                      {(cart?.size || cart?.color) && (
                        <div className="cart-size flex gap-3 mb-2 flex-wrap">
                          {cart?.size && (
                            <span className="inline-flex">
                              Size:<b className="break-all">{cart?.size}</b>
                            </span>
                          )}
                          {cart?.color && (
                            <span className="inline-flex">
                              Color:<b className="break-all">{cart?.color}</b>
                            </span>
                          )}
                        </div>
                      )}
                      {(cart?.brandName || cart?.sellerName) && (
                        <>
                          <div className="flex gap-3 flex-wrap">
                            {cart?.brandName && (
                              <span className="cart-seller-name inline-flex">
                                Brand:
                                <p className="seller-name-title">
                                  {cart?.brandName}
                                </p>
                              </span>
                            )}{' '}
                            <div className="flex flex-row items-center gap-2">
                              {cart?.sellerName && (
                                <span className="cart-seller-name inline-flex">
                                  Seller:
                                  <p className="seller-name-title">
                                    {cart?.sellerName}
                                  </p>
                                </span>
                              )}
                            </div>
                          </div>
                          {cart?.status === 'In stock' && (
                            <span className="cart-stock">{cart?.status}</span>
                          )}
                        </>
                      )}
                    </Link>

                    {cart?.status === 'In stock' ? (
                      <div className="counter-btn-cart bg-[#F6F6F9] flex-shrink-0 md:mt-4">
                        <button
                          disabled={cart?.qty === 1}
                          onClick={() => {
                            handleQty('minus', cart)
                          }}
                          type="button"
                          className="pl-4"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="pv-counter-inp bg-[#F6F6F9]"
                          //   readOnly
                          name=""
                          id=""
                          disabled={loading}
                          value={cart?.qty}
                          onChange={(e) => {
                            const inputValue = e?.target?.value
                            const isValidInput = /^[1-9]\d*$/.test(inputValue)
                            if (isValidInput || !inputValue) {
                              handleQty('input', {
                                ...cart,
                                qty: e?.target?.value
                              })
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            handleQty('plus', cart)
                          }}
                          type="button"
                          className="pr-4"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      //   <div className="badge-danger">{cart?.status}</div>
                      <div className="badge-danger">
                        {cart?.status ===
                        'You have to purchase at least1 of these  Items.'
                          ? 'Out OF Stock'
                          : cart?.status}
                      </div>
                    )}
                  </div>
                  {cart?.coupon_status === 'success' && (
                    <p className="pv-coupon-applytext">Coupon Applied %</p>
                  )}
                  {cart?.status === 'In stock' &&
                    (cart.itemTierPrice && cart.itemTierPrice.length > 0 ? (
                      <>
                        <TierPricing
                          tierData={cart}
                          type="cartTierValue"
                          quantity={cart.qty}
                          baseMrp={cart?.itemPrice?.mrp}
                          baseCustomPrice={cart?.itemPrice?.CustomPrice}
                          onSlabSelected={(slab) =>
                            handleSlabSelected(slab, cart)
                          }
                        />
                      </>
                    ) : (
                      <>
                        <div className="product_pricong_offer_deliverychrg flex gap-3 items-center mt-3">
                          <span className="total_pricing_product">
                            {currencyIcon}
                            {cart.itemPrice?.selling_price}
                          </span>
                          {cart.itemPrice?.discount !== 0 && (
                            <>
                              <span className="actual_pricing_product_mrp">
                                {currencyIcon}
                                {cart.itemPrice?.mrp}
                              </span>
                              <span className="actual_pricing_product_dis">
                                {cart.itemPrice?.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </>
                    ))}

                  <div
                    className="delete-btn group inline-flex p-1 absolute bg-[#FCEBED] right-0 top-0 cursor-pointer"
                    onClick={() => {
                      Swal.fire({
                        title: 'Delete Item from Cart',
                        text: `Are you sure you want to remove ${cart?.productName} from your cart?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: _SwalDelete?.confirmButtonColor,
                        cancelButtonColor: _SwalDelete?.cancelButtonColor,
                        confirmButtonText: 'Yes, Remove It',
                        cancelButtonText: 'Cancel'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          handleDelete(cart)
                        }
                      })
                    }}
                  >
                    <i className="m-icon mp-close w-3 h-3 bg-[#DC3545]"></i>
                  </div>
                  {/* <div className="flex">
                  {cart?.status === 'In stock' &&
                    (cart.itemTierPrice && cart.itemTierPrice.length > 0 ? (
                      <>
                        <div lassName="flex items-center text-sm font-normal text-[#4D4D4D]">
                          <span className="mr-2">
                            Total Amount (With GST):{' '}
                            <span className="font-semibold ">
                              ₹ {cart?.itemPrice?.selling_price_withGST}
                            </span>
                          </span>

                          <button
                            type="button"
                            className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-700 relative group"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-info-circle"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                            </svg>


                            <div className="absolute right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-xl text-sm text-slate-700 w-60 z-10">
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">
                                  Unit Rate:
                                </span>
                                <span>{cart?.itemPrice?.mrp}</span>
                              </p>
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">Discount:</span>
                                <span>{cart?.itemPrice?.discount_amount}</span>
                              </p>
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">
                                  Discounted Unit Rate:
                                </span>
                                <span>{cart?.itemPrice?.selling_price}</span>
                              </p>
                              {cart?.itemPrice?.IGST ? (
                                <p className="flex justify-between">
                                  <span className="font-semibold">IGST:</span>
                                  <span>{cart?.itemPrice?.IGST}%</span>
                                </p>
                              ) : null}
                            </div>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="flex items-center text-sm font-normal text-[#4D4D4D]">
                          <span className="mr-2">
                            Total Amount (With GST):{' '}
                            <span className="font-semibold">
                              {cart?.itemPrice?.selling_price_withGST}
                            </span>
                          </span>

                          <button
                            type="button"
                            className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-700 relative group"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-info-circle"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                            </svg>


                            <div className="absolute right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-xl text-sm text-slate-700 w-60 z-10">
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">
                                  Unit Rate:
                                </span>
                                <span>{cart?.itemPrice?.mrp}</span>
                              </p>
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">Discount:</span>
                                <span>{cart?.itemPrice?.discount_amount}</span>
                              </p>
                              <p className="mb-1 flex justify-between">
                                <span className="font-semibold">
                                  Discounted Unit Rate:
                                </span>
                                <span>{cart?.itemPrice?.selling_price}</span>
                              </p>
                              {cart?.itemPrice?.IGST ? (
                                <p className="flex justify-between">
                                  <span className="font-semibold">IGST:</span>
                                  <span>{cart?.itemPrice?.IGST}%</span>
                                </p>
                              ) : null}
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                </div> */}
                </div>
              </div>

              <div className="flex border-t border-[#DCDCE4] p-3">
                {cart?.status === 'In stock' && (
                  <div className="ml-auto flex items-center text-sm font-normal text-[#4D4D4D]">
                    <span className="mr-2">
                      Total Amount (With GST):{' '}
                      <span className="font-semibold">
                        {currencyIcon}
                        {cart?.itemPrice?.selling_price_withGST}
                      </span>
                    </span>

                    {/* Info Tooltip Button */}
                    <button
                      type="button"
                      className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-700 relative group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-info-circle"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                      </svg>

                      {/* Tooltip */}
                      <div className="absolute right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-xl text-sm text-slate-700 w-60 z-10">
                        <p className="mb-1 flex justify-between">
                          <span className="font-semibold">Unit Rate:</span>
                          <span>
                            {' '}
                            {currencyIcon}
                            {cart?.itemPrice?.mrp}
                          </span>
                        </p>
                        {cart?.itemPrice?.mrp !==
                          cart?.itemPrice?.selling_price && (
                          <>
                            {' '}
                            <p className="mb-1 flex justify-between border-b">
                              <span className="font-semibold">Discount:</span>
                              <span className="text-success-500">
                                - {currencyIcon}
                                {cart?.itemPrice?.discount_amount}
                              </span>
                            </p>
                            <p className="mb-1 flex justify-between">
                              <span className="font-semibold">
                                Discounted Unit Rate:
                              </span>
                              <span>
                                {' '}
                                {currencyIcon}
                                {cart?.itemPrice?.selling_price}
                              </span>
                            </p>{' '}
                          </>
                        )}

                        <p className="mb-1 flex justify-between border-b">
                          <span className="font-semibold">
                            Tax @{cart?.itemPrice?.Rate}%:
                          </span>
                          <span>
                            + {currencyIcon}
                            {cart?.itemPrice?.taxAmount}
                          </span>
                        </p>
                        <p className="mb-1 flex justify-between">
                          <span className="font-semibold">Total Amount</span>
                          <span>
                            {' '}
                            {currencyIcon}
                            {cart?.itemPrice?.selling_price_withGST}
                          </span>
                        </p>
                        {cart?.itemPrice?.IGST && (
                          <p className="flex justify-between">
                            <span className="font-semibold">IGST:</span>
                            <span>{cart?.itemPrice?.IGST}%</span>
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </>
  )
}

export default AddToCartProduct
