import { currencyIcon } from '../../../../lib/GetBaseUrl'

const OtherSellers = ({ values, onSubmit }) => {
  let getSelectedSize = values?.allSizes?.find((item) => item?.isSelected)
  const getSellerListBySizeID = (data, sizeID) => {
    let result = []
    data?.forEach((product) => {
      product?.productPrices?.forEach((price) => {
        if (price.sizeID === sizeID) {
          result.push({
            mrp: price.mrp,
            sellingPrice: price.sellingPrice,
            discount: price.discount,
            sellerProductId: product.id,
            sellerName: product?.sellerName,
            sellerId: product?.sellerID,
            quantity: price.quantity,
            fromOtherSeller: true,
            sizeID: sizeID
          })
        }
      })
    })
    return result
  }

  const getOtherSeller = getSellerListBySizeID(
    values?.sellerProducts?.filter(
      (item) =>
        item?.sellerID !==
        values?.allSizes?.find((data) => data?.isSelected)?.sellerID
    ),
    getSelectedSize?.sizeID
  )

  return (
    getOtherSeller?.length > 0 && (
      <div className="prdt_other_sellers_wrapper">
        <h3 className="title_other_sellers">Other Sellers</h3>
        {getOtherSeller?.map((item, index) => (
          <div className="prdt_other_seller_card" key={index}>
            <div className="prdt_others_sellers_pricing_atc">
              <p className="other_sellers_pricing_product">
                {currencyIcon} {item?.sellingPrice}
              </p>
              {item?.quantity ? (
                <button
                  className="m-btn btn-add-cart"
                  onClick={() => {
                    onSubmit(item)
                  }}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="prdt_sold mb-4">
                  <h2 className="sold sold text-xl text-red-600">Sold out</h2>
                  <p>This item is currently out of stock</p>
                </div>
              )}
            </div>
            <p className="prdt_soldby_sellers">
              Sold by:
              <span className="prdt_soldbysellers_name">
                {item?.sellerName}
              </span>
            </p>
            {/* <p className='prdt_free_delivery_othersellers'>Free Delivery</p> */}
          </div>
        ))}
      </div>
    )
  )
}

export default OtherSellers
