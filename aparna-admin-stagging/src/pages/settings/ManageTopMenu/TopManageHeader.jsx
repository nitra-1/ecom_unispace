import React, { Suspense, useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import Nestable from "react-nestable";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import PlusIcon from "../../../components/AllSvgIcon/PlusIcon.jsx";
import HKBadge from "../../../components/Badges.jsx";
import Loader from "../../../components/Loader.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import TooltipComponent from "../../../components/Tooltip.jsx";
import { showToast } from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { _exception, _SwalDelete } from "../../../lib/exceptionMessage.jsx";
import { setPageTitle } from "../../redux/slice/pageTitleSlice.jsx";
import { _brandImg_ } from "../../../lib/ImagePath.jsx";

const ChildTopMenuForm = React.lazy(() => import("./ChildTopMenuForm.jsx"));
const SubTopmenuAdd = React.lazy(() => import("./SubTopmenuAdd.jsx"));

const TopManageHeader = () => {
  const [changeIdentifier, setChangeIdentifier] = useState({
    isSequenceUpadted: false,
    isSequenceChanged: false,
  });
  const [editData, setEditData] = useState();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [modalShow, setModalShow] = useState({
    show: false,
    isDataUpdated: false,
    type: "",
  });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState();
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const dispatch = useDispatch();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "ManageSubMenu/byHeaderId",
        queryString: `?headerId=${id}&pageIndex=0&pageSize=0`,
      });
      if (response?.status === 200) {
        let data = response?.data?.data;
        if (data?.length > 0 && data[0]?.menuType === "CategoryWise") {
          const categoryResponse = await axiosProvider({
            method: "GET",
            endpoint: "MainCategory/getAllCategory",
            queryString: `?pageIndex=0&pageSize=0`,
          });
          const categories =
            categoryResponse?.data?.data?.length > 0 &&
            buildHierarchy(categoryResponse?.data?.data);

          data = data.map((item) => {
            return {
              ...item,
              childMenu: categories,
            };
          });
        }
        if (data?.length > 0 && data[0]?.menuType === "BrandWise") {
          const brandResponse = await axiosProvider({
            method: "GET",
            endpoint: "MainCategory/GetCategoryWiseBrands",
            queryString: `?pageIndex=0&pageSize=0`,
          });
          data = data.map((item) => {
            return {
              ...item,
              childMenu: brandResponse?.data?.data,
            };
          });
        }

        if (data?.length > 0 && data[0]?.menuType === "FilterWise") {
          const filterResponse = await axiosProvider({
            method: "GET",
            endpoint: "MainCategory/GetAllCategoryFilters",
            queryString: `?pageIndex=0&pageSize=0&specTypeId=${data[0]?.customLink}`,
          });
          data = data.map((item) => {
            return {
              ...item,
              childMenu: filterResponse?.data?.data?.filter(
                (item, index, self) =>
                  index ===
                  self.findIndex((t) => t.specValueId === item.specValueId)
              ),
            };
          });
        }
        setItems(data);
      }
    } catch (error) {
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

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: "ManageSubMenu",
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname,
      });
      if (response?.data?.code === 200) {
        fetchData();
      }
      showToast(toast, setToast, response);
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

  const buildHierarchy = (items) => {
    const itemMap = {};
    items.forEach((item) => {
      itemMap[item.id] = { ...item, childMenu: [] };
    });

    const root = { childMenu: [] };

    items.forEach((item) => {
      const pathIds = item.parentPathIds ? item.parentPathIds.split(">") : [];

      if (pathIds.length === 0) {
        root.childMenu.push(itemMap[item.id]);
      } else {
        const parentId = pathIds[pathIds.length - 1];
        if (itemMap[parentId]) {
          itemMap[parentId].childMenu.push(itemMap[item.id]);
        } else {
          root.childMenu.push(itemMap[item.id]);
        }
      }
    });

    return root.childMenu;
  };

  const renderItem = ({ item }) => {
    return (
      <div
        className="main_nested"
        style={{
          backgroundColor: "white",
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            {item?.draggable && <i className="m-icon m-icon--drag"></i>}{" "}
            {item.name}
          </div>
          <div className="d-flex align-items-center gap-2">
            {items[0]?.menuType !== "CategoryWise" &&
              checkPageAccess(
                pageAccess,
                allPages?.manageChildMenu,
                allCrudNames?.write
              ) &&
              !item.parentId && (
                <TooltipComponent toolplace="top" tooltipText="Create Child">
                  <span
                    role="button"
                    className="d-flex"
                    onClick={() => {
                      setEditData();
                      setModalShow({
                        show: true,
                        parentId: item.id,
                        type: "childMenu",
                      });
                    }}
                  >
                    <HKBadge
                      badgesBgName={"primary"}
                      badgesTxtName={"Create Child"}
                      badgeClassName={""}
                    />
                  </span>
                </TooltipComponent>
              )}

            {items[0]?.menuType !== "CategoryWise" &&
              checkPageAccess(
                pageAccess,
                allPages?.manageSubMenu,
                allCrudNames?.update
              ) && (
                <span
                  className="d-flex"
                  onClick={() => {
                    if (changeIdentifier.isSequenceChanged) {
                      if (!changeIdentifier.isSequenceUpadted) {
                        Swal.fire({
                          title: "Attention",
                          text: "Please save the sequence for updating the data",
                          icon: _SwalDelete.icon,
                          showCancelButton: _SwalDelete.showCancelButton,
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
                          cancelButtonColor: _SwalDelete.cancelButtonColor,
                          confirmButtonText: "Change",
                          cancelButtonText: _SwalDelete.cancelButtonText,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            let data = items?.map((item, index) => {
                              const childSequence = item?.childMenu?.map(
                                (child, childIndex) => {
                                  return {
                                    id: child?.id,
                                    parentId: item?.id,
                                    sequence: childIndex + 1,
                                  };
                                }
                              );
                              return {
                                sequence: index + 1,
                                id: item.id,
                                childSequence: childSequence ?? [],
                              };
                            });
                            changeSequence(data).then((res) => {
                              if (res === 200) {
                                let isChildElement = data?.find(
                                  (x) => x.id === item?.id
                                )
                                  ? false
                                  : true;

                                setEditData(item);
                                setModalShow({
                                  show: true,
                                  type: isChildElement
                                    ? "childMenu"
                                    : "subMenu",
                                  parentId: item?.parentId,
                                });
                              }
                            });
                          }
                        });
                      } else {
                        setEditData(item);
                        setModalShow({
                          show: true,
                          type: item?.parentId ? "childMenu" : "subMenu",
                          parentId: item?.parentId,
                        });
                      }
                    } else {
                      setEditData(item);
                      setModalShow({
                        show: true,
                        type: item?.parentId ? "childMenu" : "subMenu",
                        parentId: item?.parentId,
                      });
                    }
                  }}
                >
                  <EditIcon bg="bg" />
                </span>
              )}

            {items[0]?.menuType !== "CategoryWise" &&
              checkPageAccess(
                pageAccess,
                allPages?.manageSubMenu,
                allCrudNames?.delete
              ) && (
                <span
                  className="d-flex"
                  onClick={() => {
                    Swal.fire({
                      title: _SwalDelete.title,
                      text: _SwalDelete.text,
                      icon: _SwalDelete.icon,
                      showCancelButton: _SwalDelete.showCancelButton,
                      confirmButtonColor: _SwalDelete.confirmButtonColor,
                      cancelButtonColor: _SwalDelete.cancelButtonColor,
                      confirmButtonText: _SwalDelete.confirmButtonText,
                      cancelButtonText: _SwalDelete.cancelButtonText,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleDelete(item.id);
                      } else if (result.isDenied) {
                      }
                    });
                  }}
                >
                  <DeleteIcon bg="bg" />
                </span>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderItemForFilter = ({ item }) => {
    return (
      <div
        className="main_nested"
        style={{
          backgroundColor: "white",
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            {item.specTypeName}
          </div>
        </div>
      </div>
    );
  };

  const updateParentId = (items) => {
    const updatedItems = [];

    const nameSet = new Set();

    for (const item of items) {
      const updatedItem = { ...item };

      const childNames = updatedItem?.childMenu?.map((child) => child.name);
      const duplicateChildName = childNames.find(
        (name, index) => childNames.indexOf(name) !== index
      );

      if (duplicateChildName) {
        return `Error: Duplicate child menu name '${duplicateChildName}' found`;
      }

      if (nameSet.has(updatedItem.name)) {
        return `Error: Duplicate menu name '${updatedItem.name}' found`;
      }

      nameSet.add(updatedItem.name);

      if (updatedItem?.childMenu && updatedItem.childMenu.length > 0) {
        updatedItem.childMenu = updatedItem?.childMenu?.map((child) => {
          if (child.parentId === null) {
            return { ...child, parentId: updatedItem.id };
          }
          return child;
        });
      }

      updatedItems.push(updatedItem);
    }

    return updatedItems;
  };

  const handleChange = (updatedItems) => {
    const itemsToBeUpdated = updateParentId(updatedItems?.items);
    if (typeof itemsToBeUpdated === "string") {
      setToast({
        show: true,
        text: itemsToBeUpdated,
        variation: "error",
      });
      setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 2000);
      setItems(items);
      setChangeIdentifier({
        isSequenceUpadted: false,
        isSequenceChanged: false,
      });
    } else {
      setChangeIdentifier({
        isSequenceUpadted: false,
        isSequenceChanged: true,
      });
      setItems(itemsToBeUpdated);
    }
  };

  const changeSequence = (data) => {
    return new Promise((resolve, reject) => {
      setLoading(true);

      axiosProvider({
        method: "PUT",
        endpoint: "ManageSubMenu/ChangeSequence",
        data,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: items,
      })
        .then((response) => {
          setLoading(false);
          fetchData();
          if (response?.data?.code === 200) {
            setChangeIdentifier({
              ...changeIdentifier,
              isSequenceUpadted: true,
            });
          } else {
            setChangeIdentifier({
              ...changeIdentifier,
              isSequenceUpadted: false,
            });
          }

          showToast(toast, setToast, response);
          resolve(response.data.code);
        })
        .catch((error) => {
          setLoading(false);
          reject(error);

          showToast(toast, setToast, {
            data: {
              message: _exception?.message,
              code: 204,
            },
          });
        });
    });
  };

  useEffect(() => {
    dispatch(setPageTitle("Manage Sub Menu"));
    fetchData();
  }, []);

  return (
    <div className="card">
      {loading && !modalShow.show && <Loader />}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <div className="card-body">
        <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
          {!loading &&
            checkPageAccess(
              pageAccess,
              allPages?.manageSubMenu,
              allCrudNames?.write
            ) &&
            (!items ||
              items?.length === 0 ||
              (items[0]?.menuType !== "CategoryWise" &&
                items[0]?.menuType !== "BrandWise" &&
                items[0]?.menuType !== "FilterWise")) && (
              <Button
                variant="warning"
                className="d-flex align-items-center gap-2 fw-semibold"
                onClick={() => {
                  setEditData();
                  setModalShow({ show: !modalShow.show, type: "subMenu" });
                }}
              >
                <PlusIcon />
                Create Submenu
              </Button>
            )}
        </div>

        {items?.length > 0 ? (
          items[0]?.menuType === "CategoryWise" ||
          items[0]?.menuType === "FilterWise" ||
          items[0]?.menuType === "Custom" ? (
            <>
              {items[0]?.menuType === "CategoryWise" && (
                <h4>Category Wise Menu</h4>
              )}
              {items[0]?.menuType === "FilterWise" && <h4>{items[0]?.name}</h4>}

              <Nestable
                items={
                  items[0]?.menuType === "CategoryWise"
                    ? items[0]?.childMenu?.map((item) => ({
                        ...item,
                        draggable: false,
                      }))
                    : items.map((item) => ({
                        ...item,
                        draggable: true,
                      }))
                }
                renderItem={
                  items[0]?.menuType === "FilterWise"
                    ? renderItemForFilter
                    : renderItem
                }
                handlerStyle={{ backgroundColor: "gray" }}
                handler={
                  items[0]?.menuType === "CategoryWise" ||
                  items[0]?.menuType === "FilterWise"
                    ? false
                    : undefined
                }
                maxDepth={2}
                collapsed={false}
                childrenProp="childMenu"
                onChange={
                  (items[0]?.menuType !== "CategoryWise" ||
                    items[0]?.menuType !== "FilterWise") &&
                  handleChange
                }
                renderItemIndex={() => null}
              />
            </>
          ) : (
            <>
              <h4>Brand Wise Menu</h4>
              <div className="row">
                {items[0]?.childMenu?.length > 0 ? (
                  items[0]?.childMenu.map((obj, index) => (
                    <div className="col-md-3" key={index}>
                      <Card className="p-2 d-flex gap-3 align-items-center justify-content-center text-center border rounded">
                        <Card.Img
                          className="img-fluid"
                          style={{ width: "70%", height: "150px" }}
                          variant="top"
                          src={`${process.env.REACT_APP_IMG_URL}${_brandImg_}${obj?.logo}`}
                          alt={obj?.name}
                        />
                        <Card.Body className="p-0">
                          <Card.Text className="font-weight-bold fs-5">
                            {obj?.name}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </div>
                  ))
                ) : (
                  <RecordNotFound />
                )}
              </div>
            </>
          )
        ) : (
          !loading && <RecordNotFound />
        )}

        {items?.length > 0 &&
          items[0]?.menuType !== "CategoryWise" &&
          items[0]?.menuType !== "BrandWise" &&
          items[0]?.menuType !== "FilterWise" && (
            <div className="d-flex justify-content-start align-items-center mb-3">
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 fw-semibold"
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure you want to change the sequence?",
                    text: _SwalDelete.text,
                    icon: _SwalDelete.icon,
                    showCancelButton: _SwalDelete.showCancelButton,
                    confirmButtonColor: _SwalDelete.confirmButtonColor,
                    cancelButtonColor: _SwalDelete.cancelButtonColor,
                    confirmButtonText: "Confirm",
                    cancelButtonText: _SwalDelete.cancelButtonText,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      let data = items?.map((item, index) => {
                        const childSequence = item?.childMenu?.map(
                          (child, childIndex) => {
                            return {
                              id: child?.id,
                              parentId: item?.id,
                              sequence: childIndex + 1,
                            };
                          }
                        );
                        return {
                          sequence: index + 1,
                          id: item.id,
                          childSequence: childSequence ?? [],
                        };
                      });
                      changeSequence(data);
                    } else if (result.isDenied) {
                    }
                  });
                }}
              >
                Change Sequence
              </Button>
            </div>
          )}

        <Suspense fallback={<Loader />}>
          {modalShow.show && modalShow?.type === "subMenu" && (
            <SubTopmenuAdd
              modalShow={modalShow}
              setModalShow={setModalShow}
              editData={editData}
              setEditData={setEditData}
              setToast={setToast}
              toast={toast}
              fetchData={fetchData}
              items={items}
            />
          )}

          {modalShow?.show && modalShow?.type === "childMenu" && (
            <ChildTopMenuForm
              modalShow={modalShow}
              setModalShow={setModalShow}
              editData={editData}
              setEditData={setEditData}
              setToast={setToast}
              toast={toast}
              fetchData={fetchData}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default TopManageHeader;
