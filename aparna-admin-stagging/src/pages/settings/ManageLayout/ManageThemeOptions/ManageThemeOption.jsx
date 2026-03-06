import React, { useEffect, useState } from "react";
import { Button, Image, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import PlusIcon from "../../../../components/AllSvgIcon/PlusIcon.jsx";
import Previewicon from "../../../../components/AllSvgIcon/Previewicon.jsx";
import Loader from "../../../../components/Loader.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../../../components/customStyles.jsx";
import {
  calculatePageRange,
  showToast,
} from "../../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../lib/AllPageNames.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _manageThemeOptionImg_ } from "../../../../lib/ImagePath.jsx";
import { _exception, _SwalDelete } from "../../../../lib/exceptionMessage.jsx";
import ThemeOptionForm from "./ThemeOptionForm.jsx";

const ManageThemeOption = () => {
  const initVal = {
    name: "",
    image: "",
    status: "",
    themeFor: "",
  };
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [initialValues, setInitialValues] = useState(initVal);
  const [loading, setLoading] = useState(false);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);

  const location = useLocation();
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 25,
    pageIndex: 1,
  });
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });

  const fetchData = async () => {
    setLoading(true);
    await axiosProvider({
      method: "GET",
      endpoint: "ManageTheme",
      queryString: `?pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`,
    })
      .then((res) => {
        if (res.status === 200) {
          setData(res);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      Name: values.name,
      Status: values.status,
      ImageFile: values?.image ? values?.image : null,
      Image: values?.image?.name ? values?.image?.name : values?.image,
      ThemeFor: values?.themeFor,
    };

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id };
    }

    const submitFormData = new FormData();

    const keys = Object.keys(dataOfForm);

    keys.forEach((key) => {
      submitFormData.append(
        key,
        dataOfForm[key] !== null ? dataOfForm[key] : ""
      );
    });

    try {
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);

      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: `ManageTheme`,
        data: submitFormData,
        oldData: initialValues,
        logData: values,
        location: location?.pathname,
        userId,
      });

      if (response?.data?.code === 200) {
        if (typeof values?.index === "number" && values.index >= 0) {
          let updatedArray = [...data?.data?.data];
          if (updatedArray.length > 0) {
            updatedArray[values?.index].status = values.status;
            setData({
              ...data,
              data: { ...data?.data, data: updatedArray },
            });
          }
        } else {
          resetForm({ values: "" });
          setModalShow(false);
          fetchData();
        }
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

  const handleDelete = async (id) => {
    setLoading(true);
    await axiosProvider({
      method: "DELETE",
      endpoint: `ManageTheme?id=${id}`,
      userId: userInfo?.userId,
      location: location.pathname,
    })
      .then((res) => {
        if (res?.status === 200) {
          fetchData();
        }
        setLoading(false);
        showToast(toast, setToast, res);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return (
    <>
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      {loading && !modalShow && <Loader />}
      <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
        {checkPageAccess(
          pageAccess,
          allPages?.manageLayout,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              setInitialValues(initVal);
              setModalShow(true);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}

        <div className="page-range">
          {calculatePageRange({
            ...filterDetails,
            recordCount: data?.data?.pagination?.recordCount ?? 0,
          })}
        </div>

        <div className="d-flex align-items-center">
          <label className="me-1">Show</label>
          <select
            styles={customStyles}
            name="dataget"
            id="parpageentries"
            className="form-select me-1"
            value={filterDetails?.pageSize}
            onChange={(e) => {
              setFilterDetails((draft) => {
                draft.pageSize = e?.target?.value;
                draft.pageIndex = 1;
              });
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </div>
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            {checkPageAccess(pageAccess, allPages?.homePage, [
              allCrudNames?.update,
              allCrudNames?.delete,
              allCrudNames?.write,
              allCrudNames?.read,
            ]) && <th className="text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data, index) => (
              <tr key={data.id}>
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    <Image
                      src={
                        data?.image
                          ? `${process.env.REACT_APP_IMG_URL}${_manageThemeOptionImg_}${data?.image}`
                          : "https://placehold.jp/50x50.png"
                      }
                      className="img-thumbnail table-img-box"
                    />
                    <span>{data.name}</span>
                  </div>
                </td>
                <td className="text-center">
                  <Toggle
                    id="cheese-status"
                    checked={data?.status?.toLowerCase() === "active"}
                    onChange={(e) => {
                      let values = {
                        ...data,
                        status: e?.target?.checked ? "Active" : "Inactive",
                        index: index,
                      };
                      Swal.fire({
                        title: `Are you sure you want to ${values?.status} this Theme ?`,
                        text: _SwalDelete.text,
                        icon: _SwalDelete.icon,
                        showCancelButton: _SwalDelete.showCancelButton,
                        confirmButtonColor: _SwalDelete.confirmButtonColor,
                        cancelButtonColor: _SwalDelete.cancelButtonColor,
                        confirmButtonText: "Yes",
                        cancelButtonText: _SwalDelete.cancelButtonText,
                      }).then((result) => {
                        if (result.isConfirmed) {
                          onSubmit(values);
                        }
                      });
                    }}
                  />
                </td>
                {checkPageAccess(pageAccess, allPages?.homePage, [
                  allCrudNames?.update,
                  allCrudNames?.delete,
                  allCrudNames?.write,
                  allCrudNames?.read,
                ]) && (
                  <td>
                    <div className="d-flex align-items-center gap-2 justify-content-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.homePage,
                        allCrudNames?.write
                      ) && (
                        <span
                          onClick={() => {
                            navigate(
                              `/settings/Theme-page-section?id=${data?.id}&themePageName=${data?.name}&themePageFor=${data?.themeFor}`
                            );
                          }}
                          className="d-flex justify-content-center align-items-center"
                        >
                          <PlusIcon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.homePage,
                        allCrudNames?.read
                      ) && (
                        <span
                          onClick={() => {
                            navigate(
                              `/settings/home-page-section?id=${data?.id}&homePageName=${data?.name}`
                            );
                          }}
                          className="d-flex justify-content-center align-items-center"
                        >
                          <Previewicon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.homePage,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={() => {
                            setModalShow(!modalShow);
                            setInitialValues(data);
                          }}
                          style={{
                            backgroundColor: "var(--bg-default)",
                            borderRadius: "0.375rem",
                          }}
                          className="d-flex justify-content-center align-items-center"
                        >
                          <EditIcon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.homePage,
                        allCrudNames?.delete
                      ) && (
                        <span
                          onClick={() => {
                            Swal.fire({
                              title: _SwalDelete.title,
                              text: _SwalDelete.text,
                              icon: _SwalDelete.icon,
                              showCancelButton: _SwalDelete.showCancelButton,
                              confirmButtonColor:
                                _SwalDelete.confirmButtonColor,
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText,
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(data?.id);
                              } else if (result.isDenied) {
                              }
                            });
                          }}
                        >
                          <DeleteIcon bg={"bg"} />
                        </span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center">
                {data?.data?.message}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <ThemeOptionForm
        modalShow={modalShow}
        setModalShow={setModalShow}
        initVal={initVal}
        loading={loading}
        initialValues={initialValues}
        setInitialValues={setInitialValues}
        setLoading={setLoading}
        fetchData={fetchData}
        toast={toast}
        setToast={setToast}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ManageThemeOption;
