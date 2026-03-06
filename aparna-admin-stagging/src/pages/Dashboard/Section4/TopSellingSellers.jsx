import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import axiosProvider from "../../../lib/AxiosProvider";
import ShimmeringEffect from "../../../components/shimmering/ShimmeringEffect";
import { _kycImg_ } from "../../../lib/ImagePath";
import { textTooltip } from "../../../lib/AllGlobalFunction";
import { Table } from "react-bootstrap";
import RecordNotFound from "../../../components/RecordNotFound";

const TopChartsCard = ({ orderCount, loading }) => {
  const sliderRef = useRef(null);
  const productbannerslick = {
    dots: false,
    arrows: true,
    slidesToShow: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: true,
    centerMode: false,
  };
  const itemCount = orderCount?.topSellingSellers?.length || 0;
  const tableWidth = itemCount > 5 ? "calc(100% - 8px)" : "100%";
  return loading ? (
    <ShimmeringEffect />
  ) : (
    <>
      <div className="card h-100">
        <div className="card_head">
          <h5 style={{ fontWeight: "600", marginBottom: "0" }}>
            Top Selling Sellers
          </h5>
        </div>
        <div className="card_body pt-0">
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <Table
              cellPadding={3}
              cellSpacing={3}
              style={{ marginBottom: "0", borderBottom: "transparent" }}
            >
              <thead
                style={{
                  display: "table",
                  width: tableWidth,
                  tableLayout: "fixed",
                }}
              >
                <tr className="table_heading_seller">
                  <th>Seller Name</th>
                  <th className="text-center">Total Orders</th>
                  <th className="text-center">Total Selling</th>
                </tr>
              </thead>
            </Table>
            <div className="custom-scrollbar">
              <Table
                cellPadding={3}
                cellSpacing={3}
                className="table_seller_main"
                style={{
                  display: "table",
                  width: "100%",
                  tableLayout: "fixed",
                  marginBottom: "0",
                }}
              >
                <tbody>
                  {orderCount?.topSellingSellers?.length > 0 ? (
                    orderCount?.topSellingSellers?.map((item, index) => (
                      <tr key={index}>
                        <td>{item?.sellerName}</td>
                        <td className="text-center">
                          {textTooltip(item?.totalOrders)}
                        </td>
                        <td className="text-center">
                          {textTooltip(item?.totalSell)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        <RecordNotFound showSubTitle={false} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
          {/* <Slider
            {...productbannerslick}
            ref={sliderRef}
            className='hr-product-widget'
          >
            {orderCount?.topSellingSellers?.length > 0 &&
              orderCount?.topSellingSellers?.map((item) => (
                <div className='row'>
                  <div className='hr_brand_img col'>
                    <img
                      src={`${process.env.REACT_APP_IMG_URL}${_kycImg_}${item?.sellerLogo}`}
                      alt={'image'}
                    />
                  </div>
                  <div className='col text-center'>
                    <p className='hr_prdt_name'>
                      <span>Seller Name: </span>{' '}
                      <span className='font-weight-bold'>
                        {item?.sellerName}
                      </span>{' '}
                    </p>
                    <p className='hr_prdt_dtl'>
                      SKU: {item?.productSKU ?? 'Not specified'}
                    </p>
                  </div>
                  <div className='total_counts col'>
                    <div className='count_item'>
                      <h5>Total Orders</h5>
                      <p className='fs-4'>{textTooltip(item?.totalOrders)}</p>
                    </div>
                    <div className='count_item'>
                      <h5>Total Sellings</h5>
                      <p className='fs-4'>{textTooltip(item?.totalSell)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </Slider> */}
        </div>
      </div>
    </>
  );
};

export default TopChartsCard;
