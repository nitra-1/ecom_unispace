import { Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  InputGroup,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
  Tab,
} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import { useNavigate } from "react-router-dom";
import HKBadge from "../../components/Badges.jsx";
import IpCheckbox from "../../components/IpCheckbox.jsx";
import ModelComponent from "../../components/Modal.jsx";
import {
  fetchCalculation,
  getEmbeddedUrlFromYouTubeUrl,
  prepareDisplayCalculationData,
  removeBrTags,
} from "../../lib/AllGlobalFunction.jsx";
import {
  currencyIcon,
  isAllowCustomProductName,
} from "../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../lib/AxiosProvider.jsx";
import { _productImg_ } from "../../lib/ImagePath.jsx";
import PricingCalculation from "./PricingCalculation.jsx";

const ProductDetail = ({
  previewOffCanvasShow,
  setPreviewOffCanvasShow,
  allState,
  setAllState,
  data,
  navigateUrl,
}) => {
  const thumbnailsRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [modalShow, setModalShow] = useState({ show: false, data: null });
  const [initialValues, setInitialValues] = useState(allState?.preview);
  const scrollToBottom = () => {
    const container = thumbnailsRef.current;
    const scrollTop = container.scrollTop + 200;
    container.scrollTo({ top: scrollTop, behavior: "smooth" });
    setShowScrollButtons({
      showTopButton: true,
      showBottomButton:
        scrollTop < container.scrollHeight - container.clientHeight,
    });
  };
  const scrollToTop = () => {
    const container = thumbnailsRef.current;
    const scrollTop = container.scrollTop - 200;
    container.scrollTo({ top: scrollTop, behavior: "smooth" });
    setShowScrollButtons({
      showTopButton: scrollTop > 0,
      showBottomButton: true,
    });
  };

  const [selectedMedia, setSelectedMedia] = useState(
    allState?.preview?.productImage[0],
  );
  const [showScrollButtons, setShowScrollButtons] = useState({
    showTopButton: false,
    showBottomButton: true,
  });

  const parseHTMLString = (htmlString) => {
    htmlString = removeBrTags(htmlString);
    const container = document.createElement("div");
    container.innerHTML = htmlString;
    const elements = Array.from(container.childNodes);

    return elements.map((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      } else {
        const { tagName, attributes } = node;
        const props = {};
        for (let i = 0; i < attributes.length; i++) {
          const { name, value } = attributes[i];
          props[name] = value;
        }

        const children = parseHTMLString(node.innerHTML);

        return React.createElement(
          tagName.toLowerCase(),
          { key: index, ...props },
          children,
        );
      }
    });
  };

  const handleThumbnailHover = (media) => {
    setSelectedMedia(media);
  };

  const getCalculation = async (getSellerProductPricing, values) => {
    const response = await axiosProvider({
      method: "GET",
      endpoint: "Product/GetCommission",
      queryString: `?sellerId=${
        getSellerProductPricing?.sellerID
          ? getSellerProductPricing?.sellerID
          : ""
      }&CategoryId=${values?.categoryId ? values?.categoryId : 0}&brandId=${
        values?.brandID ? values?.brandID : 0
      }`,
    });
    let commission = response?.data;

    fetchCalculation(
      "Product/DisplayCalculation",
      prepareDisplayCalculationData({
        mrp: getSellerProductPricing?.mrp,
        sellingPrice: getSellerProductPricing?.sellingPrice,
        categoryId: values?.categoryId,
        brandID: values?.brandID,
        sellerID: values?.sellerProduct?.sellerID,
        weightSlabId: values?.sellerProduct?.weightSlabId,
        taxvalueId: values?.sellerProduct?.taxValueId,
        shipmentBy: values?.shipmentBy,
        shippingPaidBy: values?.shippingPaidBy,
        marginPercentage: commission?.amountValue,
        marginIn: commission?.chargesIn,
        marginCost: commission?.amountValue,
      }),
      (displayCalculation) => {
        if (displayCalculation?.customerPricing) {
          setAllState({
            ...allState,
            displayCalculation,
          });
        }
      },
    );
  };

  useEffect(() => {
    setIsMobile(window.innerWidth <= 1024);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const container = thumbnailsRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      setShowScrollButtons({
        showTopButton: container.scrollTop > 0,
        showBottomButton:
          container.scrollTop < container.scrollHeight - container.clientHeight,
      });
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [thumbnailsRef]);

  useEffect(() => {
    if (allState?.preview) {
      let values = {
        ...allState?.preview,
        isCalculationOpen: false,
      };
      setInitialValues(values);

      let getSellerProductPricing =
        values?.sellerProduct?.productPrices?.find((data) => data?.checked) ||
        values?.sellerProduct?.productPrices[0];

      getCalculation(
        {
          ...getSellerProductPricing,
          sellerID: values?.sellerProduct?.sellerID,
          weightSlabId: values?.sellerProduct?.weightSlabId,
        },
        values,
      );
    }
  }, [allState?.preview]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 200:
        return "Active";
      case 0:
      case 400:
      case 404:
      case 500:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const statusLabel = getStatusLabel(data?.status);

  return (
    <Formik enableReinitialize initialValues={initialValues}>
      {({ values, setFieldValue }) => (
        <Form>
          <Offcanvas
            className="pv-offcanvas"
            placement="end"
            show={previewOffCanvasShow}
            backdrop={"static"}
            onHide={() => {
              setAllState({
                ...allState,
                preview: null,
                displayCalculation: null,
              });
              setPreviewOffCanvasShow(false);
              navigate(navigateUrl);
            }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="bold">
                Product Detail Page
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-4">
              <ModelComponent
                show={modalShow?.show}
                className="modal-backdrop"
                modalsize={"lg"}
                modeltitle={"Warehouse Quantities"}
                modalheaderclass={""}
                onHide={() => {
                  setModalShow({ show: !modalShow?.show, data: null });
                }}
                backdrop={"static"}
              >
                {modalShow?.data?.productPrices?.length > 0 &&
                  modalShow?.data?.productPrices?.map((productPrice) => (
                    <Row className="gy-2 flex-wrap">
                      <h5 className="mb-2 head_h3">
                        {!productPrice?.productWarehouses?.length
                          ? `${productPrice?.sizeName} Size Quantity : ${productPrice?.quantity}`
                          : `${productPrice?.sizeName} Size Warehouse Quantities`}
                      </h5>

                      {productPrice?.productWarehouses?.length > 0 &&
                        productPrice?.productWarehouses?.map((warehouse) => (
                          <Col md={3}>
                            <Card className="text-center border">
                              <Card.Header>
                                {warehouse?.warehouseName}
                              </Card.Header>
                              <Card.Body>
                                <Card.Title className="mb-0">
                                  Quantity {warehouse?.quantity}
                                </Card.Title>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  ))}
              </ModelComponent>

              <Tab.Container id="left-tabs-example" defaultActiveKey="Summary">
                <Row className="gy-4 w-100 m-auto">
                  <Col md={12} className="mt-0 px-0">
                    <div
                      className="p-3 bg-white rounded"
                      style={{
                        boxShadow:
                          "0rem 0.0625rem 0.9375rem 0.0625rem rgba(62, 57, 107, 0.07)",
                      }}
                    >
                      <div>
                        <h5 className="bold">
                          {isAllowCustomProductName
                            ? values?.customeProductName
                            : values?.productName}
                        </h5>
                      </div>
                      <div className="d-flex gap-2">
                        <span>Categories :</span>
                        <Breadcrumb>
                          {values?.categoryPathName?.split(">")?.map((item) => (
                            <Breadcrumb.Item>{item}</Breadcrumb.Item>
                          ))}
                        </Breadcrumb>
                      </div>

                      <div className="d-flex gap-3">
                        <HKBadge
                          badgesBgName={
                            values?.sellerProduct?.status === "Active"
                              ? "success"
                              : "danger"
                          }
                          badgesTxtName={values?.sellerProduct?.status}
                          badgeClassName={""}
                        />

                        <span>Product Code :- {values?.productId}</span>
                        <span>
                          Company SKU Code :- {values?.companySKUCode}
                        </span>
                        <span>
                          Seller SKU Code :- {values?.sellerProduct?.sellerSKU}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tab.Container>

              <Row className="mt-4">
                <Col md={6}>
                  <div className="product-details position-sticky top-0">
                    {!isMobile && (
                      <>
                        <div className="thumbnails-container">
                          {showScrollButtons.showTopButton && (
                            <button
                              className="thumbs_btn thumbs_top_btn"
                              onClick={() => {
                                scrollToTop();

                                const updatedSequence = Math.max(
                                  1,
                                  selectedMedia.sequence - 1,
                                );
                                setSelectedMedia(
                                  values?.productImage?.find(
                                    (media) =>
                                      media?.sequence === updatedSequence,
                                  ),
                                );
                              }}
                            >
                              <i className="m-icon icon-up-arrow"></i>
                            </button>
                          )}
                          <div className="thumbnails" ref={thumbnailsRef}>
                            {values?.productImage?.map((media, index) =>
                              media?.type === "video" ? (
                                <div
                                  key={index}
                                  className="video-thumbnail thumbnail"
                                  onMouseOver={() =>
                                    handleThumbnailHover(media)
                                  }
                                >
                                  <img
                                    src={media?.poster}
                                    alt={media?.alt}
                                    style={{ width: "100%" }}
                                  />
                                  <span className="play-icon">▶</span>
                                </div>
                              ) : (
                                <div
                                  key={index}
                                  className={`thumbnail ${
                                    selectedMedia?.url === media?.url
                                      ? "active"
                                      : ""
                                  }`}
                                  onMouseOver={() =>
                                    handleThumbnailHover(media)
                                  }
                                >
                                  <img
                                    src={
                                      media?.type?.toLowerCase() === "image"
                                        ? `${process.env.REACT_APP_IMG_URL}${_productImg_}${media?.url}`
                                        : `https://img.youtube.com/vi/${getEmbeddedUrlFromYouTubeUrl(
                                            media?.url,
                                          )}/0.jpg`
                                    }
                                    alt={`Preview ${
                                      isAllowCustomProductName
                                        ? values?.customeProductName
                                        : values?.productName
                                    }`}
                                    style={{ width: "100%" }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                          {showScrollButtons.showBottomButton && (
                            <button
                              className="thumbs_btn thumbs_btm_btn"
                              onClick={() => {
                                scrollToBottom();
                                const updatedSequence = Math.min(
                                  values?.productImage?.length,
                                  selectedMedia?.sequence + 1,
                                );
                                setSelectedMedia(
                                  values?.productImage?.find(
                                    (media) =>
                                      media.sequence === updatedSequence,
                                  ),
                                );
                              }}
                            >
                              <i className="m-icon  icon-down-arrow"></i>
                            </button>
                          )}
                        </div>

                        <div className="main-media">
                          {selectedMedia?.type?.toLowerCase() === "video" ||
                          allState?.preview?.productImage[0]?.type?.toLowerCase() ===
                            "video" ? (
                            <div className="video-thumbnail slider-video-thumbnail">
                              <iframe
                                src={`https://www.youtube.com/embed/${getEmbeddedUrlFromYouTubeUrl(
                                  selectedMedia?.url ??
                                    allState?.preview?.productImage[0]?.url,
                                )}`}
                                title="Video Player"
                                width="100%"
                                height="450"
                              ></iframe>
                            </div>
                          ) : (
                            <img
                              src={`${
                                process.env.REACT_APP_IMG_URL
                              }${_productImg_}${
                                selectedMedia?.url ??
                                allState?.preview?.productImage[0]?.url
                              }`}
                              alt={`Preview ${values?.productName}`}
                              style={{ width: "100%" }}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* <Accordion
                    defaultActiveKey="0"
                    alwaysOpen
                    className="mt-4 pv-accordion-main"
                  >
                    {(values?.description || values?.highlights) && (
                      <Accordion.Item eventKey="1">
                        <Accordion.Header className="cfs-17 fw-semibold">
                          PRODUCT DETAILS
                        </Accordion.Header>
                        <Accordion.Body>
                          {values?.description && (
                            <>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: values?.description
                                }}
                              />
                            </>
                          )}
                          {values?.highlights && (
                            <>
                              <h4>Highlight</h4>
                              <p className="product-details-var cfz-16">
                                {parseHTMLString(values?.highlights)?.map(
                                  (element, index) => (
                                    <React.Fragment key={index}>
                                      {element}
                                    </React.Fragment>
                                  )
                                )}
                              </p>
                            </>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    )}

                    {values?.productSpecificationsMapp?.length > 0 &&
                      Array.from(
                        new Set(
                          values?.productSpecificationsMapp?.map(
                            (item) => item?.specId
                          )
                        )
                      )?.map((specId) => {
                        let item = values?.productSpecificationsMapp?.filter(
                          (item) => item?.specId === specId
                        )
                        return (
                          <Accordion.Item
                            eventKey={Math.floor(Math.random() * 100000)}
                          >
                            <Accordion.Header>
                              {item[0]?.specificationName}
                            </Accordion.Header>
                            <Accordion.Body>
                              {item?.map((data) => (
                                <div className="cabl-name">
                                  <p className="cabl-name-title">
                                    {data?.specificationTypeName} :
                                  </p>
                                  <p className="cable-title-detail">
                                    {data?.value}
                                  </p>
                                </div>
                              ))}
                            </Accordion.Body>
                          </Accordion.Item>
                        )
                      })}
                  </Accordion> */}
                </Col>

                <Col md={6}>
                  <Card className="product-card-main mb-4">
                    <Card.Body>
                      {values?.brandName && (
                        <div className="product_brands_wishlist_icon">
                          <p className="prdct__brands_nm">
                            {values?.brandName}
                          </p>
                        </div>
                      )}

                      <h2 className="product_name">
                        {isAllowCustomProductName
                          ? values?.customeProductName
                          : values?.productName}
                      </h2>

                      <div className="product_pricong_offer_deliverychrg">
                        <span className="total_pricing_product">
                          {currencyIcon}
                          {
                            values?.sellerProduct?.productPrices?.find(
                              (itemData) => itemData?.checked,
                            )?.sellingPrice
                          }
                        </span>
                        <span className="actual_pricing_product">
                          {currencyIcon}
                          <s>
                            {
                              values?.sellerProduct?.productPrices?.find(
                                (itemData) => itemData?.checked,
                              )?.mrp
                            }
                          </s>
                        </span>
                        <span className="prd-list-offer">
                          (
                          {
                            values?.sellerProduct?.productPrices?.find(
                              (itemData) => itemData?.checked,
                            )?.discount
                          }
                          % OFF)
                        </span>

                        <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="bottom"
                          overlay={
                            <Popover id={`popover-positioned-top`}>
                              <Popover.Header as="h3">
                                Pricing Calculation
                              </Popover.Header>
                              <Popover.Body>
                                {allState?.displayCalculation && (
                                  <PricingCalculation
                                    fromPreview={true}
                                    setCalculation={setAllState}
                                    calculation={allState}
                                  />
                                )}
                              </Popover.Body>
                            </Popover>
                          }
                          rootClose={true}
                        >
                          <Badge
                            role="button"
                            bg="warning"
                            text="dark"
                            className="d-flex align-items-center gap-2"
                            onClick={() => {
                              if (!values?.isCalculationOpen) {
                                let getSellerProductPricing =
                                  values?.sellerProduct?.productPrices?.find(
                                    (data) => data?.checked,
                                  ) || values?.sellerProduct?.productPrices[0];

                                getCalculation(
                                  {
                                    ...getSellerProductPricing,
                                    sellerID: values?.sellerProduct?.sellerID,
                                    weightSlabId:
                                      values?.sellerProduct?.weightSlabId,
                                  },
                                  values,
                                );
                                setFieldValue("isCalculationOpen", true);
                              } else {
                                setFieldValue("isCalculationOpen", false);
                              }
                            }}
                          >
                            Pricing Calculation
                          </Badge>
                        </OverlayTrigger>
                      </div>
                      <p className="prd_include_taxes">
                        Inclusive of all taxes
                      </p>
                      <div className="counter-main">
                        <div className="counter-title">
                          <p className="counter-title-quanti">
                            Total Quantity :
                          </p>
                        </div>
                        <div className="counter-btn-cart">
                          <p className="counter-text">
                            {values?.sellerProduct?.productPrices?.reduce(
                              (acc, item) => {
                                return acc + (item?.quantity || 0);
                              },
                              0,
                            )}
                          </p>
                        </div>
                      </div>

                      {values?.sellerProduct?.productPrices?.some(
                        (item) => item?.sizeID,
                      ) && (
                        <div className="color-main">
                          <p className="product-color-title">Sizes:</p>
                          <div className="product-color d-flex align-items-center flex-wrap gap-4">
                            {values?.sellerProduct?.productPrices?.map(
                              (size) => (
                                <InputGroup
                                  className="custom_checkbox pv-product-size-Main"
                                  key={`${values?.sellerProduct?.id}${size?.sizeID}`}
                                >
                                  <IpCheckbox
                                    name="size"
                                    id={`${size?.sizeID}`}
                                    checked={size?.checked}
                                    changeListener={(e) => {
                                      setFieldValue("sellerProduct", {
                                        ...values.sellerProduct,
                                        productPrices:
                                          values.sellerProduct.productPrices.map(
                                            (item) => ({
                                              ...item,
                                              checked:
                                                item.sizeID === size.sizeID,
                                            }),
                                          ),
                                      });
                                    }}
                                  />
                                  <label
                                    className="custom_label"
                                    htmlFor={size?.sizeID}
                                  >
                                    {size?.sizeName}
                                  </label>
                                  <Badge bg="danger">QT {size?.quantity}</Badge>
                                </InputGroup>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {values?.productColorMapping?.length > 0 && (
                        <div className="color-main">
                          <p className="product-color-title">Color:</p>
                          <p className="product-color">
                            {values?.productColorMapping?.map((item) => (
                              <span
                                className="rounded border"
                                style={{ backgroundColor: item?.colorCode }}
                              >
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              </span>
                            ))}
                          </p>
                        </div>
                      )}
                      {values?.sellerProduct?.sellerName && (
                        <div className="d-flex gap-2">
                          <p>Seller Name:</p>
                          <p>{values?.sellerProduct?.sellerName}</p>
                        </div>
                      )}
                      <div className="btn-warehouse">
                        <Button
                          className="btn-warehouse-produt"
                          variant="primary"
                          onClick={() => {
                            setModalShow({
                              show: !modalShow?.show,
                              data: values?.sellerProduct,
                            });
                          }}
                        >
                          View Warehouse Quantity
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                  <Accordion
                    defaultActiveKey="0"
                    alwaysOpen
                    className="mt-4 pv-accordion-main"
                  >
                    {(values?.description || values?.highlights) && (
                      <Accordion.Item eventKey="1">
                        <Accordion.Header className="cfs-17 fw-semibold">
                          PRODUCT DETAILS
                        </Accordion.Header>
                        <Accordion.Body>
                          {values?.description && (
                            <>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: values?.description,
                                }}
                              />
                            </>
                          )}
                          {values?.highlights && (
                            <>
                              <h4>Highlight</h4>
                              <p className="product-details-var cfz-16">
                                {parseHTMLString(values?.highlights)?.map(
                                  (element, index) => (
                                    <React.Fragment key={index}>
                                      {element}
                                    </React.Fragment>
                                  ),
                                )}
                              </p>
                            </>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    )}

                    {values?.productSpecificationsMapp?.length > 0 &&
                      Array.from(
                        new Set(
                          values?.productSpecificationsMapp?.map(
                            (item) => item?.specId,
                          ),
                        ),
                      )?.map((specId) => {
                        let item = values?.productSpecificationsMapp?.filter(
                          (item) => item?.specId === specId,
                        );
                        return (
                          <Accordion.Item
                            eventKey={Math.floor(Math.random() * 100000)}
                          >
                            <Accordion.Header>
                              {item[0]?.specificationName}
                            </Accordion.Header>
                            <Accordion.Body>
                              {item?.map((data) => (
                                <div className="cabl-name">
                                  <p className="cabl-name-title">
                                    {data?.specificationTypeName} :
                                  </p>
                                  <p className="cable-title-detail">
                                    {data?.value}
                                  </p>
                                </div>
                              ))}
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                  </Accordion>

                  {/* <Card className="offer-avail">
                      <Card.Body>
                        <div className="product-offer">
                          <div className="offer-sec1">
                            <p>Available offers :</p>
                          </div>
                          <div className="offer-decript">
                            <p>
                              Bank Offer10% off on Axis Bank Credit Card and EMI
                              Transactions, up to ₹1500, on orders of ₹5,000 ….
                            </p>
                            <Link className="view-more-btn">
                              View 8 more offers
                            </Link>
                          </div>
                        </div>
                      </Card.Body>
                    </Card> */}
                  {values?.sellerProducts?.filter(
                    (item) => item?.id !== values?.sellerProduct?.id,
                  )?.length > 0 && (
                    <Card className="seller-box">
                      <Card.Body>
                        {values?.sellerProducts
                          ?.filter(
                            (item) => item?.id !== values?.sellerProduct?.id,
                          )
                          ?.map((item) => {
                            const checkedProductPrice =
                              item?.productPrices?.find(
                                (data) => data?.checked,
                              ) ?? item?.productPrices[0];
                            return (
                              <div className="seller-info-main">
                                <span className="name-head">
                                  {item?.sellerName}
                                </span>
                                <div className="product_pricong_offer_deliverychrg">
                                  <span className="total_pricing_product">
                                    {currencyIcon}
                                    {checkedProductPrice?.sellingPrice}
                                  </span>
                                  <span className="actual_pricing_product">
                                    {currencyIcon}
                                    {checkedProductPrice?.mrp}
                                  </span>
                                  <span className="prd-list-offer">
                                    ({checkedProductPrice?.discount}% OFF)
                                  </span>

                                  <OverlayTrigger
                                    trigger={["hover", "focus"]}
                                    placement="top"
                                    overlay={
                                      <Popover id={`popover-positioned-top`}>
                                        <Popover.Header as="h3">
                                          Pricing Calculation
                                        </Popover.Header>
                                        <Popover.Body>
                                          {allState?.displayCalculation && (
                                            <PricingCalculation
                                              fromPreview={true}
                                              setCalculation={setAllState}
                                              calculation={allState}
                                            />
                                          )}
                                        </Popover.Body>
                                      </Popover>
                                    }
                                    rootClose={true}
                                  >
                                    <Badge
                                      role="button"
                                      bg="warning"
                                      text="dark"
                                      className="d-flex align-items-center gap-2"
                                      onClick={() => {
                                        if (!values?.isCalculationOpen) {
                                          let getSellerProductPricing =
                                            values?.sellerProducts
                                              ?.find(
                                                (seller) =>
                                                  seller?.id === item?.id,
                                              )
                                              ?.productPrices?.find(
                                                (data) => data?.checked,
                                              ) ||
                                            values?.sellerProducts?.find(
                                              (seller) =>
                                                seller?.id === item?.id,
                                            )?.productPrices[0];

                                          getCalculation(
                                            {
                                              ...getSellerProductPricing,
                                              sellerID: item?.sellerID,
                                              weightSlabId: item?.weightSlabId,
                                            },
                                            values,
                                          );
                                          setFieldValue(
                                            "isCalculationOpen",
                                            true,
                                          );
                                        } else {
                                          setFieldValue(
                                            "isCalculationOpen",
                                            false,
                                          );
                                        }
                                      }}
                                    >
                                      Pricing Calculation
                                    </Badge>
                                  </OverlayTrigger>
                                </div>
                                <p className="prd_include_taxes">
                                  Inclusive of all taxes
                                </p>
                                <div className="counter-main">
                                  <div className="counter-title">
                                    <p className="counter-title-quanti">
                                      Total Quantity :
                                    </p>
                                  </div>
                                  <div className="counter-btn-cart">
                                    <p className="counter-text">
                                      {item?.productPrices?.reduce(
                                        (acc, item) => {
                                          return acc + (item?.quantity || 0);
                                        },
                                        0,
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {item?.productPrices?.some(
                                  (item) => item?.sizeID,
                                ) && (
                                  <div className="color-main">
                                    <p className="product-color-title">
                                      Sizes:
                                    </p>
                                    <div className="product-color d-flex align-items-center gap-2">
                                      {item?.productPrices?.map(
                                        (size, index) => (
                                          <InputGroup
                                            className="custom_checkbox pv-product-size-Main "
                                            key={size?.sizeID}
                                          >
                                            <IpCheckbox
                                              name="size"
                                              id={`${size?.sizeID}`}
                                              checked={size?.checked}
                                              changeListener={(e) => {
                                                let sellerProducts =
                                                  values?.sellerProducts;

                                                if (sellerProducts) {
                                                  sellerProducts.forEach(
                                                    (seller) => {
                                                      if (
                                                        seller.id === item.id
                                                      ) {
                                                        seller.productPrices.forEach(
                                                          (productPrice) => {
                                                            if (
                                                              productPrice.sizeID ===
                                                              size.sizeID
                                                            ) {
                                                              productPrice.checked = true;
                                                            } else {
                                                              productPrice.checked = false;
                                                            }
                                                          },
                                                        );
                                                      }
                                                    },
                                                  );
                                                }

                                                setFieldValue(
                                                  "sellerProducts",
                                                  sellerProducts,
                                                );
                                                // setFieldValue(
                                                //   'sellingPrice',
                                                //   size?.sellingPrice
                                                // )
                                                // setFieldValue(
                                                //   'discount',
                                                //   size?.discount
                                                // )
                                              }}
                                            />
                                            <label
                                              className="custom_label"
                                              htmlFor={size?.sizeID}
                                            >
                                              {size?.sizeName}
                                            </label>
                                            <Badge bg="danger">
                                              QT {size?.quantity}
                                            </Badge>
                                          </InputGroup>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* <div className='seller-sold-by'>
                                <p className='sold-title'>Sold by :</p>
                                <p className='seller-name-title'>
                                  Techretailer
                                </p>
                              </div> */}

                                <div className="btn-warehouse mt-3">
                                  <Button
                                    className="btn-warehouse-produt"
                                    variant="primary"
                                    onClick={() => {
                                      setModalShow({
                                        show: !modalShow?.show,
                                        data: item,
                                      });
                                    }}
                                  >
                                    View Warehouse Quantity
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Offcanvas.Body>
          </Offcanvas>
        </Form>
      )}
    </Formik>
  );
};

export default ProductDetail;
