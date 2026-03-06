import { formatPinCodeValue } from "@/lib/AllGlobalFunction";
import axiosProvider from "@/lib/AxiosProvider";
import { showToast } from "@/lib/GetBaseUrl";
import { _toaster } from "@/lib/tosterMessage";
import { cartData } from "@/redux/features/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import InputComponent from "./base/InputComponent";

const PincodeCheck = ({
  title,
  values,
  setValues,
  modalShow,
  setModalShow,
  cartCalculation,
}) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state?.cart);
  const { address } = useSelector((state) => state?.address);

  return (
    <>
      <div className="pincode_fl-main">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-base">Check Delivery</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <InputComponent
            MainHeadClass={"!mb-0 col-span-2"}
            type={"text"}
            placeholder={"Enter Pincode"}
            labelClass={"dl_fl-fle"}
            inputClass={"h-full"}
            maxLength={6}
            labelText={false}
            value={values?.pinCodeValue}
            onChange={(event) => {
              const inputValue = event?.target?.value;
              const regex = /^[0-9\b]+$/;
              if (inputValue === "" || regex.test(inputValue)) {
                setValues({ ...values, pinCodeValue: inputValue });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && values?.pinCodeValue?.length === 6) {
                document.getElementById("check-pincode").click();
              }
            }}
          />
          <div
            className="flex items-center justify-center border border-primary rounded-md gap-2 px-2 py-2 cursor-pointer col-span-1"
            onClick={async () => {
              if (values?.pinCodeValue?.length === 6) {
                try {
                  const response = await axiosProvider({
                    method: "GET",
                    endpoint: `Delivery/byPincode?pincode=${values?.pinCodeValue}`,
                  });
                  if (response?.data?.code === 200) {
                    dispatch(
                      cartData({
                        ...cart,
                        deliveryData: formatPinCodeValue(response?.data?.data),
                      })
                    );

                    if (modalShow) {
                      const checkAddressVal =
                        address?.length > 0 &&
                        address?.find(
                          (item) =>
                            Number(item?.pincode) ===
                            response?.data?.data?.pincode
                        );

                      setValues({
                        ...values,
                        addressVal: checkAddressVal,
                        deliveryDays: response?.data?.data?.deliveryDays,
                        pincodeError: "",
                      });
                    } else {
                      setValues({
                        ...values,
                        deliveryDays: response?.data?.data?.deliveryDays,
                        pincodeError: "",
                      });
                    }
                    cartCalculation &&
                      cartCalculation({
                        pinCodeData: formatPinCodeValue(response?.data?.data),
                      });
                    showToast(dispatch, {
                      data: {
                        code: 200,
                        message: _toaster?.pinCodeSuccess,
                      },
                    });
                    setModalShow && setModalShow({ show: false });
                  } else {
                    setValues({
                      ...values,
                      deliveryDays: null,
                      pincodeError:
                        "Shipping unavailable for this location. Please enter another Pincode.",
                    });
                  }
                } catch (error) {
                  setValues({
                    ...values,
                    deliveryDays: null,
                    pincodeError: "Not a valid Pincode.",
                  });
                }
              } else {
                setValues({
                  ...values,
                  deliveryDays: null,
                  pincodeError: "Please enter Pincode.",
                });
              }
            }}
          >
            {window?.innerWidth > 768 && (
              <i className="m-icon m-pin-code_icon"></i>
            )}
            <button
              id="check-pincode"
              type="button"
              className="btn-check !text-[14px]"
            >
              Check Pincode
            </button>
          </div>
        </div>
        {values?.deliveryDays ? (
          <p className="success_msg-succ">
            Faster delivery by {values?.deliveryDays} Days
          </p>
        ) : (
          values?.pincodeError && (
            <p className="err_msg-msg">{values?.pincodeError}</p>
          )
        )}
      </div>
    </>
  );
};

export default PincodeCheck;
