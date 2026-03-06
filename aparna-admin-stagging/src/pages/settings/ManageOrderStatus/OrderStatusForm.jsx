import { Form, Formik } from "formik";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl";
import Loader from "../../../components/Loader";
import ModelComponent from "../../../components/Modal";
import CustomToast from "../../../components/Toast/CustomToast";
import { showToast } from "../../../lib/AllGlobalFunction";
import axiosProvider from "../../../lib/AxiosProvider";
import { _exception } from "../../../lib/exceptionMessage";

const OrderStatusForm = ({
  modalShow,
  setModalShow,
  initialValues,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
}) => {
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();

  const validationSchema = Yup.object().shape({
    orderStatus: Yup.string().required("Please enter Order Status"),
  });
  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "OrderStatus",
        data: values,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues,
      });
      setLoading(false);

      if (response?.data?.code === 200) {
        resetForm({ values: "" });
        setModalShow({ show: false, type: "" });
        fetchData();
      }
      showToast(toast, setToast, response);
    } catch {
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };
  return (
    <ModelComponent
      show={modalShow}
      modalsize={"md"}
      className="modal-backdrop"
      modalheaderclass={""}
      modeltitle={"Order Status"}
      onHide={() => {
        setModalShow(false);
      }}
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      formbuttonid={"order-status"}
      submitname={!initialValues?.id ? "Create" : "Update"}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="order-status">
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Order Status"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                    name="orderStatus"
                    placeholder="Enter order status"
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  );
};

export default OrderStatusForm;
