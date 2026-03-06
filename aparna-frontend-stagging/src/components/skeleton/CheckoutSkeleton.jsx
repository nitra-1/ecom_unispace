import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const CheckoutSkeleton = ({ cartId }) => {
  return (
    <div className="site-container">
      <div className="check-out-main">
        <div className="check-orderlist">
          <Skeleton
            className="mb-4"
            height="85px"
            borderRadius={10}
            count={4}
          />
        </div>
        <div
          className="offer-price-details pv-hidden "
          style={{ marginBottom: '40px' }}
        >
          {!cartId && (
            <Skeleton width="1920px" height="80px" borderRadius={10} />
          )}
          <div>
            <Skeleton width="1920px" height="330px" borderRadius={10} />
            <div style={{ marginTop: '12px' }}>
              <Skeleton width="1920px" height="38px" borderRadius={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSkeleton
