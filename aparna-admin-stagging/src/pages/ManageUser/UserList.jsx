import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useImmer } from "use-immer";
import Previewicon from "../../components/AllSvgIcon/Previewicon.jsx";
import BasicFilterComponents from "../../components/BasicFilterComponents.jsx";
import Loader from "../../components/Loader.jsx";
import RecordNotFound from "../../components/RecordNotFound.jsx";
import { encodedSearchText, showToast } from "../../lib/AllGlobalFunction.jsx";
import { pageRangeDisplayed } from "../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../lib/AxiosProvider.jsx";
import { _exception } from "../../lib/exceptionMessage.jsx";
import useDebounce from "../../lib/useDebounce.js";
import { setPageTitle } from "../redux/slice/pageTitleSlice.jsx";
import { useDispatch, useSelector } from "react-redux";

const UserList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const debounceSearchText = useDebounce(searchText, 500);
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "CustomerData/search",
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
            <th>User Name</th>
            <th>Email Id</th>
            <th>Created At</th>
            <th>Mobile Number</th>
            <th>User Type</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>
                    {data?.firstName} {data?.lastName}
                  </td>
                  <td>{data?.userName}</td>
                  <td>{data?.createdAt.split('T')[0]}</td>
                  <td>{data?.mobileNo}</td>
                  <td>{data?.userType}</td>
                  <td>{data?.gender}</td>
                  <td
                    className="text-center"
                    onClick={() => navigate(`/users/manage-user/${data?.id}#user`)}
                  >
                    <span>
                      <Previewicon bg={"bg"} />
                    </span>
                  </td>
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
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      {loading && <Loader />}
    </>
  );
};

export default UserList;
