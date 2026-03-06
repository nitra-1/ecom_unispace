import { Divider, Steps } from 'antd'
import React from 'react'
import ModelComponent from '../../../components/Modal.jsx'

const TrackOrder = ({ modalShow, setModalShow }) => {
  return (
    <ModelComponent
      show={modalShow?.show}
      modalsize={'lg'}
      className='modal-backdrop'
      modalheaderclass={''}
      modeltitle={'Tracking details'}
      onHide={() => {
        setModalShow({ show: !modalShow?.show, data: null })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
    >
      <Divider />
      <Steps
        progressDot
        current={modalShow?.data?.length}
        direction='vertical'
        items={modalShow?.data?.map((item) => {
          return {
            title: `Order stage: ${item?.orderStage}`,
            description: `Order status: ${item?.orderStatus} on ${new Date(
              item?.trackDate
            ).toLocaleDateString()} at ${new Date(
              item?.trackDate
            ).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}`
          }
        })}
      />
    </ModelComponent>
  )
}

export default TrackOrder
