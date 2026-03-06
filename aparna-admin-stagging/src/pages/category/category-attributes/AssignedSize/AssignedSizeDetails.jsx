import React from 'react'
import { Table } from 'react-bootstrap'
import ModelComponent from '../../../../components/Modal.jsx'

const AssignedSizeDetails = ({
  allModals,
  setAllModals,
  allState,
  setAllState
}) => {
  return (
    <ModelComponent
      show={allModals?.sizeButtonClick}
      modalsize={'md'}
      className="modal-backdrop"
      modalheaderclass={''}
      modeltitle={
        allState?.dataForModalTable?.length > 0
          ? `Size Type: ${allState?.dataForModalTable[0]?.sizeTypeName}`
          : 'Size Type'
      }
      onHide={() => {
        setAllState((draft) => {
          draft.dataForModalTable = []
        })
        setAllModals((draft) => {
          draft.sizeButtonClick = !draft?.sizeButtonClick
        })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={''}
    >
      <Table responsive className="align-middle table-list">
        {allState?.dataForModalTable && (
          <tbody key={Math.floor(Math.random() * 1000000)}>
            <tr>
              <td>
                <th className="text-nowrap">Size Value</th>
              </td>
              <td>
                {allState?.dataForModalTable
                  ?.map((item) => item?.sizeName)
                  ?.join(', ')}
              </td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Allow As Filter</th>
              </td>
              <td>
                {allState?.dataForModalTable[0]?.isAllowSizeInFilter
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Allow As Title</th>
              </td>
              <td>
                {allState?.dataForModalTable[0]?.isAllowSizeInTitle
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr>
            {allState?.dataForModalTable[0]?.isAllowSizeInTitle && (
              <tr>
                <td>
                  <th className="text-nowrap">Size Title Sequence</th>
                </td>
                <td>
                  {allState?.dataForModalTable[0]?.titleSequenceOfSize
                    ? allState?.dataForModalTable[0]?.titleSequenceOfSize
                    : 0}
                </td>
              </tr>
            )}
            {/* <tr>
              <td>
                <th className="text-nowrap">Allow As Comparision</th>
              </td>
              <td>
                {allState?.dataForModalTable[0]?.isAllowSizeInComparision
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr> */}
            <tr>
              <td>
                <th className="text-nowrap">Allow As Variant</th>
              </td>
              <td>
                {allState?.dataForModalTable[0]?.isAllowSizeInVariant
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Allow As Variant</th>
              </td>
              <td>
                {allState?.dataForModalTable[0]?.isAllowSizeInVariant
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr>
          </tbody>
        )}
      </Table>
    </ModelComponent>
  )
}

export default AssignedSizeDetails
