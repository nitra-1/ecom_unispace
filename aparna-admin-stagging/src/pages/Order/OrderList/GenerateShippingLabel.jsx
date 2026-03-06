import html2pdf from 'html2pdf.js'
import moment from 'moment'
import React, { useEffect } from 'react'
import Barcode from 'react-barcode'

const GenerateShippingLabel = ({ setModalShow, modalShow }) => {
  let { data } = modalShow
  useEffect(() => {
    if (data) {
      const element = document.getElementById('shipping-label')
      html2pdf(element, {
        margin: [0.2, 0],
        filename: 'label.pdf',
        html2canvas: { scale: 4, letterRendering: true, useCORS: true },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait',
          compressImages: false
        }
      })
      setModalShow({ ...modalShow, show: false })
    }
  }, [])

  const barcodeOptions = {
    width: 1, // Width of a single bar (adjust as needed)
    height: 80 // Height of the barcode (adjust as needed)
  }
  return (
    <div id='shipping-label'>
      {data?.length > 0 &&
        data?.map((data) => (
          <table
            style={{
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              borderSpacing: 0,
              msoTableLspace: '0pt',
              msoTableRspace: '0pt',
              verticalAlign: 'top',
              maxWidth: '400px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              width: '100%'
            }}
            cellPadding='0'
            cellSpacing='0'
          >
            <tbody>
              <tr style={{ verticalAlign: 'top' }}>
                <td
                  style={{
                    wordBreak: 'break-word',
                    borderCollapse: 'collapse !important',
                    verticalAlign: 'top'
                  }}
                >
                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px 10px 10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <table
                                        width='100%'
                                        cellPadding='0'
                                        cellSpacing='0'
                                        border='0'
                                      >
                                        <tr>
                                          <td
                                            style={{
                                              paddingRight: '0px',
                                              paddingLeft: '0px'
                                            }}
                                            align='left'
                                          >
                                            <Barcode
                                              value={data?.awbNo}
                                              {...barcodeOptions}
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '61px 20px 20px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <h2
                                        style={{
                                          margin: '0px',
                                          lineHeight: '130%',
                                          textAlign: 'left',
                                          wordWrap: 'break-word',
                                          fontSize: '15px',
                                          fontWeight: '400'
                                        }}
                                      >
                                        <strong>Order No. # :</strong>
                                        {data?.orderNo}
                                        <br />
                                        <strong>Order Date. :</strong>
                                        {moment(data?.orderDate).format('dddd')}
                                        ,{' '}
                                        {moment(data?.orderDate).format(
                                          'DD MMMM'
                                        )}
                                      </h2>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-100'
                          style={{
                            maxWidth: '320px',
                            minWidth: '400px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <table
                                        height='0px'
                                        align='center'
                                        border='0'
                                        cellPadding='0'
                                        cellSpacing='0'
                                        width='100%'
                                        style={{
                                          borderCollapse: 'collapse',
                                          tableLayout: 'fixed',
                                          borderSpacing: '0',
                                          msoTableLspace: '0pt',
                                          msoTableRspace: '0pt',
                                          verticalAlign: 'top',
                                          borderTop: '1px solid #bbbbbb',
                                          msTextSizeAdjust: '100%',
                                          WebkitTextSizeAdjust: '100%'
                                        }}
                                      >
                                        <tbody>
                                          <tr style={{ verticalAlign: 'top' }}>
                                            <td
                                              style={{
                                                wordBreak: 'break-word',
                                                borderCollapse:
                                                  'collapse !important',
                                                verticalAlign: 'top',
                                                fontSize: '0px',
                                                lineHeight: '0px',
                                                msoLineHeightRule: 'exactly',
                                                msTextSizeAdjust: '100%',
                                                WebkitTextSizeAdjust: '100%'
                                              }}
                                            >
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <h2
                                        style={{
                                          margin: '0px',
                                          lineHeight: '140%',
                                          textAlign: 'left',
                                          wordWrap: 'break-word',
                                          fontSize: '15px',
                                          fontWeight: '400'
                                        }}
                                      >
                                        <strong>To. :</strong>
                                        <br />
                                        {data?.dropContactPersonName}
                                        <br />
                                        {data?.dropAddressLine1},
                                        <br />
                                        {data?.dropAddressLine2}
                                        <br />
                                        {data?.dropCity}, {data?.dropState} -{' '}
                                        {data?.dropPincode}
                                        <br />
                                        <br />
                                        <strong>Mobile No. : </strong>
                                        {data?.dropContactPersonMobileNo}
                                      </h2>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <h2
                                        style={{
                                          margin: '0px',
                                          lineHeight: '150%',
                                          textAlign: 'left',
                                          wordWrap: 'break-word',
                                          fontSize: '13px',
                                          fontWeight: '400'
                                        }}
                                      >
                                        <strong>From. :</strong>
                                        <br />
                                        {data?.sellerLegalName}
                                        <br />
                                        {data?.sellerPickupAddressLine1}
                                        <br />
                                        {data?.sellerPickupAddressLine2}
                                        <br />
                                        {data?.sellerPickupLandmark}
                                        <br />
                                        {data?.sellerPickupCity},{' '}
                                        {data?.sellerPickupState} -{' '}
                                        {data?.sellerPickupPincode}
                                        <br />
                                        <br />
                                        <strong>Mobile No. :</strong>{' '}
                                        {
                                          data?.sellerPickupContactPersonMobileNo
                                        }
                                      </h2>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-100'
                          style={{
                            maxWidth: '320px',
                            minWidth: '400px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <table
                                        height='0px'
                                        align='center'
                                        border='0'
                                        cellPadding='0'
                                        cellSpacing='0'
                                        width='100%'
                                        style={{
                                          borderCollapse: 'collapse',
                                          tableLayout: 'fixed',
                                          borderSpacing: '0',
                                          msoTableLspace: '0pt',
                                          msoTableRspace: '0pt',
                                          verticalAlign: 'top',
                                          borderTop: '1px solid #bbbbbb',
                                          msTextSizeAdjust: '100%',
                                          WebkitTextSizeAdjust: '100%'
                                        }}
                                      >
                                        <tbody>
                                          <tr style={{ verticalAlign: 'top' }}>
                                            <td
                                              style={{
                                                wordBreak: 'break-word',
                                                borderCollapse:
                                                  'collapse !important',
                                                verticalAlign: 'top',
                                                fontSize: '0px',
                                                lineHeight: '0px',
                                                msoLineHeightRule: 'exactly',
                                                msTextSizeAdjust: '100%',
                                                WebkitTextSizeAdjust: '100%'
                                              }}
                                            >
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <h2
                                        style={{
                                          margin: '0px',
                                          lineHeight: '140%',
                                          textAlign: 'left',
                                          wordWrap: 'break-word',
                                          fontSize: '15px',
                                          fontWeight: '400'
                                        }}
                                      >
                                        <strong>Shipping By :</strong>{' '}
                                        {data?.courierName}
                                        <br />
                                        <strong>Shipping Date :</strong>{' '}
                                        {moment(data?.shippingDate).format(
                                          'DD MMM YYYY'
                                        )}
                                        <br />
                                        <strong>Weight :</strong>
                                        {data?.weight}
                                        <br />
                                        <strong>No. of Items :</strong>{' '}
                                        {data?.noOfPackage}
                                      </h2>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div
                          className='u-col u-col-50'
                          style={{
                            maxWidth: '320px',
                            minWidth: '200px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '45px 10px 10px 61px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <h2
                                        style={{
                                          margin: '0px',
                                          lineHeight: '140%',
                                          textAlign: 'left',
                                          wordWrap: 'break-word',
                                          fontSize: '25px',
                                          fontWeight: '400'
                                        }}
                                      >
                                        <strong
                                          style={{
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {data?.paymentMode}
                                        </strong>
                                      </h2>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className='u-row-container'
                    style={{ padding: '0px', backgroundColor: 'transparent' }}
                  >
                    <div
                      className='u-row'
                      style={{
                        margin: '0 auto',
                        minWidth: '320px',
                        maxWidth: '400px',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: 'collapse',
                          display: 'table',
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <div
                          className='u-col u-col-100'
                          style={{
                            maxWidth: '320px',
                            minWidth: '400px',
                            display: 'table-cell',
                            verticalAlign: 'top'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: '100% !important',
                              borderRadius: '0px',
                              WebkitBorderRadius: '0px',
                              MozBorderRadius: '0px'
                            }}
                          >
                            <div
                              style={{
                                boxSizing: 'border-box',
                                height: '100%',
                                padding: '0px',
                                borderTop: '0px solid transparent',
                                borderLeft: '0px solid transparent',
                                borderRight: '0px solid transparent',
                                borderBottom: '0px solid transparent',
                                borderRadius: '0px',
                                WebkitBorderRadius: '0px',
                                MozBorderRadius: '0px'
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: 'arial, helvetica, sans-serif'
                                }}
                                role='presentation'
                                cellPadding='0'
                                cellSpacing='0'
                                width='100%'
                                border='0'
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        padding: '10px',
                                        fontFamily:
                                          'arial, helvetica, sans-serif'
                                      }}
                                      align='left'
                                    >
                                      <table
                                        height='0px'
                                        align='center'
                                        border='0'
                                        cellPadding='0'
                                        cellSpacing='0'
                                        width='100%'
                                        style={{
                                          borderCollapse: 'collapse',
                                          tableLayout: 'fixed',
                                          borderSpacing: '0',
                                          msoTableLspace: '0pt',
                                          msoTableRspace: '0pt',
                                          verticalAlign: 'top',
                                          borderTop: '1px solid #bbbbbb',
                                          msTextSizeAdjust: '100%',
                                          WebkitTextSizeAdjust: '100%'
                                        }}
                                      >
                                        <tbody>
                                          <tr style={{ verticalAlign: 'top' }}>
                                            <td
                                              style={{
                                                wordBreak: 'break-word',
                                                borderCollapse:
                                                  'collapse !important',
                                                verticalAlign: 'top',
                                                fontSize: '0px',
                                                lineHeight: '0px',
                                                msoLineHeightRule: 'exactly',
                                                msTextSizeAdjust: '100%',
                                                WebkitTextSizeAdjust: '100%'
                                              }}
                                            >
                                              <span>&#160;</span>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div
                    className="u-row-container"
                    style={{ padding: "0px", backgroundColor: "transparent" }}
                  >
                    <div
                      className="u-row"
                      style={{
                        margin: "0 auto",
                        minWidth: "320px",
                        maxWidth: "400px",
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                        wordBreak: "break-word",
                        backgroundColor: "transparent",
                      }}
                    >
                      <div
                        style={{
                          borderCollapse: "collapse",
                          display: "table",
                          width: "100%",
                          height: "100%",
                          backgroundColor: "transparent",
                        }}
                      >
                        <div
                          className="u-col u-col-100"
                          style={{
                            maxWidth: "320px",
                            minWidth: "400px",
                            display: "table-cell",
                            verticalAlign: "top",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "100% !important",
                              borderRadius: "0px",
                              WebkitBorderRadius: "0px",
                              MozBorderRadius: "0px",
                            }}
                          >
                            <div
                              style={{
                                boxSizing: "border-box",
                                height: "100%",
                                padding: "0px",
                                borderTop: "0px solid transparent",
                                borderLeft: "0px solid transparent",
                                borderRight: "0px solid transparent",
                                borderBottom: "0px solid transparent",
                                borderRadius: "0px",
                                WebkitBorderRadius: "0px",
                                MozBorderRadius: "0px",
                              }}
                            >
                              <table
                                style={{
                                  fontFamily: "arial, helvetica, sans-serif",
                                }}
                                role="presentation"
                                cellPadding="0"
                                cellSpacing="0"
                                width="100%"
                                border="0"
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        overflowWrap: "break-word",
                                        wordBreak: "break-word",
                                        padding: "10px",
                                        fontFamily:
                                          "arial, helvetica, sans-serif",
                                      }}
                                      align="left"
                                    >
                                      <table
                                        width="100%"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        border="0"
                                      >
                                        <tr>
                                          <td
                                            style={{
                                              paddingRight: "0px",
                                              paddingLeft: "0px",
                                            }}
                                            align="center"
                                          >
                                            <img
                                              align="center"
                                              border="0"
                                              src="images/image-1.png"
                                              alt=""
                                              title=""
                                              style={{
                                                outline: "none",
                                                textDecoration: "none",
                                                msInterpolationMode: "bicubic",
                                                clear: "both",
                                                display:
                                                  "inline-block !important",
                                                border: "none",
                                                height: "auto",
                                                float: "none",
                                                width: "100%",
                                                maxWidth: "384px",
                                              }}
                                              width="384"
                                            />
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
    </div>
  )
}

export default GenerateShippingLabel
