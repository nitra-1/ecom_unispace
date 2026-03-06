import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { parseCookies } from 'nookies'
import { useDispatch, useSelector } from 'react-redux'
import MBtn from '../../../components/base/MBtn'
import axiosProvider from '../../../lib/AxiosProvider'
import { _exception } from '../../../lib/exceptionMessage'
import {
  encodeURIForName,
  reactImageUrl,
  showToast,
  spaceToDash
} from '../../../lib/GetBaseUrl'
import { _productImg_ } from '../../../lib/ImagePath'

const OutofStock = ({
  stockItems,
  stateValues,
  cartCalculation,
  modalShow,
  setModalShow
}) => {
  const dispatch = useDispatch()
  const { sessionId } = useSelector((state) => state?.user)
  const router = useRouter()

  const handleDelete = async () => {
    const cookies = parseCookies()
    const cartIds = (
      stockItems?.map((item) => item?.sellerProductID) || []
    ).join(',')
    try {
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Cart',
        queryString: `?sessionId=${
          sessionId ? sessionId : cookies?.sessionId
        }&sellerProductIds=${cartIds}`
      })

      if (response?.data?.code === 200) {
        cartCalculation({
          pinCodeData: stateValues?.addressVal
        })
        router?.push('/checkout')
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

  return (
    <>
      {stockItems &&
        stockItems?.map((cart) => (
          <div className="mp-outofstock-item flex gap-3 py-1" key={cart.id}>
            <Link
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
                  encodeURI(`${reactImageUrl}${_productImg_}${cart?.Image}`)
                }
                alt={cart?.productName ?? 'image'}
                width={70}
                height={70}
                quality={100}
              />
            </Link>
            <div className="flex-col">
              <p className="cart-product-title text-base font-medium text-TextTitle pb-1 sm:leading-none leading-7">
                <Link
                  href={`/product/${encodeURIForName(
                    cart?.productName
                  )}?productGuid=${cart?.ProductGuid}&sp_id=${
                    cart?.sellerProductID
                  }&s_id=${cart?.sizeId}`}
                >
                  {cart?.productName}
                </Link>
              </p>
              <p className="mp-outofstock-badge text-[#DC3545]">Out of stock</p>
            </div>
          </div>
        ))}

      <div className="mp-outofstock-btn-main py-3">
        <div className="mp-outofstock-btn flex items-center justify-end gap-2">
          <MBtn
            btnText="Continue"
            buttonClass="mp-outofstock-continue"
            onClick={() => {
              handleDelete()
            }}
          />
          {/* <MBtn
            btnText="Cancel"
            buttonClass="mp-outofstock-cancel"
            onClick={() => {
              setModalShow({
                show: !modalShow?.show,
                type: 'outOfStockProduct'
              })
            }}
          /> */}
        </div>
      </div>
    </>
  )
}

export default OutofStock
