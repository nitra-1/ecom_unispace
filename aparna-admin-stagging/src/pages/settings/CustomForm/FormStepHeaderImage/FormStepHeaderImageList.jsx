import React, { Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
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
import { _SwalDelete, _exception } from "../../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../../lib/useDebounce.js";

const FormStepHeaderImageForm = React.lazy(() =>
  import("./FormStepHeaderImageForm.jsx")
);
const FormStepHeaderImageList = () => {
  const initVal = {
    stepId: "",
    fieldId: "",
    title: "",
    subTitle: "",
    description: "",
    badge: "",
    image: "",
    filename: "",
  };
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  const [allState, setAllState] = useImmer({
    formSteps: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: "",
      hasInitialized: false,
    },
    formStepsField: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: "",
      hasInitialized: false,
    },
  });
  const [modalShow, setModalShow] = useState({
    show: false,
    type: "",
    data: null,
  });
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(initVal);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `ManageFormStepsHeaderImage?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname,
      });
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
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "ManageFormStepsHeaderImage",
        queryString: `?SearchText=${encodedSearchText(
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
  };

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
  }, [debounceSearchText]);

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return (
    <>
      <div className="d-flex align-items-center mb-3 gap-3 justify-content-between">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}

        {checkPageAccess(
          pageAccess,
          allPages?.customForm,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              setInitialValues(initVal);
              setModalShow({ show: true, type: "form", data: null });
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}
      </div>
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Title</th>
            <th>Sub Title</th>
            <th>Subscription</th>
            <th>Badge</th>
            {checkPageAccess(pageAccess, allPages?.customForm, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((item, index) => (
                <tr key={index}>
                  <td>{item?.title}</td>
                  <td>{item?.subTitle ?? "-"}</td>
                  <td className="paragh__mb0" dangerouslySetInnerHTML={{ __html: item?.description ?? "-" }}/>
                  <td>{item?.badge ?? "-"}</td>
                  {checkPageAccess(pageAccess, allPages?.customForm, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.customForm,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(item);
                              setModalShow({
                                show: true,
                                type: "form",
                              });
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.customForm,
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
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText:
                                  _SwalDelete.confirmButtonText,
                                cancelButtonText: _SwalDelete.cancelButtonText,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(item?.id);
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
            : !loading && (
                <tr>
                  <td colSpan={2} className="text-center">
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
      {modalShow?.show && modalShow?.type === "form" && (
        <Suspense fallback={<Loader />}>
          <FormStepHeaderImageForm
            loading={loading}
            setLoading={setLoading}
            initialValues={initialValues}
            modalShow={modalShow}
            setModalShow={setModalShow}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            allState={allState}
            setAllState={setAllState}
          />
        </Suspense>
      )}

      {loading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};

export default FormStepHeaderImageList;
