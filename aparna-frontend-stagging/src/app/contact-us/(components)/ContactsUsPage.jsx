"use client";
import InputComponent from "@/components/base/InputComponent";
import MBtn from "@/components/base/MBtn";
import TextareaComponent from "@/components/base/TextareaComponent";
import Loader from "@/components/Loader";
import axiosProvider from "@/lib/AxiosProvider";
import { _exception } from "@/lib/exceptionMessage";
import { showToast } from "@/lib/GetBaseUrl";
import { _alphabetRegex_, _emailRegex_ } from "@/lib/Regex";
import { Form, Formik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import contactImg from "../../../../public/images/contact_img.png";
import Link from "next/link";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  description: "",
};

const ContactsUsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .transform((value) => (value ? value.trim() : value))
      .matches(/^[A-Za-z]+$/, "Only alphabetic characters are allowed")
      .min(2, "First name must be at least 2 characters")
      .required("First name is required")
      .test(
        "no-special-characters",
        "Special characters are not allowed",
        (value) => {
          return !value || _alphabetRegex_.test(value);
        }
      ),
    lastName: Yup.string()
      .transform((value) => (value ? value.trim() : value))
      .matches(/^[A-Za-z]+$/, "Only alphabetic characters are allowed")
      .min(2, "Last name must be at least 2 characters")
      .required("Last name is required")
      .test(
        "no-special-characters",
        "Special characters are not allowed",
        (value) => {
          return !value || _alphabetRegex_.test(value);
        }
      ),
    email: Yup.string()
      .matches(_emailRegex_, "Please enter valid email")
      .required("Email Address is required"),
    description: Yup.string().required("Description is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "POST",
        endpoint: "ContactUs",
        data: values,
      });
      if (response?.data?.code === 200) {
        resetForm({ values: "" });
      }
      showToast(dispatch, response);
      router.push("/");
    } catch {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message },
      });
    }
    setLoading(false);
  };

  return (
    <div className="site-container section_spacing_b">
      {loading && <Loader />}
      <div className="pv-contactus-main">
        <div className="pv-contactus-inner-inputs">
          <h1 className="text-[1.5rem] font-bold opacity-80">Contact Us</h1>
          <p className="pv-contact-desc">
            Discover exquisite bespoke furniture and designer pieces that
            transform your home. Shop furniture online and explore our elegant
            wooden furniture and modern furniture design, perfect for elevating
            any space.
          </p>
          <p className="pv-contact-desc">
            We're delighted to assist you, to provide the best support, we
            kindly ask for some basic information. Take a moment to fill out the
            form below and provide us with more details.
          </p>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, validateForm, errors }) => (
              <Form>
                <div className="input_form">
                  <InputComponent
                    labelText={"First Name"}
                    id={"firstName"}
                    required
                    type={"text"}
                    MainHeadClass={"input_filed_50"}
                    onChange={(e) => {
                      setFieldValue("firstName", e?.target?.value);
                    }}
                    autoFocus
                    value={values.firstName}
                    name={"firstName"}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                  <InputComponent
                    labelText={"Last Name"}
                    id={"lastName"}
                    type={"text"}
                    required
                    MainHeadClass={"input_filed_50"}
                    onChange={(e) => {
                      setFieldValue("lastName", e?.target?.value);
                    }}
                    value={values.lastName}
                    name="lastName"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                  <InputComponent
                    labelText={"Email Address"}
                    id={"emailID"}
                    type={"email"}
                    required
                    MainHeadClass={"input_filed_100"}
                    onChange={(e) => {
                      setFieldValue("email", e?.target?.value);
                    }}
                    value={values.email}
                    name="email"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                  <TextareaComponent
                    id={"description"}
                    labelText="Description"
                    MainHeadClass={"input_filed_100"}
                    value={values?.description}
                    onChange={(e) => {
                      setFieldValue("description", e?.target?.value);
                    }}
                    name="description"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                    required
                  />
                </div>
                <MBtn
                  buttonClass={"m-btn btn-primary"}
                  btnText={"Submit"}
                  btnPosition="right"
                  type={"submit"}
                />
              </Form>
            )}
          </Formik>
        </div>
        <div className="border border-[#c0c0cf54] rounded-md w-full md:min-w-[400px]">
          <div className="flex items-center justify-center flex-col p-5">
            <div className="py-4 px-7 pb-5">
              <Image
                src={contactImg}
                height={300}
                width={200}
                quality={100}
                loading="lazy"
                className="m-auto my-3"
              />
              <div className="pv-contact_info_sec">
                <h2 className="text-[1.5rem] font-bold opacity-80">
                  Contact Information
                </h2>
                <p>
                  For telephonic communication we are operative from 10:00 AM
                  07:00 PM IST.
                </p>
              </div>
            </div>
            <div className="pv-contact_info_seco_sec pt-5 py-4 px-10 border-t border-[#c0c0cf54]">
              <Link
                href="tel:+919154088438"
                className="pv-continfo-col !items-center"
              >
                <i className="m-icon pv-headset h-4 w-4"></i>
                <span>+91-9154088438</span>
              </Link>
              <Link
                href="18001216229"
                className="pv-continfo-col !items-center"
              >
                <i className="m-icon pv-headset h-4 w-4"></i>
                <span>18001216229</span>
              </Link>
              <Link
                href="mailto:info@aparnaunispace.com"
                className="pv-continfo-col !items-center"
              >
                <i className="m-icon pv-emailicon h-4 w-4"></i>
                <span>info@aparnaunispace.com</span>
              </Link>
              <Link
                href="/locate-us"
                target="_blank"
                className="pv-continfo-col !items-center"
              >
                <i className="m-icon pv-address !bg-black h-4 w-4"></i>
                <span>Our Stores</span>
              </Link>
            </div>
          </div>
          <div className="bg-[#EAEAEF] w-full rounded-none rounded-bl-md rounded-br-md">
            <div className="flex gap-3 items-center justify-center">
              <Link
                href="https://www.facebook.com/aparnaunispace"
                target="_blank"
                className="group inline-flex w-10 h-10 rounded-lg"
              >
                <i className="m-icon w-3 h-[1.125rem] bg-secondary facebook_social m-auto group-hover:bg-primary"></i>
              </Link>

              <Link
                href="https://www.instagram.com/aparnaunispace/"
                target="_blank"
                className="group inline-flex w-10 h-10 rounded-lg"
              >
                <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary insta_social m-auto group-hover:bg-primary"></i>
              </Link>
              <Link
                href="https://x.com/aparnaunispace"
                target="_blank"
                className="group inline-flex w-10 h-10 rounded-lg"
              >
                <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary twitter_social m-auto group-hover:bg-primary"></i>
              </Link>

              <Link
                href="https://www.linkedin.com/company/aparna-unispace/"
                target="_blank"
                className="group inline-flex w-10 h-10 rounded-lg"
              >
                <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary in_social m-auto group-hover:bg-primary"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsUsPage;
