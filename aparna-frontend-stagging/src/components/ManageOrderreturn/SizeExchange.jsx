"use client";

import axiosProvider from "@/lib/AxiosProvider";
import { _exception } from "@/lib/exceptionMessage";
import { showToast } from "@/lib/GetBaseUrl";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const SizeExchange = ({
  orderItemData,
  values,
  setFieldValue,
  setActiveAccordion,
  setLoading,
  params,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <>
      <div className="prd_clr_varients_img">
        <p className="prd_selectsize_label prds_input_labels_sizes_varients">
          <span className="rd_selectsize_label-seller">size:</span>
          <p>{values?.exchangeSize}</p>
        </p>
        <div className="prd_varients_imgs ">
          {orderItemData?.productSizeValue?.map((size) => (
            <div key={size?.sizeID} className="prds_sizes_labels_varients">
              <input
                type="radio"
                id={size?.sizeID}
                name="exchangeSizeId"
                className="prdt_size_inpt_radio"
                value={size?.sizeID}
                checked={values?.exchangeSizeId === size?.sizeID}
                onChange={() => {
                  if (size?.quantity > 0) {
                    setFieldValue("exchangeSizeId", size?.sizeID);
                    setFieldValue("exchangeSize", size?.sizeName);
                    setFieldValue(
                      "exchangePriceDiff",
                      size?.sellingPrice - orderItemData?.sellingPrice
                    );
                    setFieldValue("exchangeError", null);
                  }
                }}
              />
              <label
                htmlFor={size?.sizeID}
                className={
                  size?.quantity > 0
                    ? "prdt_size_label_varient"
                    : "prdt_size_label_varient sp_prd_disable"
                }
              >
                {size?.sizeName}
              </label>
              {size?.quantity > 0 && size?.quantity < 10 && (
                <span className="few-left-stock">{size?.quantity} left</span>
              )}
            </div>
          ))}
        </div>
        {values?.exchangeError && (
          <div className={"input-error-msg validation-error-message"}>
            {values?.exchangeError}
          </div>
        )}
      </div>
      <div className="transaction-section">
        <div>
          <button
            id="orderReturn"
            className="m-btn checkout_btn"
            type="button"
            onClick={async () => {
              if (values?.addressVal) {
                if (values?.exchangeSizeId) {
                  try {
                    const exchangeData = {
                      orderID: values?.orderID,
                      orderItemID: values?.orderItemID,
                      qty: 1,
                      actionID: values?.actionID,
                      exchangeProductID: values?.exchangeProductID,
                      customeProductName: values?.customeProductName,
                      exchangeSizeId: values?.exchangeSizeId,
                      exchangeSize: values?.exchangeSize,
                      exchangePriceDiff: values?.exchangePriceDiff,
                      userId: values?.userId,
                      userName: values?.addressVal.fullName,
                      userPhoneNo: values?.addressVal?.mobileNo,
                      userEmail: values?.addressVal?.email,
                      userGSTNo: values?.addressVal?.gstNo,
                      addressLine1: values?.addressVal?.addressLine1,
                      addressLine2: values?.addressVal?.addressLine2,
                      landmark: values?.addressVal?.lastName,
                      pincode: values?.addressVal?.pincode,
                      city: values?.addressVal?.cityName,
                      state: values?.addressVal?.stateName,
                      country: values?.addressVal?.countryName,
                      issue: values?.issue,
                      reason: values?.reason,
                      comment: values?.comment,
                      paymentMode: values?.paymentMode,
                      attachment: values?.attachment,
                    };
                    setLoading(true);
                    const response = await axiosProvider({
                      method: "POST",
                      endpoint: "ManageOrder/OrderExchange",
                      data: exchangeData,
                    });
                    setLoading(false);
                    if (response?.data?.code === 200) {
                      showToast(dispatch, response);
                      setTimeout(() => {
                        router?.push(
                          `/user/orders/${params?.orderId}/${params?.orderItemId}`
                        );
                      }, 1000);
                    }
                  } catch (error) {
                    showToast(dispatch, {
                      data: { message: _exception?.message, code: 204 },
                    });
                  }
                } else {
                  setActiveAccordion(2);
                  setFieldValue("exchangeError", "Please select the size");
                }
              } else {
                setActiveAccordion(1);
              }
            }}
          >
            Confirm Exchange
          </button>
        </div>
      </div>
    </>
  );
};

export default SizeExchange;
