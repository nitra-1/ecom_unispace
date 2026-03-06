import FileSaver from "file-saver";
import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import IpFiletype from "../../../components/IpFiletype.jsx";
import Loader from "../../../components/Loader.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import { showToast } from "../../../lib/AllGlobalFunction.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import {
  getBaseUrl,
  getDeviceId,
  getUserToken,
} from "../../../lib/GetBaseUrl.jsx";
import { _exception } from "../../../lib/exceptionMessage.jsx";

const DeliveryBulkUpload = ({
  loading,
  setLoading,
  modalShow,
  setModalShow,
  fetchData,
  toast,
  setToast,
}) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.user);
  const [modalType, setModalType] = useState();

  const download = async () => {
    try {
      setLoading(true);
      let headers = new Headers();
      headers.append("Authorization", `Bearer ${getUserToken()}`);
      headers.append("device_id", `${getDeviceId()}`);
      let downloadUrl = `${getBaseUrl()}Delivery/downloadDelivery`;
      fetch(downloadUrl, {
        method: "GET",
        headers: headers,
      })
        .then((response) => {
          setLoading(false);
          const blob = response.blob();
          return blob;
        })
        .then((blob) => {
          const customFileName = `Delivery.xlsx`;
          FileSaver.saveAs(blob, customFileName);
          setModalShow({ show: false, type: "" });
        });
    } catch (error) {
      setModalShow({ ...modalShow, errors: "" });
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };
  // updated upload function
  const upload = async () => {
    if (!modalShow?.file) {
      setModalShow({ ...modalShow, errors: ["Please select file"] });
      return;
    }

    try {
      setModalShow({ ...modalShow, errors: "" });
      const dataOfForm = {
        file: modalShow?.file,
      };
      const submitFormData = new FormData();

      const keys = Object.keys(dataOfForm);
      keys.forEach((key) => {
        submitFormData.append(key, dataOfForm[key]);
      });

      setLoading(true);
      const response = await axiosProvider({
        method: "POST",
        endpoint: `Delivery/Bulkupload`,
        queryString: `?mode=add`,
        data: submitFormData,
        location: location?.pathname,
        userId: userInfo?.userId,
      });
      setLoading(false);

      // Handle response based on status code
      if (response?.data?.code === 200) {
        setModalShow({ show: false, type: "" });
        fetchData();
        showToast(toast, setToast, response);
      } else if (response?.data?.code === 201) {
        // Handle 201 (partial success/validation warning)
        const errorMessage =
          response?.data?.message ||
          "Validation warnings occurred during upload";
        setModalShow({
          ...modalShow,
          errors:
            typeof errorMessage === "string" ? [errorMessage] : errorMessage,
        });
        showToast(toast, setToast, {
          data: {
            message: errorMessage,
            code: 201,
          },
        });
      } else {
        // Handle other error cases
        const errorMessage =
          response?.data?.message || response?.data?.data || "Upload failed";
        setModalShow({
          ...modalShow,
          errors:
            typeof errorMessage === "string" ? [errorMessage] : errorMessage,
        });
        showToast(toast, setToast, {
          data: {
            message: errorMessage,
            code: response?.data?.code || 204,
          },
        });
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";
      setModalShow({
        ...modalShow,
        errors: [errorMessage],
      });
      showToast(toast, setToast, {
        data: {
          message: errorMessage,
          code: 204,
        },
      });
    }
  };

  const formatError = (error) => {
    return error.split(" ").join(" ");
  };

  return (
    <ModelComponent
      show={modalShow.show}
      className="modal-backdrop"
      modalsize={"md"}
      modalheaderclass={""}
      modeltitle={"Bulk Upload"}
      onHide={() => {
        setModalShow({ show: !modalShow.show, type: "", errors: "" });
      }}
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      formbuttonid={modalType ? "upload" : null}
      submitname={modalType ? "Upload" : null}
      onSubmit={upload}
    >
      {loading && <Loader />}
      {!modalType ? (
        <Row className="justify-content-around align-items-center">
          <Col md={5}>
            <Button
              className="w-100"
              variant="outline-primary"
              style={{ height: "50px" }}
              onClick={download}
            >
              Download
            </Button>
          </Col>
          <Col md={5}>
            <Button
              className="w-100"
              variant="outline-primary"
              style={{ height: "50px" }}
              onClick={() => {
                setModalType("upload");
                setModalShow({ ...modalShow, file: null, errors: "" });
              }}
            >
              Upload
            </Button>
          </Col>
        </Row>
      ) : (
        <div className="row">
          <span
            onClick={() => {
              setModalType();
              setModalShow({ ...modalShow, file: null });
            }}
            className="col-md-2"
          >
            <svg
              role="button"
              fill="#212529a6"
              xmlns="http://www.w3.org/2000/svg"
              height="30"
              viewBox="0 -960 960 960"
              width="30"
            >
              <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          </span>
          <div className="col-md-12">
            <IpFiletype
              name="file"
              labelClass="required"
              filelbtext="Select file"
              accept=".xlsx"
              capture=".xlsx"
              onChange={(e) => {
                setModalShow({
                  ...modalShow,
                  errors: "",
                  file: e?.target?.files[0],
                });
              }}
            />
          </div>
          {modalShow?.errors && (
            <div>
              <span className="text-danger">
                {modalShow?.errors?.map((error, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && ", "}
                    {formatError(error)}
                  </React.Fragment>
                ))}
              </span>
            </div>
          )}
        </div>
      )}
    </ModelComponent>
  );
};

export default DeliveryBulkUpload;
