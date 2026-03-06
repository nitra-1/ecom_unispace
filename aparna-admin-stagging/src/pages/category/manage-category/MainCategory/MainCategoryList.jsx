import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Button, Image, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import Previewicon from "../../../../components/AllSvgIcon/Previewicon.jsx";
import BasicFilterComponents from "../../../../components/BasicFilterComponents.jsx";
import Loader from "../../../../components/Loader.jsx";
import RecordNotFound from "../../../../components/RecordNotFound.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import {
  encodedSearchText,
  showToast,
} from "../../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../lib/AllPageNames.jsx";
import { pageRangeDisplayed } from "../../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _categoryImg_ } from "../../../../lib/ImagePath.jsx";
import { _SwalDelete, _exception } from "../../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../../lib/useDebounce.js";

const MainCategoryForm = React.lazy(() => import("./MainCategoryForm.jsx"));
const MainCategoryDetails = React.lazy(() =>
  import("./MainCategoryDetails.jsx")
);

const MainCategoryList = ({
  initialValues,
  modalShow,
  setModalShow,
  setInitialValues,
}) => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
  });
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const debounceSearchText = useDebounce(searchText, 500);
  const location = useLocation();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "MainCategory/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
      });
      if (response?.status === 200) {
        setData(response);
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [filterDetails]);

  const handlePageClick = useCallback(
    (event) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setFilterDetails((draft) => {
        draft.pageIndex = event.selected + 1;
      });
    },
    [setFilterDetails]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await axiosProvider({
          method: "DELETE",
          endpoint: "MainCategory",
          queryString: `?Id=${id}`,
          userId: userInfo?.userId,
          location: location.pathname,
        });
        setLoading(false);
        if (response?.data?.code === 200) {
          if (filterDetails?.pageIndex > 1 && data?.data?.data?.length === 1) {
            setFilterDetails((draft) => {
              draft.pageIndex = filterDetails?.pageIndex - 1;
            });
          } else {
            fetchData();
          }
        }
        showToast(toast, setToast, response);
      } catch {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204,
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [fetchData, location.pathname, toast, userInfo?.userId]
  );

  const onSubmit = async (values, resetForm) => {
    let seokeywords = values.metaKeywords.toString();

    let dataOfForm = {
      Name: values.name ?? "",
      MetaTitles: values.metaTitles ?? "",
      MetaDescription: values.metaDescription ?? "",
      MetaKeywords: seokeywords,
      FileName: values.filename ?? "",
      Status: values?.status ?? "",
      Color: values?.color ?? "",
      Description: values?.description ?? "",
      SubTitle: values?.subTitle ?? "",
      title: values?.title ?? "",
      IsImageAvailable: values?.filename || values?.image ? true : false,
    };

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id };
    }

    const submitFormData = new FormData();

    const keys = Object.keys(dataOfForm);

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key]);
    });

    try {
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);

      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: `MainCategory`,
        data: submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues,
      });
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(false);

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
          setModalShow({ show: false, type: "" });
          fetchData();
        }
      }
      showToast(toast, setToast, response);
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData, filterDetails]);

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim();
        draft.pageIndex = 1;
      });
    } else {
      setFilterDetails((draft) => {
        draft.searchText = "";
        draft.pageIndex = 1;
      });
    }
  }, [debounceSearchText, setFilterDetails]);

  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-3 gap-3">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Categories</th>
            <th>Color</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((category, index) => (
                <tr key={`category.name + ${Math.random()}`}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      <Image
                        src={
                          category?.image
                            ? `${process.env.REACT_APP_IMG_URL}${_categoryImg_}${category?.image}`
                            : "https://placehold.jp/50x50.png"
                        }
                        className="img-thumbnail table-img-box"
                      />
                      <span>{category.name}</span>
                    </div>
                  </td>
                  <td>
                    {category?.color ? (
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="d-inline-block rounded cw-25 ch-25 border border-1"
                          style={{ backgroundColor: `${category?.color}` }}
                        ></span>
                        {category?.color}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="text-center">
                    <Toggle
                      id="cheese-status"
                      checked={category.status === "Active"}
                      disabled={
                        !checkPageAccess(
                          pageAccess,
                          allPages?.category,
                          allCrudNames?.update
                        )
                      }
                      onChange={(e) => {
                        const values = {
                          ...category,
                          status: e?.target?.checked ? "Active" : "Inactive",
                          index: index,
                        };
                        Swal.fire({
                          title: `Are you sure you want to ${values?.status} this Category ?`,
                          text: "",
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
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.category,
                        allCrudNames?.read
                      ) && (
                        <span
                          onClick={() => {
                            setModalShow({ show: true, type: "details" });
                            setInitialValues(category);
                          }}
                        >
                          <Previewicon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.category,
                        allCrudNames?.update
                      ) && (
                        <span
                          id="editData"
                          role="button"
                          onClick={() => {
                            setModalShow({ show: true, type: "form" });
                            setInitialValues({
                              ...category,
                              metaKeywords: category?.metaKeywords
                                ? category?.metaKeywords?.split(",")
                                : [],
                            });
                          }}
                        >
                          <EditIcon bg={"bg"} />
                        </span>
                      )}

                      {checkPageAccess(
                        pageAccess,
                        allPages?.category,
                        allCrudNames?.delete
                      ) && (
                        <span
                          role="button"
                          id="deleteData"
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
                                handleDelete(category.id);
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
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={3} className="text-center">
                    <RecordNotFound />
                  </td>
                </tr>
              )}
        </tbody>
      </Table>

      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      {toast?.show && !modalShow?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && !modalShow?.show && <Loader />}

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === "form" && (
          <MainCategoryForm
            initialValues={initialValues}
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            onSubmit={onSubmit}
          />
        )}

        {modalShow?.show && modalShow?.type === "details" && (
          <MainCategoryDetails
            initialValues={initialValues}
            setModalShow={setModalShow}
            modalShow={modalShow}
          />
        )}
      </Suspense>
    </React.Fragment>
  );
};

export default MainCategoryList;
