import moment from 'moment'
import React from 'react'
import invoicelogo from '../../../images/logo.png'

function Invoice({ modalShow, setModalShow }) {
  let { data } = modalShow

  function checkTaxApplicability(DataValue) {
    let applicable = {}
    if (DataValue?.invoiceProduct?.length > 0) {
      const invoiceProduct = DataValue?.invoiceProduct[0]

      const cgst = invoiceProduct.cgstAmount
      const sgst = invoiceProduct.sgstAmount
      const igst = invoiceProduct.igstAmount

      if (cgst === 0 && sgst === 0) {
        applicable = { igst: true }
      } else if (igst === 0) {
        applicable = { sgst: true }
      }
    }
    return applicable
  }

  const getAllKeys = (obj) => {
    let keys = { Heading: [] }

    for (let key in obj) {
      keys?.Heading.push(key)
    }

    return keys
  }

  const result = data && checkTaxApplicability(data)
  const headingData = data && getAllKeys(JSON.parse(data?.itemDetails?.heading))
  const itemTax = data && JSON.parse(data?.itemDetails?.productItems[0]?.taxes)

  // useEffect(() => {
  //   if (data) {
  //     const element = document.getElementById('invoice-component')

  //     html2pdf(element, {
  //       margin: [0.2, 0],
  //       filename: 'invoice.pdf',
  //       html2canvas: { scale: 4, letterRendering: true, useCORS: true },
  //       jsPDF: {
  //         unit: 'in',
  //         format: 'letter',
  //         orientation: 'portrait',
  //         compressImages: false
  //       }
  //     })
  //     setModalShow(false)
  //   }
  // }, [data])

  return (
    <div id='invoice-component'>
      <table
        style={{
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          borderSpacing: 0,
          WebkitBoxDirection: 'normal',
          WebkitBoxOrient: 'vertical',
          MsTextSizeAdjust: '100%',
          WebkitTextSizeAdjust: '100%',
          minWidth: '320px',
          Margin: '0 auto',
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
                verticalAlign: 'top',
                borderCollapse: 'collapse !important'
              }}
            >
              <table width='100%' cellPadding='0' cellSpacing='0' border='0'>
                <tr>
                  <td align='center' style={{ backgroundColor: '#ffffff' }}>
                    <div
                      className='u-row-container'
                      style={{ padding: '0px', backgroundColor: 'transparent' }}
                    >
                      <div
                        className='u-row'
                        style={{
                          margin: '0 auto',
                          minWidth: '320px',
                          maxWidth: '800px',
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
                          <table
                            width='100%'
                            cellPadding='0'
                            cellSpacing='0'
                            border='0'
                          >
                            <tr>
                              <td
                                style={{
                                  padding: '0px',
                                  backgroundColor: 'transparent'
                                }}
                                align='center'
                              >
                                <table
                                  cellPadding='0'
                                  cellSpacing='0'
                                  border='0'
                                  style={{ width: '800px' }}
                                >
                                  <tr
                                    style={{ backgroundColor: 'transparent' }}
                                  >
                                    <td
                                      align='center'
                                      width='150'
                                      style={{
                                        // width: "300px",
                                        padding: '0px',
                                        borderTop: '0px solid transparent',
                                        borderLeft: '0px solid transparent',
                                        borderRight: '0px solid transparent',
                                        borderBottom: '0px solid transparent',
                                        borderRadius: '0px',
                                        WebkitBorderRadius: '0px',
                                        MozBorderRadius: '0px'
                                      }}
                                      valign='top'
                                    >
                                      <div
                                        className='u-col u-col-50'
                                        style={{
                                          maxWidth: '300px',
                                          minWidth: '300px',
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
                                              borderTop:
                                                '0px solid transparent',
                                              borderLeft:
                                                '0px solid transparent',
                                              borderRight:
                                                '0px solid transparent',
                                              borderBottom:
                                                '0px solid transparent',
                                              borderRadius: '0px',
                                              WebkitBorderRadius: '0px',
                                              MozBorderRadius: '0px'
                                            }}
                                          >
                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
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
                                                          align='center'
                                                        >
                                                          <div
                                                            style={{
                                                              fontSize: '14px',
                                                              color: '#000000',
                                                              lineHeight:
                                                                '140%',
                                                              textAlign: 'left',
                                                              wordWrap:
                                                                'break-word'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                lineHeight:
                                                                  '140%'
                                                              }}
                                                            >
                                                              <span
                                                                role='presentation'
                                                                dir='ltr'
                                                                style={{
                                                                  lineHeight:
                                                                    '19.6px'
                                                                }}
                                                              >
                                                                {data?.sellerLegalName ??
                                                                  '-'}
                                                                {/* Seller Name */}
                                                              </span>
                                                              <br role='presentation' />
                                                              <span
                                                                role='presentation'
                                                                dir='ltr'
                                                                style={{
                                                                  lineHeight:
                                                                    '19.6px'
                                                                }}
                                                              >
                                                                {data?.sellerPickupAddressLine1
                                                                  ? `
                                                                  ${data?.sellerPickupAddressLine1},`
                                                                  : ''}

                                                                {data?.sellerPickupAddressLine2
                                                                  ? `
                                                                  ${data?.sellerPickupAddressLine2},`
                                                                  : ''}

                                                                {data?.sellerPickupLandmark
                                                                  ? `
                                                                  ${data?.sellerPickupLandmark},`
                                                                  : ''}
                                                                {/* Address */}
                                                              </span>
                                                              <br role='presentation' />
                                                            </span>
                                                          </div>
                                                        </td>
                                                      </tr>
                                                    </table>

                                                    <table
                                                      style={{
                                                        fontFamily:
                                                          'Open Sans,Verdana,sans-serif'
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
                                                              overflowWrap:
                                                                'break-word',
                                                              wordBreak:
                                                                'break-word',

                                                              fontFamily:
                                                                'Open Sans,Verdana,sans-serif'
                                                            }}
                                                            align='left'
                                                          >
                                                            <div
                                                              style={{
                                                                fontSize:
                                                                  '14px',
                                                                lineHeight:
                                                                  '140%',
                                                                textAlign:
                                                                  'left',
                                                                wordWrap:
                                                                  'break-word'
                                                              }}
                                                            >
                                                              <span
                                                                style={{
                                                                  lineHeight:
                                                                    '140%'
                                                                }}
                                                              >
                                                                {
                                                                  data?.sellerPickupCity
                                                                }
                                                                ,{' '}
                                                                {
                                                                  data?.sellerPickupState
                                                                }{' '}
                                                                -{' '}
                                                                {
                                                                  data?.sellerPickupPincode
                                                                }
                                                                {/* sellerPickup
                                                              address */}
                                                              </span>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>

                                                    {data?.sellerPickupTaxNo && (
                                                      <table
                                                        style={{
                                                          fontFamily:
                                                            'Open Sans,Verdana,sans-serif'
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
                                                                overflowWrap:
                                                                  'break-word',
                                                                wordBreak:
                                                                  'break-word',
                                                                fontFamily:
                                                                  'Open Sans,Verdana,sans-serif'
                                                              }}
                                                              align='left'
                                                            >
                                                              <div
                                                                style={{
                                                                  fontSize:
                                                                    '14px',
                                                                  lineHeight:
                                                                    '140%',
                                                                  textAlign:
                                                                    'left',
                                                                  wordWrap:
                                                                    'break-word'
                                                                }}
                                                              >
                                                                <span
                                                                  style={{
                                                                    lineHeight:
                                                                      '140%'
                                                                  }}
                                                                >
                                                                  GST No. :{' '}
                                                                  {/* 894759483754375 */}
                                                                  {
                                                                    data?.sellerPickupTaxNo
                                                                  }
                                                                </span>
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        </tbody>
                                                      </table>
                                                    )}
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td
                                      align='center'
                                      width='150'
                                      style={{
                                        // width: "250px",
                                        padding: '0px',
                                        borderTop: '0px solid transparent',
                                        borderLeft: '0px solid #000',
                                        borderRight: '0px solid transparent',
                                        borderBottom: '0px solid transparent',
                                        borderRadius: '0px',
                                        WebkitBorderRadius: '0px',
                                        MozBorderRadius: '0px'
                                      }}
                                      valign='top'
                                    >
                                      <div
                                        className='u-col u-col-50'
                                        style={{
                                          maxWidth: '300px',
                                          minWidth: '300px',
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
                                              borderTop:
                                                '0px solid transparent',
                                              borderLeft: '1px solid #CCC',
                                              borderRight:
                                                '0px solid transparent',
                                              borderBottom:
                                                '0px solid transparent',
                                              borderRadius: '0px',
                                              WebkitBorderRadius: '0px',
                                              MozBorderRadius: '0px'
                                            }}
                                          >
                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='left'
                                                  >
                                                    <h1
                                                      style={{
                                                        margin: '0px',
                                                        lineHeight: '140%',
                                                        textAlign: 'left',
                                                        wordWrap: 'break-word',
                                                        fontSize: '22px',
                                                        fontWeight: '400',
                                                        color: '#000'
                                                      }}
                                                    >
                                                      TAX INVOICE
                                                    </h1>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '0px 10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='left'
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: '14px',
                                                        textAlign: 'left',
                                                        wordWrap: 'break-word'
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          color: '#000'
                                                        }}
                                                      >
                                                        Invoice No. # :
                                                        {data?.invoiceNo}
                                                      </span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>

                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '0px 10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='left'
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: '14px',
                                                        textAlign: 'left',
                                                        wordWrap: 'break-word'
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          color: '#000'
                                                        }}
                                                      >
                                                        Invoice Date. :{' '}
                                                        {moment(
                                                          data?.invoiceDate
                                                        ).format(
                                                          'DD MMM, YYYY'
                                                        )}
                                                        {/* 27-10-2023 */}
                                                      </span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>

                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '0px 10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='left'
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: '14px',
                                                        textAlign: 'left',
                                                        wordWrap: 'break-word'
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          color: '#000'
                                                        }}
                                                      >
                                                        Order No. # :
                                                        {data?.orderNo}
                                                      </span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>

                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '0px 10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='left'
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: '14px',
                                                        color: '#000',
                                                        textAlign: 'left',
                                                        wordWrap: 'break-word'
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          color: '#000'
                                                        }}
                                                      >
                                                        Order Date. :{' '}
                                                        {moment(
                                                          data?.orderDate
                                                        ).format(
                                                          'DD MMM, YYYY'
                                                        )}
                                                        {/* 27-10-2023 */}
                                                      </span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td
                                      align='center'
                                      style={{
                                        // width: "20%",
                                        padding: '15px',
                                        borderTop: '0px solid transparent',
                                        borderLeft: '0px solid #000',
                                        borderRight: '0px solid transparent',
                                        borderBottom: '0px solid transparent',
                                        borderRadius: '0px',
                                        WebkitBorderRadius: '0px',
                                        MozBorderRadius: '0px',
                                        verticalAlign: 'middle',
                                        textAlign: 'left'
                                      }}
                                      valign='middle'
                                    >
                                      <img
                                        src={invoicelogo}
                                        id='invoiceimage'
                                        align='center'
                                        border='0'
                                        width={'100%'}
                                        style={{
                                          width: '100%',
                                          paddingRight: '40px'
                                        }}
                                        alt='Invoice Logo'
                                      />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
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
                          maxWidth: '800px',
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
                          <table
                            width='100%'
                            cellPadding='0'
                            cellSpacing='0'
                            border='0'
                          >
                            <tr>
                              <td
                                style={{
                                  padding: '0px',
                                  backgroundColor: 'transparent'
                                }}
                                align='center'
                              >
                                <table
                                  cellPadding='0'
                                  cellSpacing='0'
                                  border='0'
                                  style={{ width: '800px' }}
                                >
                                  <tr
                                    style={{ backgroundColor: 'transparent' }}
                                  >
                                    <td
                                      align='center'
                                      width='800'
                                      style={{
                                        width: '800px',
                                        padding: '0px',
                                        borderTop: '0px solid transparent',
                                        borderLeft: '0px solid transparent',
                                        borderRight: '0px solid transparent',
                                        borderBottom: '0px solid transparent',
                                        borderRadius: '0px',
                                        WebkitBorderRadius: '0px',
                                        MozBorderRadius: '0px'
                                      }}
                                      valign='top'
                                    >
                                      <div
                                        className='u-col u-col-100'
                                        style={{
                                          maxWidth: '320px',
                                          minWidth: '800px',
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
                                              borderTop:
                                                '0px solid transparent',
                                              borderLeft:
                                                '0px solid transparent',
                                              borderRight:
                                                '0px solid transparent',
                                              borderBottom:
                                                '0px solid transparent',
                                              borderRadius: '0px',
                                              WebkitBorderRadius: '0px',
                                              MozBorderRadius: '0px'
                                            }}
                                          >
                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
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
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
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
                                                        borderCollapse:
                                                          'collapse',
                                                        tableLayout: 'fixed',
                                                        borderSpacing: '0',
                                                        msoTableLspace: '0px',
                                                        msoTableRspace: '0px',
                                                        verticalAlign: 'top',
                                                        borderTop:
                                                          '1px solid #838383',
                                                        msTextSizeAdjust:
                                                          '100%',
                                                        WebkitTextSizeAdjust:
                                                          '100%'
                                                      }}
                                                    >
                                                      <tbody>
                                                        <tr
                                                          style={{
                                                            verticalAlign: 'top'
                                                          }}
                                                        >
                                                          <td
                                                            style={{
                                                              wordBreak:
                                                                'break-word',
                                                              borderCollapse:
                                                                'collapse !important',
                                                              verticalAlign:
                                                                'top',
                                                              fontSize: '0px',
                                                              lineHeight: '0px',
                                                              msoLineHeightRule:
                                                                'exactly',
                                                              msTextSizeAdjust:
                                                                '100%',
                                                              WebkitTextSizeAdjust:
                                                                '100%'
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
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
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
                          maxWidth: '800px',
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
                                    fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                            'Open Sans,Verdana,sans-serif'
                                        }}
                                        align='left'
                                      >
                                        <h2
                                          style={{
                                            margin: '0px',
                                            lineHeight: '60%',
                                            textAlign: 'left',
                                            wordWrap: 'break-word',
                                            fontSize: '18px',
                                            fontWeight: '400'
                                          }}
                                        >
                                          <span
                                            role='presentation'
                                            dir='ltr'
                                            style={{
                                              lineHeight: '10.8px',
                                              color: '#000'
                                            }}
                                          >
                                            Bill To:
                                          </span>
                                        </h2>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <table
                                  style={{
                                    fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                          padding: '0px 10px',
                                          fontFamily:
                                            'Open Sans,Verdana,sans-serif'
                                        }}
                                        align='left'
                                      >
                                        <div
                                          style={{
                                            fontSize: '14px',
                                            lineHeight: '140%',
                                            textAlign: 'left',
                                            wordWrap: 'break-word'
                                          }}
                                        >
                                          <span
                                            style={{
                                              lineHeight: '140%',
                                              color: '#000'
                                            }}
                                          >
                                            {data?.userName}
                                            {/* dropCompanyName */}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table
                                  style={{
                                    fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                          padding: '0px 10px',
                                          fontFamily:
                                            'Open Sans,Verdana,sans-serif'
                                        }}
                                        align='left'
                                      >
                                        <div
                                          style={{
                                            fontSize: '14px',
                                            lineHeight: '140%',
                                            textAlign: 'left',
                                            wordWrap: 'break-word'
                                          }}
                                        >
                                          <span
                                            style={{
                                              lineHeight: '140%',
                                              color: '#000'
                                            }}
                                          >
                                            {data?.billToAddressLine1
                                              ? `
                                                                  ${data?.billToAddressLine1},`
                                              : ''}
                                            {data?.billToAddressLine2
                                              ? `
                                                                  ${data?.billToAddressLine2},`
                                              : ''}
                                            {data?.billToLendmark
                                              ? `
                                                                  ${data?.billToLendmark},`
                                              : ''}
                                            {/* dropAddressLine1 dropAddressLine2
                                          dropLandmark */}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table
                                  style={{
                                    fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                          padding: '0px 10px',
                                          fontFamily:
                                            'Open Sans,Verdana,sans-serif'
                                        }}
                                        align='left'
                                      >
                                        <div
                                          style={{
                                            fontSize: '14px',
                                            lineHeight: '140%',
                                            textAlign: 'left',
                                            wordWrap: 'break-word'
                                          }}
                                        >
                                          <span
                                            style={{
                                              lineHeight: '140%',
                                              color: '#000'
                                            }}
                                          >
                                            {data?.billToCity
                                              ? `
                                                                  ${data?.billToCity},`
                                              : ''}
                                            {data?.billToState
                                              ? `
                                                                  ${data?.billToState}-`
                                              : ''}
                                            {data?.billToPincode}
                                            {/* dropCity dropState */}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {data?.billToGSTNo &&
                                  data?.billToGSTNo !== '' && (
                                    <table
                                      style={{
                                        fontFamily:
                                          'Open Sans,Verdana,sans-serif'
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
                                              padding: '0px 10px',
                                              fontFamily:
                                                'Open Sans,Verdana,sans-serif'
                                            }}
                                            align='left'
                                          >
                                            <div
                                              style={{
                                                fontSize: '14px',
                                                lineHeight: '140%',
                                                textAlign: 'left',
                                                wordWrap: 'break-word'
                                              }}
                                            >
                                              <span
                                                style={{
                                                  lineHeight: '140%',
                                                  color: '#000'
                                                }}
                                              >
                                                GST No. :{data?.billToGSTNo}
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div
                            className='u-col u-col-50'
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
                                  borderLeft: '1px solid #ccc',
                                  borderRight: '0px solid transparent',
                                  borderBottom: '0px solid transparent',
                                  borderRadius: '0px',
                                  WebkitBorderRadius: '0px',
                                  MozBorderRadius: '0px'
                                }}
                              >
                                <table
                                  style={{
                                    fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                            'Open Sans,Verdana,sans-serif'
                                        }}
                                        align='left'
                                      >
                                        <h1
                                          style={{
                                            margin: '0px',
                                            lineHeight: '60%',
                                            textAlign: 'left',
                                            wordWrap: 'break-word',
                                            fontSize: '18px',
                                            fontWeight: '400',
                                            color: '#000'
                                          }}
                                        >
                                          Ship To:
                                        </h1>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {data?.userName && (
                                  <table
                                    style={{
                                      fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                            padding: '0px 10px',
                                            fontFamily:
                                              'Open Sans,Verdana,sans-serif'
                                          }}
                                          align='left'
                                        >
                                          <div
                                            style={{
                                              fontSize: '14px',
                                              lineHeight: '140%',
                                              textAlign: 'left',
                                              wordWrap: 'break-word'
                                            }}
                                          >
                                            <span
                                              style={{
                                                lineHeight: '140%',
                                                color: '#000'
                                              }}
                                            >
                                              {data?.userName}
                                              {/* dropCompanyName */}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                )}

                                {(data?.shipToAddressLine1 ||
                                  data?.shipToAddressLine2 ||
                                  data?.shipToLendmark) && (
                                  <table
                                    style={{
                                      fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                            padding: '0px 10px',
                                            fontFamily:
                                              'Open Sans,Verdana,sans-serif'
                                          }}
                                          align='left'
                                        >
                                          <div
                                            style={{
                                              fontSize: '14px',
                                              lineHeight: '140%',
                                              textAlign: 'left',
                                              wordWrap: 'break-word'
                                            }}
                                          >
                                            <span
                                              style={{
                                                lineHeight: '140%',
                                                color: '#000'
                                              }}
                                            >
                                              {data?.shipToAddressLine1
                                                ? `
                                                                  ${data?.shipToAddressLine1},`
                                                : ''}
                                              {data?.shipToAddressLine2
                                                ? `
                                                                  ${data?.shipToAddressLine2},`
                                                : ''}
                                              {data?.shipToLendmark
                                                ? `
                                                                  ${data?.shipToLendmark},`
                                                : ''}
                                              {/* dropAddressLine1 dropAddressLine1
                                          dropAddressLine1 */}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                )}

                                {(data?.shipToCity || data?.shipToState) && (
                                  <table
                                    style={{
                                      fontFamily: 'Open Sans,Verdana,sans-serif'
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
                                            padding: '0px 10px',
                                            fontFamily:
                                              'Open Sans,Verdana,sans-serif'
                                          }}
                                          align='left'
                                        >
                                          <div
                                            style={{
                                              fontSize: '14px',
                                              lineHeight: '140%',
                                              textAlign: 'left',
                                              wordWrap: 'break-word'
                                            }}
                                          >
                                            <span
                                              style={{
                                                lineHeight: '140%',
                                                color: '#000'
                                              }}
                                            >
                                              {data?.shipToCity
                                                ? `
                                                                  ${data?.shipToCity},`
                                                : ''}
                                              {data?.shipToState
                                                ? `
                                                                  ${data?.shipToState}-`
                                                : ''}
                                              {data?.shipToPincode}
                                              {/* dropCity dropState dropPincode */}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                )}
                                {data?.shipToGSTNo &&
                                  data?.shipToGSTNo !== '' && (
                                    <table
                                      style={{
                                        fontFamily:
                                          'Open Sans,Verdana,sans-serif'
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
                                              padding: '0px 10px',
                                              fontFamily:
                                                'Open Sans,Verdana,sans-serif'
                                            }}
                                            align='left'
                                          >
                                            <div
                                              style={{
                                                fontSize: '14px',
                                                lineHeight: '140%',
                                                textAlign: 'left',
                                                wordWrap: 'break-word'
                                              }}
                                            >
                                              <span
                                                style={{
                                                  lineHeight: '140%',
                                                  color: '#000'
                                                }}
                                              >
                                                GST No. :{data?.shipToGSTNo}
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  )}
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
                          maxWidth: '800px',
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
                          <table
                            width='100%'
                            cellPadding='0'
                            cellSpacing='0'
                            border='0'
                          >
                            <tbody>
                              <tr>
                                <td
                                  style={{
                                    padding: '0px',
                                    backgroundColor: 'transparent'
                                  }}
                                  align='center'
                                >
                                  <table
                                    cellPadding='0'
                                    cellSpacing='0'
                                    border='0'
                                    style={{ width: '800px' }}
                                  >
                                    <tbody>
                                      <tr
                                        style={{
                                          backgroundColor: 'transparent'
                                        }}
                                      >
                                        <td
                                          align='center'
                                          width='800'
                                          style={{
                                            width: '800px',
                                            padding: '0px',
                                            borderTop: '0px solid transparent',
                                            borderLeft: '0px solid transparent',
                                            borderRight:
                                              '0px solid transparent',
                                            borderBottom:
                                              '0px solid transparent',
                                            borderRadius: '0px',
                                            WebkitBorderRadius: '0px',
                                            MozBorderRadius: '0px'
                                          }}
                                          valign='top'
                                        >
                                          <div
                                            className='u-col u-col-100'
                                            style={{
                                              maxWidth: '320px',
                                              minWidth: '800px',
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
                                                  borderTop:
                                                    '0px solid transparent',
                                                  borderLeft:
                                                    '0px solid transparent',
                                                  borderRight:
                                                    '0px solid transparent',
                                                  borderBottom:
                                                    '0px solid transparent',
                                                  borderRadius: '0px',
                                                  WebkitBorderRadius: '0px',
                                                  MozBorderRadius: '0px'
                                                }}
                                              >
                                                <table
                                                  style={{
                                                    fontFamily:
                                                      "'Rubik',sans-serif",
                                                    role: 'presentation',
                                                    cellpadding: '0',
                                                    cellspacing: '0',
                                                    width: '100%',
                                                    border: '0'
                                                  }}
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style={{
                                                          overflowWrap:
                                                            'break-word',
                                                          wordBreak:
                                                            'break-word',
                                                          padding:
                                                            '10px 10px 0',
                                                          fontFamily:
                                                            "'Rubik',sans-serif"
                                                        }}
                                                        align='left'
                                                      >
                                                        <table
                                                          height='0px'
                                                          align='center'
                                                          border='0'
                                                          cellpadding='0'
                                                          cellspacing='0'
                                                          style={{
                                                            width: '100%',
                                                            borderCollapse:
                                                              'collapse',
                                                            tableLayout:
                                                              'fixed',
                                                            borderSpacing: '0',
                                                            msoTableLspace:
                                                              '0px',
                                                            msoTableRspace:
                                                              '0px',
                                                            verticalAlign:
                                                              'top',
                                                            borderTop:
                                                              '1px solid #838383',
                                                            msTextSizeAdjust:
                                                              '100%',
                                                            WebkitTextSizeAdjust:
                                                              '100%'
                                                          }}
                                                        >
                                                          <tbody>
                                                            <tr
                                                              style={{
                                                                verticalAlign:
                                                                  'top'
                                                              }}
                                                            >
                                                              <td
                                                                style={{
                                                                  wordBreak:
                                                                    'break-word',
                                                                  borderCollapse:
                                                                    'collapse !important',
                                                                  verticalAlign:
                                                                    'top',
                                                                  fontSize:
                                                                    '0px',
                                                                  lineHeight:
                                                                    '0px',
                                                                  msoLineHeightRule:
                                                                    'exactly',
                                                                  msTextSizeAdjust:
                                                                    '100%',
                                                                  WebkitTextSizeAdjust:
                                                                    '100%'
                                                                }}
                                                              >
                                                                <span>
                                                                  &#160;
                                                                </span>
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

                    <div
                      className='u-row-container'
                      style={{ padding: '0px', backgroundColor: 'transparent' }}
                    >
                      <div
                        className='u-row'
                        style={{
                          margin: '0 auto',
                          minWidth: '320px',
                          maxWidth: '800px',
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
                          <table
                            width='100%'
                            cellPadding='0'
                            cellSpacing='0'
                            border='0'
                          >
                            <tr>
                              <td
                                style={{
                                  padding: '0px',
                                  backgroundColor: 'transparent'
                                }}
                                align='center'
                              >
                                <table
                                  cellPadding='0'
                                  cellSpacing='0'
                                  border='0'
                                  style={{ width: '800px' }}
                                >
                                  <tr
                                    style={{ backgroundColor: 'transparent' }}
                                  >
                                    <td
                                      align='center'
                                      width='800'
                                      style={{
                                        width: '800px',
                                        padding: '0px',
                                        borderTop: '0px solid transparent',
                                        borderLeft: '0px solid transparent',
                                        borderRight: '0px solid transparent',
                                        borderBottom: '0px solid transparent',
                                        borderRadius: '0px',
                                        WebkitBorderRadius: '0px',
                                        MozBorderRadius: '0px'
                                      }}
                                      valign='top'
                                    >
                                      <div
                                        className='u-col u-col-100'
                                        style={{
                                          maxWidth: '320px',
                                          minWidth: '800px',
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
                                              borderTop:
                                                '0px solid transparent',
                                              borderLeft:
                                                '0px solid transparent',
                                              borderRight:
                                                '0px solid transparent',
                                              borderBottom:
                                                '0px solid transparent',
                                              borderRadius: '0px',
                                              WebkitBorderRadius: '0px',
                                              MozBorderRadius: '0px'
                                            }}
                                          >
                                            <table
                                              style={{
                                                fontFamily:
                                                  'Open Sans,Verdana,sans-serif'
                                              }}
                                              role='presentation'
                                              cellPadding='0'
                                              cellSpacing='0'
                                              width='100%'
                                              border='0'
                                              borderCollapse='separate'
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    style={{
                                                      overflowWrap:
                                                        'break-word',
                                                      wordBreak: 'break-word',
                                                      padding: '10px',
                                                      fontFamily:
                                                        'Open Sans,Verdana,sans-serif'
                                                    }}
                                                    align='center'
                                                  >
                                                    <div>
                                                      <table
                                                        style={{
                                                          borderCollapse:
                                                            'separate',
                                                          width: '100%'
                                                        }}
                                                        cellSpacing='2'
                                                      >
                                                        <tr>
                                                          {headingData &&
                                                            headingData?.Heading?.map(
                                                              (item) => (
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '136px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    backgroundColor:
                                                                      '#f5f5f5',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '12px',
                                                                      fontWeight:
                                                                        '500',
                                                                      color:
                                                                        '#000'
                                                                    }}
                                                                  >
                                                                    {item}
                                                                  </span>
                                                                </td>
                                                              )
                                                            )}
                                                          {/* <td
                                                            style={{
                                                              width: '46px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '1px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Item Price
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '46px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '1px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Qty.
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '56px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Amount
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '42px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Dis.
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '60px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                paddingLeft:
                                                                  '6px',
                                                                textIndent:
                                                                  '-6px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Taxable Amt.
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '42px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              CGST
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '42px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              SGST
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '41px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'left',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              IGST
                                                            </span>
                                                          </td>
                                                          <td
                                                            style={{
                                                              width: '59px',
                                                              borderTopStyle:
                                                                'solid',
                                                              borderTopWidth:
                                                                '1px',
                                                              borderLeftStyle:
                                                                'solid',
                                                              borderLeftWidth:
                                                                '1px',
                                                              borderBottomStyle:
                                                                'solid',
                                                              borderBottomWidth:
                                                                '1px',
                                                              borderRightStyle:
                                                                'solid',
                                                              borderRightWidth:
                                                                '1px',
                                                              backgroundColor:
                                                                '#f5f5f5',
                                                              textAlign:
                                                                'center'
                                                            }}
                                                          >
                                                            <span
                                                              style={{
                                                                paddingTop:
                                                                  '7px',
                                                                paddingLeft:
                                                                  '16px',
                                                                paddingRight:
                                                                  '14px',
                                                                textIndent:
                                                                  '0px',
                                                                textAlign:
                                                                  'center',
                                                                fontSize:
                                                                  '12px',
                                                                fontWeight:
                                                                  '500',
                                                                color: '#000'
                                                              }}
                                                            >
                                                              Total
                                                            </span>
                                                          </td> */}
                                                        </tr>
                                                        {data?.itemDetails
                                                          ?.productItems
                                                          ?.length > 0 &&
                                                          data?.itemDetails?.productItems?.map(
                                                            (item) => {
                                                              const taxesItem =
                                                                JSON.parse(
                                                                  item?.taxes
                                                                )
                                                              const orderTaxRate =
                                                                JSON.parse(
                                                                  item?.orderTaxRate
                                                                )
                                                              return (
                                                                <tr
                                                                  style={{
                                                                    height:
                                                                      '82px',
                                                                    pageBreakInside:
                                                                      'avoid',
                                                                    pageBreakAfter:
                                                                      'auto'
                                                                  }}
                                                                >
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '136px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingLeft:
                                                                          '3px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'left',
                                                                        fontSize:
                                                                          '14px',
                                                                        display:
                                                                          'block'
                                                                      }}
                                                                    >
                                                                      {/* Product name */}
                                                                      {
                                                                        item?.productName
                                                                      }
                                                                    </span>
                                                                    <p
                                                                      className='s4'
                                                                      style={{
                                                                        paddingLeft:
                                                                          '3px',
                                                                        marginBottom:
                                                                          '0px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'left',
                                                                        fontSize:
                                                                          '12px'
                                                                      }}
                                                                    >
                                                                      <div className='s3'>
                                                                        <b>
                                                                          SKU
                                                                          Code:
                                                                        </b>
                                                                        {
                                                                          item?.skuCode
                                                                        }
                                                                      </div>
                                                                      <div className='s3'>
                                                                        <b>
                                                                          {' '}
                                                                          Brand:{' '}
                                                                        </b>
                                                                        {
                                                                          item?.brand
                                                                        }
                                                                      </div>{' '}
                                                                      <div className='s3'>
                                                                        <b>
                                                                          {' '}
                                                                          Size :
                                                                        </b>
                                                                        {
                                                                          item?.size
                                                                        }
                                                                      </div>{' '}
                                                                      <div className='s3'>
                                                                        <b>
                                                                          {' '}
                                                                          HSN
                                                                          Code:
                                                                        </b>
                                                                        {
                                                                          item?.hsnCode
                                                                        }
                                                                      </div>
                                                                    </p>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '46px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {/* mrp */}
                                                                      {
                                                                        item?.itemPrice
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '32px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      style={{
                                                                        textIndent:
                                                                          '0px'
                                                                      }}
                                                                    ></span>
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {
                                                                        item?.discount
                                                                      }
                                                                      %
                                                                      {/* Qty */}
                                                                    </span>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '56px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {/* sellingPrice */}
                                                                      {
                                                                        item?.amount
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '42px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {/* discount */}
                                                                      {
                                                                        item?.quantity
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '60px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {
                                                                        taxesItem?.TaxAbleAmt
                                                                      }
                                                                    </span>
                                                                  </td>

                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '42px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    {taxesItem?.SGST && (
                                                                      <>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            paddingTop:
                                                                              '2px',
                                                                            paddingLeft:
                                                                              '2px',
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.SGST
                                                                          }
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          @
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.SGSTRate
                                                                          }
                                                                          %
                                                                        </span>
                                                                      </>
                                                                      // ) : (
                                                                      //   <span
                                                                      //     className='s3'
                                                                      //     style={{
                                                                      //       paddingTop:
                                                                      //         '7px',
                                                                      //       paddingLeft:
                                                                      //         '2px',
                                                                      //       textIndent:
                                                                      //         '0px',
                                                                      //       textAlign:
                                                                      //         'center',
                                                                      //       fontSize:
                                                                      //         '14px'
                                                                      //     }}
                                                                      //   >
                                                                      //     N.A.
                                                                      //   </span>
                                                                    )}
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '42px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    {taxesItem?.CGST && (
                                                                      <>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            paddingTop:
                                                                              '2px',
                                                                            paddingLeft:
                                                                              '2px',
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.CGST
                                                                          }
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          @
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.CGSTRate
                                                                          }
                                                                          %
                                                                        </span>
                                                                      </>
                                                                      // ) : (
                                                                      //   <span
                                                                      //     className='s3'
                                                                      //     style={{
                                                                      //       paddingTop:
                                                                      //         '7px',
                                                                      //       paddingLeft:
                                                                      //         '2px',
                                                                      //       textIndent:
                                                                      //         '0px',
                                                                      //       textAlign:
                                                                      //         'center',
                                                                      //       fontSize:
                                                                      //         '14px'
                                                                      //     }}
                                                                      //   >
                                                                      //     N.A.
                                                                      //   </span>
                                                                    )}
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '41px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    {taxesItem?.IGST && (
                                                                      <>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            paddingTop:
                                                                              '2px',
                                                                            paddingLeft:
                                                                              '2px',
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.IGST
                                                                          }
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          @
                                                                        </span>
                                                                        <span
                                                                          className='s3'
                                                                          style={{
                                                                            textIndent:
                                                                              '0px',
                                                                            textAlign:
                                                                              'center',
                                                                            fontSize:
                                                                              '14px',
                                                                            display:
                                                                              'block'
                                                                          }}
                                                                        >
                                                                          {
                                                                            taxesItem?.IGST
                                                                          }
                                                                          %
                                                                        </span>
                                                                      </>
                                                                      // ) : (
                                                                      //   <span
                                                                      //     className='s3'
                                                                      //     style={{
                                                                      //       paddingTop:
                                                                      //         '7px',
                                                                      //       paddingLeft:
                                                                      //         '2px',
                                                                      //       textIndent:
                                                                      //         '0px',
                                                                      //       textAlign:
                                                                      //         'center',
                                                                      //       fontSize:
                                                                      //         '14px'
                                                                      //     }}
                                                                      //   >
                                                                      //     N.A.
                                                                      //   </span>
                                                                    )}
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '59px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      paddingLeft:
                                                                        '3px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      {/* totalAmount */}
                                                                      {
                                                                        item?.totalAmount
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                </tr>
                                                              )
                                                            }
                                                          )}

                                                        <tr
                                                          style={{
                                                            pageBreakInside:
                                                              'avoid',
                                                            pageBreakAfter:
                                                              'auto'
                                                          }}
                                                        >
                                                          <td
                                                            style={{
                                                              width: '100%'
                                                            }}
                                                            colSpan='10'
                                                          >
                                                            <table
                                                              style={{
                                                                width: '100%'
                                                              }}
                                                            >
                                                              {Boolean(
                                                                data?.imeiNo
                                                              ) && (
                                                                <tr>
                                                                  <td
                                                                    style={{
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px'
                                                                    }}
                                                                    colSpan='10'
                                                                  >
                                                                    <span
                                                                      className='s5'
                                                                      style={{
                                                                        paddingTop:
                                                                          '2px',
                                                                        paddingLeft:
                                                                          '4px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'left',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      <b>
                                                                        IMEI/Series
                                                                        No. 1:
                                                                      </b>
                                                                      <span className='s6'>
                                                                        {
                                                                          data?.imeiNo
                                                                        }
                                                                      </span>
                                                                    </span>
                                                                  </td>
                                                                </tr>
                                                              )}
                                                              <tr>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '497px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'right'
                                                                  }}
                                                                  colSpan='9'
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      paddingRight:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'right',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    Subtotal
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '59px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      paddingRight:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data.totalSubAmount
                                                                    }
                                                                  </span>
                                                                </td>
                                                              </tr>
                                                              {Boolean(
                                                                data?.coupontDiscount
                                                              ) && (
                                                                <tr>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '497px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      textAlign:
                                                                        'right'
                                                                    }}
                                                                    colSpan='9'
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '2px',
                                                                        paddingRight:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'right',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      Coupon
                                                                      Discount
                                                                    </span>
                                                                  </td>
                                                                  <td
                                                                    style={{
                                                                      width:
                                                                        '59px',
                                                                      borderStyle:
                                                                        'solid',
                                                                      borderWidth:
                                                                        '1px',
                                                                      borderTopStyle:
                                                                        'solid',
                                                                      borderTopWidth:
                                                                        '1px',
                                                                      borderLeftStyle:
                                                                        'solid',
                                                                      borderLeftWidth:
                                                                        '1px',
                                                                      borderBottomStyle:
                                                                        'solid',
                                                                      borderBottomWidth:
                                                                        '1px',
                                                                      borderRightStyle:
                                                                        'solid',
                                                                      borderRightWidth:
                                                                        '1px',
                                                                      textAlign:
                                                                        'center'
                                                                    }}
                                                                  >
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '2px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        paddingRight:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      -
                                                                      {
                                                                        data.coupontDiscount
                                                                      }
                                                                    </span>
                                                                  </td>
                                                                </tr>
                                                              )}
                                                              <tr
                                                                style={{
                                                                  height: '28px'
                                                                }}
                                                              >
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '312px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'right'
                                                                  }}
                                                                  colSpan='5'
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'right',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    Shipping
                                                                    Charges
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '60px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    paddingLeft:
                                                                      '3px',
                                                                    paddingRight:
                                                                      '3px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.taxAbleShippingCharges
                                                                    }
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      {' '}
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.cTaxOnShipping
                                                                        }
                                                                        @
                                                                      </span>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.sTaxOnShipping
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result.igst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.iTaxOnShipping
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        18%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                {/* <td
                                                                  style={{
                                                                    width:
                                                                      '41px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    N.A.
                                                                  </span>
                                                                </td> */}
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '59px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.shippingCharge
                                                                    }
                                                                  </span>
                                                                </td>
                                                              </tr>
                                                              <tr
                                                                style={{
                                                                  height: '28px'
                                                                }}
                                                              >
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '312px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'right'
                                                                  }}
                                                                  colSpan='5'
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'right',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    Extra
                                                                    Charges
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '60px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    paddingLeft:
                                                                      '3px',
                                                                    paddingRight:
                                                                      '3px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.taxAbleExtracharges
                                                                    }
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.cTaxOnExtracharges
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.sTaxOnExtracharges
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.igst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.iTaxOnExtracharges
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        18%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                {/* <td
                                                                  style={{
                                                                    width:
                                                                      '41px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    N.A.
                                                                  </span>
                                                                </td> */}
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '59px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.totalExtracharges
                                                                    }
                                                                  </span>
                                                                </td>
                                                              </tr>
                                                              <tr>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '312px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'right'
                                                                  }}
                                                                  colSpan='5'
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'right',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    COD Charges
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '60px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    paddingLeft:
                                                                      '3px',
                                                                    paddingRight:
                                                                      '3px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.taxAbleCODCharge
                                                                    }
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '60px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.cTaxOnCODCharge
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.sgst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.sTaxOnCODCharge
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        9%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '42px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  {result?.igst ? (
                                                                    <>
                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          paddingTop:
                                                                            '2px',
                                                                          paddingLeft:
                                                                            '2px',
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px',
                                                                          display:
                                                                            'block'
                                                                        }}
                                                                      >
                                                                        {
                                                                          data?.cTaxOnExtracharges
                                                                        }
                                                                        @
                                                                      </span>

                                                                      <span
                                                                        className='s3'
                                                                        style={{
                                                                          textIndent:
                                                                            '0px',
                                                                          textAlign:
                                                                            'center',
                                                                          fontSize:
                                                                            '14px'
                                                                        }}
                                                                      >
                                                                        18%
                                                                      </span>
                                                                    </>
                                                                  ) : (
                                                                    <span
                                                                      className='s3'
                                                                      style={{
                                                                        paddingTop:
                                                                          '7px',
                                                                        paddingLeft:
                                                                          '2px',
                                                                        textIndent:
                                                                          '0px',
                                                                        textAlign:
                                                                          'center',
                                                                        fontSize:
                                                                          '14px'
                                                                      }}
                                                                    >
                                                                      N.A.
                                                                    </span>
                                                                  )}
                                                                </td>
                                                                {/* <td
                                                                  style={{
                                                                    width:
                                                                      '41px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    N.A.
                                                                  </span>
                                                                </td> */}
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '59px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '7px',
                                                                      paddingLeft:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontSize:
                                                                        '14px'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data?.codCharge
                                                                    }
                                                                  </span>
                                                                </td>
                                                              </tr>

                                                              <tr
                                                                style={{
                                                                  height: '17px'
                                                                }}
                                                              >
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '497px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'right'
                                                                  }}
                                                                  colSpan='9'
                                                                >
                                                                  <span
                                                                    className='s3'
                                                                    style={{
                                                                      paddingTop:
                                                                        '2px',
                                                                      paddingRight:
                                                                        '3px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'right',
                                                                      fontWeight: 600,
                                                                      fontSize:
                                                                        '14px',
                                                                      color:
                                                                        '#000'
                                                                    }}
                                                                  >
                                                                    Total
                                                                  </span>
                                                                </td>
                                                                <td
                                                                  style={{
                                                                    width:
                                                                      '59px',
                                                                    borderStyle:
                                                                      'solid',
                                                                    borderWidth:
                                                                      '1px',
                                                                    borderTopStyle:
                                                                      'solid',
                                                                    borderTopWidth:
                                                                      '1px',
                                                                    borderLeftStyle:
                                                                      'solid',
                                                                    borderLeftWidth:
                                                                      '1px',
                                                                    borderBottomStyle:
                                                                      'solid',
                                                                    borderBottomWidth:
                                                                      '1px',
                                                                    borderRightStyle:
                                                                      'solid',
                                                                    borderRightWidth:
                                                                      '1px',
                                                                    textAlign:
                                                                      'center'
                                                                  }}
                                                                >
                                                                  <span
                                                                    style={{
                                                                      paddingLeft:
                                                                        '2px',
                                                                      paddingRight:
                                                                        '2px',
                                                                      textIndent:
                                                                        '0px',
                                                                      textAlign:
                                                                        'center',
                                                                      fontWeight: 600,
                                                                      fontSize:
                                                                        '14px',
                                                                      color:
                                                                        '#000'
                                                                    }}
                                                                  >
                                                                    {
                                                                      data.invoiceAmount
                                                                    }
                                                                    {/* invoice Amount */}
                                                                  </span>
                                                                </td>
                                                              </tr>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Invoice
