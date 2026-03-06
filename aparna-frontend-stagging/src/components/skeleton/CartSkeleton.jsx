import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const CartSkeleton = ({ modalShow, setModalShow }) => {
  return (
    <div className="site-container">
      <div className="add-cart-compont">
        <div className="flex w-full">
          <Skeleton
            containerClassName="flex-1"
            height="594px"
            borderRadius={10}
          />
        </div>
        <div className="cart-side-compont">
          <Skeleton height="94px" borderRadius={10} />
          <div className="price_details flex flex-col">
            <Skeleton
              containerClassName="flex-1"
              height="330px"
              borderRadius={10}
            />

            <Skeleton
              className="my-2"
              containerClassName="flex-1"
              height="38px"
              borderRadius={10}
            />
            <Skeleton
              containerClassName="flex-1"
              height="42px"
              borderRadius={10}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartSkeleton
