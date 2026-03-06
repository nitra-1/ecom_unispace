import moment from "moment";
import { _orderStatus_ } from "../lib/GetBaseUrl";

const OrderStage = ({
  track,
  orderStatus,
  title,
  additionalClass = "",
  orderDate,
}) => {
  const filteredItems = track?.filter(
    (item) => item?.orderStage === orderStatus
  );

  return (
    <div
      className={`checkout-comman-class ${
        filteredItems?.length > 0 ? `active ${additionalClass}` : ""
      }`}
    >
      <span className="process-circal"></span>
      <div className="pv-order-discription">
        <span className="process-checkout-title">{title}</span>
        {/* <span className="process-checkout-date">
          {orderDate
            ? moment(orderDate).format('hh:mm a/ DD MMMM YYYY')
            : filteredItems.map((item) =>
                moment(item?.trackDate).format('hh:mm a/ DD MMMM YYYY')
              )}
        </span> */}

        {filteredItems?.[0]?.trackDate && (
          <span className="process-checkout-date">
            {orderDate
              ? moment(orderDate).format("hh:mm a/ DD MMMM YYYY")
              : moment(filteredItems?.[0]?.trackDate).format(
                  "hh:mm a/ DD MMMM YYYY"
                )}
          </span>
        )}
      </div>
    </div>
  );
};

const ShoppingCheckOut = ({ track, PlaceDate }) => {
  const hasPlacedStatus = track?.some(
    (item) => item?.orderStage === _orderStatus_?.placed
  );
  return (
    <div
      className={`check-out-process ${
        track?.some((item) => item?.orderStage === _orderStatus_?.cancelled) &&
        "cancelled"
      }`}
    >
      {track?.some((item) => item?.orderStage === _orderStatus_?.failed) ? (
        <OrderStage
          track={track}
          orderStatus={_orderStatus_?.initiate}
          title="Order Initiate"
          additionalClass={"red"}
        />
      ) : (
        hasPlacedStatus && (
          <OrderStage
            track={track}
            orderStatus={_orderStatus_?.placed}
            title=" Placed"
            additionalClass={
              track?.some(
                (item) => item?.orderStage === _orderStatus_?.failed
              ) ||
              (track?.some(
                (item) => item?.orderStage === _orderStatus_?.cancelled
              ) &&
                "red")
            }
            orderDate={PlaceDate}
          />
        )
      )}
      {track?.some((item) => item?.orderStage === _orderStatus_?.cancelled) ? (
        <OrderStage
          track={track}
          orderStatus={_orderStatus_?.cancelled}
          title="Cancelled"
          additionalClass="red"
        />
      ) : (
        <>
          <OrderStage
            track={track}
            orderStatus={_orderStatus_?.confirmed}
            title="Confirmed"
          />
          <OrderStage
            track={track}
            orderStatus={_orderStatus_?.packed}
            title="Packed"
          />
          <OrderStage
            track={track}
            orderStatus={_orderStatus_?.ship}
            title="Shipped"
          />
          <OrderStage
            track={track}
            orderStatus={_orderStatus_?.delivered}
            title="Delivered"
          />
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.failed
          ) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.failed}
              title="Order Failed"
              additionalClass="red"
            />
          )}
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.returnRequested
          ) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.returnRequested}
              title="Return Requested"
            />
          )}
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.returned
          ) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.returned}
              title="Returned"
            />
          )}
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.replaceRequested
          ) && (
            <>
              <OrderStage
                track={track}
                orderStatus={_orderStatus_?.replaceRequested}
                title="Replace Requested"
              />
              <OrderStage
                track={track}
                orderStatus={_orderStatus_?.replaced}
                title="Replaced"
              />
            </>
          )}
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.returnRejected
          ) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.returnRejected}
              title="Return request rejected"
              additionalClass="red"
            />
          )}
          {track?.some(
            (item) => item?.orderStage === _orderStatus_?.inProcess
          ) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.inProcess}
              title="Refund - in Process"
              additionalClass="green"
            />
          )}
          {track?.some((item) => item?.orderStage === _orderStatus_?.paid) && (
            <OrderStage
              track={track}
              orderStatus={_orderStatus_?.paid}
              title="Refund - Paid"
              additionalClass="green"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ShoppingCheckOut;
