import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const OrderSkeleton = () => {
  const skeleton = () => {
    let orderItem = [];
    for (let index = 0; index < 10; index++) {
      orderItem?.push(
        <div className="orderconfirm-main">
          <div
            style={{
              paddingTop: "5px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <Skeleton height={40} />
          </div>
          <div>
            <div className="order-product-image-info !items-start">
              <div className="order-product-image">
                <Skeleton height={60} width={60} />
              </div>
              <div className="orderproduct-title">
                <p>
                  <Skeleton />
                </p>
                <Skeleton width={100} />
                <Skeleton width={100} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return orderItem;
  };

  return skeleton();
};

export default OrderSkeleton;
