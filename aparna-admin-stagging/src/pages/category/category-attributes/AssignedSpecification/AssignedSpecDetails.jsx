import React from 'react'
import { Table } from 'react-bootstrap'
import ModelComponent from '../../../../components/Modal'

const AssignedSpecDetails = ({
  allModals,
  setAllModals,
  allState,
  setAllState
}) => {
  return (
    <ModelComponent
      show={allModals?.valueButtonClick}
      modalsize={'lg'}
      className="modal-backdrop"
      modalheaderclass={''}
      modeltitle={
        allState?.dataForModalTable?.length > 0
          ? `${allState?.dataForModalTable[0]?.specificationTypeName} Specification Values`
          : 'Specification Values'
      }
      onHide={() => {
        setAllState((draft) => {
          draft.dataForModalTable = []
        })
        setAllModals((draft) => {
          draft.valueButtonClick = !draft?.valueButtonClick
        })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={''}
    >
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Values</th>
            <th>In Filter</th>
            <th>In Title</th>
            <th>Seq.</th>
            {/* <th>In Comparision</th> */}
            <th>In Multiple Selection</th>
            <th>In Variant</th>
          </tr>
        </thead>
        <tbody>
          {allState?.dataForModalTable?.length > 0 &&
            allState?.dataForModalTable?.map((elem) => (
              <tr key={Math.floor(Math.random() * 1000000)}>
                <td
                  className={
                    elem?.specificationTypeValueName ? '' : 'text-center'
                  }
                >
                  {elem?.specificationTypeValueName
                    ? elem?.specificationTypeValueName
                    : '-'}
                </td>
                <td>{elem?.isAllowSpecInFilter ? 'Yes' : 'No'}</td>
                <td>{elem?.isAllowSpecInTitle ? 'Yes' : 'No'}</td>
                <td>
                  {elem?.titleSequenceOfSpecification
                    ? elem?.titleSequenceOfSpecification
                    : 0}
                </td>
                {/* <td>{elem?.isAllowSpecInComparision ? 'Yes' : 'No'}</td> */}
                <td>{elem?.isAllowMultipleSelection ? 'Yes' : 'No'}</td>
                <td>{elem?.isAllowSpecInVariant ? 'Yes' : 'No'}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </ModelComponent>
  )
}

export default AssignedSpecDetails
