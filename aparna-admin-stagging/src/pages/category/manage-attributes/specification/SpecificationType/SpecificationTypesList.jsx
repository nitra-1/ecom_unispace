import React, { lazy, Suspense, useEffect, useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../../components/AllSvgIcon/DeleteIcon";
import EditIcon from "../../../../../components/AllSvgIcon/EditIcon";
import BasicFilterComponents from "../../../../../components/BasicFilterComponents";
import { customStyles } from "../../../../../components/customStyles";
import Loader from "../../../../../components/Loader";
import RecordNotFound from "../../../../../components/RecordNotFound";
import CustomToast from "../../../../../components/Toast/CustomToast";
import {
  encodedSearchText,
  showToast,
} from "../../../../../lib/AllGlobalFunction";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../../lib/AllPageNames";
import { pageRangeDisplayed } from "../../../../../lib/AllStaticVariables";
import axiosProvider from "../../../../../lib/AxiosProvider";
import { _exception, _SwalDelete } from "../../../../../lib/exceptionMessage";
import useDebounce from "../../../../../lib/useDebounce";

const SpecificationTypeForm = lazy(() => import("./SpecificationTypeForm"));

const SpecificationTypesList = ({
  initVal,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  // const initVal = {
  //   name: '',
  //   fieldType: '',
  //   parentId: null
  // }
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  const [dropDownData, setDropDownData] = useState();
  // const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(true);
  const { pageAccess, userInfo } = useSelector((state) => state.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
  // const [initialValues, setInitialValues] = useState(initVal)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 25,
    pageIndex: 1,
    searchText: "",
    specificationID: "",
    specificationName: "",
  });
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
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
        endpoint: "SpecificationType/delete",
        queryString: `?id=${id}`,
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
    } catch (error) {
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
        endpoint: "SpecificationType/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&SpecificationID=${filterDetails?.specificationID}`,
      });

      if (response?.status === 200) {
        setData(response);
      }
    } catch (error) {
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

  const fetchDropDownData = async (
    endpoint,
    queryString = "?pageindex=0&PageSize=0",
    setterFunc
  ) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint,
        queryString,
      });
      if (response?.status === 200 && response?.data?.data) {
        return setterFunc(response?.data?.data);
      }
    } catch (error) {
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

  useEffect(() => {
    fetchDropDownData(`Specification/get`, "?pageIndex=0&pageSize=0", (data) =>
      setDropDownData(data)
    );
  }, []);

  return (
    <>
      <Row className="my-3 justify-content-between-space">
        {data && (
          <Col md={12}>
            <Row className="align-items-center">
              <Col md={4}>
                <Select
                  isClearable
                  id="specificationID"
                  name="specificationID"
                  styles={customStyles}
                  menuPortalTarget={document.body}
                  placeholder="Select Specification"
                  value={
                    filterDetails?.specificationID && {
                      label: filterDetails?.specificationName,
                      value: filterDetails?.specificationID,
                    }
                  }
                  options={dropDownData?.map(({ id, name }) => ({
                    value: id,
                    label: name,
                  }))}
                  onChange={(e) => {
                    setFilterDetails((draft) => {
                      draft.specificationID = e?.value ?? "";
                      draft.specificationName = e?.label ?? "";
                    });
                  }}
                />
              </Col>
              <Col md={8}>
                {data && (
                  <div className="d-flex align-items-center gap-3">
                    <BasicFilterComponents
                      data={data}
                      filterDetails={filterDetails}
                      setFilterDetails={setFilterDetails}
                      searchText={searchText}
                      setSearchText={setSearchText}
                    />
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        )}
      </Row>
      <Table responsive hover className="align-middle table-list">
        <thead>
          <tr>
            <th>Specification</th>
            <th>Specification Type</th>
            <th>Field Type</th>
            {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{data?.parentName}</td>
                  <td>{data?.name}</td>
                  <td>{data?.fieldType === "Textbox" ? "Text" : "List"}</td>
                  {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(data);
                              setModalShow(true);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
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
                                  handleDelete(data?.id);
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
                  <td colSpan={4} className="text-center">
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
          pageCount={data?.data?.pagination?.pageCount ?? 0}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <SpecificationTypeForm
            loading={loading}
            setLoading={setLoading}
            modalShow={modalShow}
            setModalShow={setModalShow}
            initVal={initVal}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            dropDownData={dropDownData}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};

export default SpecificationTypesList;
