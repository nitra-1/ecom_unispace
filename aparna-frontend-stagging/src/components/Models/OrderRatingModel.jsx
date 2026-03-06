"use client";
import { filterImageData, uploadFile } from "@/lib/AllGlobalFunction";
import axiosProvider from "@/lib/AxiosProvider";
import { _exception } from "@/lib/exceptionMessage";
import { reactImageUrl, showToast } from "@/lib/GetBaseUrl";
import { _orderImg_ } from "@/lib/ImagePath";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { Form, Formik } from "formik";
import Image from "next/image";
import React, { useState } from "react";
import Rating from "react-rating";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

function OrderRatingModel({ modalShow, setModalShow }) {
  const dispatch = useDispatch();
  const { data, userId } = modalShow;
  const { fullName } = useSelector((state) => state.user.user);
  const initVal = {
    productId: data?.productID,
    sellerProductId: data?.sellerProductID,
    sellerId: data?.sellerID,
    userId: userId,
    username: fullName,
    rate: modalShow?.rate,
    title: data?.productName,
    comments: "",
    live: true,
    status: "In Approval",
    productImage: [],
  };
  const [initialValues, setInitialValues] = useState(initVal);
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const validationSchema = Yup.object({
    comments: Yup.string().required(
      "Your feedback matters! Please share your thoughts about the product"
    ),
    rate: Yup.string().required(
      "Help others by rating the product. Your opinion counts!"
    ),
  });

  const validateImage = Yup.object().shape(
    {
      filename: Yup.mixed().when("filename", {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              "fileFormat",
              "File formate is not supported, Please use .jpg/.png/.jpeg format support",
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test("fileSize", "File must be less than 2MB", (value) => {
              return value !== undefined && value && value.size <= 2000000;
            }),
        otherwise: (schema) => schema.nullable(),
      }),
    },
    ["filename", "filename"]
  );

  const onSubmit = async (values) => {
    try {
      let finalData = values;

      values?.productImage.forEach((item) => {
        if (item?.url !== "") {
          Object.defineProperty(finalData, `image${item?.sequence}`, {
            value: item?.url,
            enumerable: true,
          });
        }
      });

      const response = await axiosProvider({
        method: "POST",
        endpoint: "user/ProductRating",
        data: finalData,
      });
      if (response?.status) {
        setModalShow({ show: false, data: null });
        showToast(dispatch, response);
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message },
      });
    }
  };

  return (
    <Modal
      size={"4xl"}
      isOpen={modalShow?.show}
      onClose={() => {
        setModalShow({ show: false, data: null });
      }}
      className="rounded-model-blocks"
    >
      <ModalContent>
        {(onClose) => (
          <React.Fragment>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span>Write Review</span>
                <span className="close-icon" onClick={onClose}>
                  <i className="m-icon m-black-cancel-icon"></i>
                </span>
              </div>
            </ModalHeader>
            <ModalBody>
              <Formik
                validateOnChange={false}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({
                  values,
                  setFieldValue,
                  handleChange,
                  errors,
                  setErrors,
                }) => (
                  <Form>
                    <div className="order-product-image-info">
                      <div className="order-list-product-image">
                        <Image
                          src={
                            data &&
                            encodeURI(
                              `${reactImageUrl}${_orderImg_}${data?.productImage}?tr=h-250,w-250,c-at_max,q-100`
                            )
                          }
                          alt={data?.productName}
                          width={71.25}
                          height={95}
                        />
                      </div>
                      <div className="orderproduct-title">
                        <p>
                          {data?.productName?.length > 25
                            ? data?.productName.slice(0, 25) + "..."
                            : data?.productName}
                        </p>
                        <Rating
                          emptySymbol={
                            <i className="m-icon rating-empty-icon"></i>
                          }
                          fullSymbol={
                            <i className="m-icon rating-fill-icon"></i>
                          }
                          initialRating={values?.rate}
                          onChange={(event) => {
                            setFieldValue("rate", event);
                          }}
                        />

                        <div>
                          <span>
                            <small style={{ color: "red" }}>
                              {errors?.rate}
                            </small>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rating-main-comp">
                      <div>
                        <Textarea
                          variant="faded"
                          labelPlacement="outside"
                          placeholder="Please write product review here"
                          className="max-w-xs"
                          minRows={15}
                          name="comments"
                          value={values?.comments}
                          onChange={handleChange}
                          fullWidth
                        />
                        <div>
                          <span>
                            <small style={{ color: "red" }}>
                              {errors?.comments}
                            </small>
                          </span>
                        </div>
                      </div>

                      <div className="preview_upload_m">
                        {values?.productImage?.length > 0 && (
                          <div className="image-show-block">
                            <div className="imgshow_wrapper">
                              {values?.productImage?.map((data, index) => (
                                <div className="img_preview_review" key={index}>
                                  <Image
                                    src={data?.objectUrl}
                                    alt={values?.title}
                                    width={71.25}
                                    height={50}
                                  />
                                  <span
                                    className="cancel-btn-view"
                                    onClick={() => {
                                      filterImageData(
                                        data,
                                        values,
                                        setFieldValue,
                                        "productImage"
                                      );
                                    }}
                                  >
                                    <i className="m-icon m-black-cancel-icon"></i>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {values?.productImage?.length < 5 && (
                          <div>
                            <label htmlFor="insert-rating-image">
                              <div className="add-photos-block">
                                <div>
                                  <Tooltip
                                    showArrow={true}
                                    content="Add Photos"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i className="m-icon order-add-photos-icon"></i>
                                  </Tooltip>
                                </div>
                              </div>
                            </label>
                            <div>
                              <span>
                                <small style={{ color: "red" }}>
                                  {errors?.validImage}
                                </small>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        id="insert-rating-image"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (event) => {
                          const imageFile = event?.target?.files[0];

                          if (imageFile) {
                            try {
                              await validateImage.validate({
                                filename: imageFile,
                              });
                              uploadFile(
                                values,
                                values?.productImage?.length + 1,
                                imageFile,
                                setFieldValue
                              );
                              setErrors({
                                ...errors,
                                validImage: "",
                              });
                            } catch (error) {
                              setErrors({
                                ...errors,
                                validImage: error?.message,
                              });
                            }
                          }
                        }}
                      />
                      <div>
                        <p>
                          <small>
                            By submiting review you give us consent to publish
                            and process personal information in according with{" "}
                            <span className="order-link-data">
                              Terms of use
                            </span>{" "}
                            and{" "}
                            <span className="order-link-data">
                              Privacy policy
                            </span>
                          </small>
                        </p>
                      </div>
                    </div>

                    <div className="rating-model-footer">
                      <Button color="primary" type="submit">
                        Submit
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </ModalBody>
          </React.Fragment>
        )}
      </ModalContent>
    </Modal>
  );
}

export default OrderRatingModel;
