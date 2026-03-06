import moment from 'moment';
import React from 'react'
import { Badge, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import RecordNotFound from '../../../components/RecordNotFound';
import RefundForm from './RefundForm';
import ViewRefundList from './ViewRefundList';
import Previewicon from '../../../components/AllSvgIcon/Previewicon';
import EditIcon from '../../../components/AllSvgIcon/EditIcon';
import { allCrudNames, allPages, checkPageAccess } from '../../../lib/AllPageNames';

const RefundPaidList = ({
  refundData,
  setInitialValues,
  setRefundData,
  setShowViewModal,
  handleSubmit,
  showViewModal,
  initialVal,
  initialValues,
  activeToggle,
  listType,
}) => {
  const { pageAccess } = useSelector((state) => state?.user);
  return (
    <>
      <div className="tab-content">
        <div
          id="returnList"
          className={`tab-pane fade ${
            activeToggle === "Paid" ? "active show" : ""
          }`}
        >
          <Table responsive className="align-middle table-list">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>User Details</th>
                <th>Refund Amount</th>
                <th>Refund Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {refundData?.data?.data?.length > 0 ? (
                refundData?.data?.data?.map((data, index) => (
                  <tr className="bg-white">
                    <td>{data?.orderNo}</td>
                    <td>{moment(data?.createdAt).format("DD/MM/YYYY")}</td>
                    <td>
                      <div className="d-flex flex-column gap-1 align-items-start">
                        {data?.userName && (
                          <Badge bg="secondary">Name: {data?.userName}</Badge>
                        )}
                        {data?.userEmail && (
                          <Badge bg="secondary">Email: {data?.userEmail}</Badge>
                        )}
                        {data?.userPhoneNo && (
                          <Badge bg="secondary">
                            Mobile: {data?.userPhoneNo}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>{data?.refundAmount}</td>
                    <td>{data?.status}</td>
                    <td className="center text-center">
                      <div>
                        <div
                          onClick={() => {
                            setShowViewModal(true);
                            setInitialValues(data);
                          }}
                        >
                          <Previewicon bg={"bg"} />
                        </div>

                        {/* <div>
                          {checkPageAccess(
                            pageAccess,
                            allPages.refundList,
                            allCrudNames.update
                          ) ? (
                            <span
                              onClick={() => {
                                setRefundData((prev) => ({
                                  ...prev,
                                  model: true,
                                })),
                                  setInitialValues(data);
                              }}
                            >
                              <EditIcon bg={"bg"} />
                            </span>
                          ) : (
                            "-"
                          )}
                        </div> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    <RecordNotFound showSubTitle={false} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {refundData?.model && (
        <RefundForm
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          showModal={refundData.model}
          setRefundData={setRefundData}
          handleSubmit={handleSubmit}
        />
      )}

      {showViewModal && (
        <ViewRefundList
          showViewModal={showViewModal}
          initialVal={initialVal}
          initialValues={initialValues}
          setInitialValues={setInitialValues}
          setShowViewModal={setShowViewModal}
          listType={listType}
        />
      )}
    </>
  )
}

export default RefundPaidList
