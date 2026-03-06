import moment from "moment";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useImmer } from "use-immer";
import Previewicon from "../../components/AllSvgIcon/Previewicon.jsx";
import BasicFilterComponents from "../../components/BasicFilterComponents.jsx";
import Loader from "../../components/Loader.jsx";
import ModelComponent from "../../components/Modal.jsx";
import RecordNotFound from "../../components/RecordNotFound.jsx";
import { encodedSearchText } from "../../lib/AllGlobalFunction.jsx";
import { pageRangeDisplayed } from "../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../lib/AxiosProvider.jsx";
import useDebounce from "../../lib/useDebounce.js";

const LogList = () => {
  const [data, setData] = useState();
  const [searchText, setSearchText] = useState();
  const [loading, setLoading] = useState(false);
  const debounceSearchText = useDebounce(searchText, 500);
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 100,
    pageIndex: 1,
    searchText: "",
  });
  const [modalShow, setModalShow] = useState({ show: false, type: null });

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
        endpoint: "Log/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
      });
      setLoading(false);
      if (response?.status === 200) {
        setData(response);
      }
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

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

  return (
    <>
      <div className="d-flex mb-3">
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
            <th>User type</th>
            <th>Action</th>
            <th>Url</th>
            <th>Log title</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data.map((data) => (
                <tr key={data.id}>
                  <td>{data?.userType}</td>
                  <td>{data.action}</td>
                  <td>{data.url}</td>
                  <td>{data?.logTitle}</td>
                  <td>{moment(data?.createdAt)?.format("DD-MM-YYYY HH:mm")}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <span
                        onClick={() => {
                          setModalShow({
                            show: true,
                            type: "log-details",
                            data:
                              data?.logDescription &&
                              JSON?.parse(data?.logDescription),
                          });
                        }}
                      >
                        <Previewicon bg={"bg"} />
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={6} className="text-center">
                    <RecordNotFound showSubTitle={false} />
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

      <ModelComponent
        show={modalShow?.show && modalShow?.type === "log-details"}
        modalsize={"xxl"}
        modalheaderclass={""}
        modeltitle={`Specifications`}
        onHide={() => {
          setModalShow({ show: false });
        }}
        btnclosetext={""}
        closebtnvariant={""}
        backdrop={"static"}
        formbuttonid={""}
      >
        <div className="gap-3 grid_2">
          <Table responsive hover className="align-middle table-list">
            <tbody>
              <tr>
                <th colSpan={2}>Old</th>
              </tr>
              {typeof modalShow?.data?.old === "object" &&
              Object.keys(modalShow?.data?.old)?.length > 0 ? (
                Object.entries(modalShow?.data?.old).map(
                  ([key, value], index) => (
                    <tr key={index}>
                      <td className="text-nowrap">{key}</td>
                      <td className={value ? "" : "text-center"}>
                        {Array.isArray(value)
                          ? value.map((item, i) =>
                              typeof item === "object" ? (
                                <div key={i}>{JSON.stringify(item)}</div>
                              ) : (
                                <div key={i}>{item}</div>
                              )
                            )
                          : value
                          ? value.toString()
                          : "-"}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td className="text-nowrap">
                    {typeof modalShow?.data?.new === "string"
                      ? modalShow?.data?.new
                      : "Record not found"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Table responsive hover className="align-middle table-list">
            <tbody>
              <tr>
                <th colSpan={2}>New</th>
              </tr>
              {typeof modalShow?.data?.new === "object" &&
              Object.keys(modalShow?.data?.new)?.length > 0 ? (
                Object.entries(modalShow?.data?.new).map(
                  ([key, value], index) => (
                    <tr key={index}>
                      <td className="text-nowrap">{key}</td>
                      <td className={value ? "" : "text-center"}>
                        {Array.isArray(value)
                          ? value.map((item, i) =>
                              typeof item === "object" ? (
                                <div key={i}>{JSON.stringify(item)}</div>
                              ) : (
                                <div key={i}>{item}</div>
                              )
                            )
                          : value
                          ? value.toString()
                          : "-"}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td className="text-nowrap">
                    {typeof modalShow?.data?.new === "string"
                      ? modalShow?.data?.new
                      : "Record not found"}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </ModelComponent>
    </>
  );
};

export default LogList;
