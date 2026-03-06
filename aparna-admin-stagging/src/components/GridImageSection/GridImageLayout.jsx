import React from 'react'
import Swal from 'sweetalert2'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import ComponentEdit from '../ManageHomePage/ComponentEdit.jsx'
import DynamicPositionComponent from '../ManageHomePage/HeadingComponent.jsx'
import CustomGrid from './CustomGrid.jsx'
import Grid1By1_1_1 from './Grid1By1_1_1.jsx'
import Grid1By2_1 from './Grid1By2_1.jsx'
import Grid1By2_2By1 from './Grid1By2_2By1.jsx'
import Grid1_1By1 from './Grid1_1By1.jsx'
import Grid1_1By2 from './Grid1_1By2.jsx'
import Grid1_2By1 from './Grid1_2By1.jsx'
import Grid1_2By2 from './Grid1_2By2.jsx'
import Grid1_2_1 from './Grid1_2_1.jsx'
import Grid1_3_1 from './Grid1_3_1.jsx'
import Grid1by1_1 from './Grid1by1_1.jsx'
import Grid2By1_1 from './Grid2By1_1.jsx'
import Grid2By1_1By2 from './Grid2By1_1By2.jsx'
import Grid2By2_1 from './Grid2By2_1.jsx'
import Grid2_1_2 from './Grid2_1_2.jsx'
import Grid3_1_3 from './Grid3_1_3.jsx'
import Gridcolumnfour from './Gridcolumnfour.jsx'
import Grid_2By2 from './Grid_2By2.jsx'
import Grid_1By2 from './Grid_1By2.jsx'
import Grid_2By1 from './Grid_2By1.jsx'
import Grid_2By1_1By2 from './Grid_2By1_1By2.jsx'
import Grid_2by1by2 from './Grid_2by1by2.jsx'
import Grid2_1By1 from './Grid2_1By1.jsx'

function GridImageLayout({
  layoutsInfo,
  section,
  setLayoutDetails,
  layoutDetails,
  handleDelete,
  setModalShow,
  modalShow,
  fromLendingPage = false,
  handleImgDelete,
  allState,
  fromThemePage,
  homepageFor,
  lendingPageFor
}) {
  function GridImageSwitch(props) {
    let layoutsInfo = props?.layoutsInfo
    let section = props?.section

    switch (layoutsInfo?.layout_class) {
      case 'grid_1-2by2':
        return (
          <Grid1_2By2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            fromLendingPage={fromLendingPage}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1-2by1':
        return (
          <Grid1_2By1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
            lendingPageFor={lendingPageFor}
          />
        )

      case 'grid_2by1-2by1':
        return (
          <Grid_2By1_1By2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1-1by2':
        return (
          <Grid1_1By2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_2by2-1':
        return (
          <Grid2By2_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_2by1-1':
        return (
          <Grid2By1_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            fromLendingPage={fromLendingPage}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1by2-1':
        return (
          <Grid1By2_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            fromLendingPage={fromLendingPage}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1by2-2by1':
        return (
          <Grid1By2_2By1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            fromLendingPage={fromLendingPage}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
            lendingPageFor={lendingPageFor}
          />
        )

      case 'grid_2by1-1by2':
        return (
          <Grid2By1_1By2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1-3-1':
        return (
          <Grid1_3_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_3-1-3':
        return (
          <Grid3_1_3
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            fromLendingPage={fromLendingPage}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1-2-1':
        return (
          <Grid1_2_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_2-1-2':
        return (
          <Grid2_1_2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            fromLendingPage={fromLendingPage}
            layoutDetails={layoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'gallery-col-4':
        return (
          <Gridcolumnfour
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1by1-1':
        return (
          <Grid1by1_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
          />
        )

      case 'grid_1-1by1':
        return (
          <Grid1_1By1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1by1-1-1':
        return (
          <Grid1By1_1_1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_2by2':
        return (
          <Grid_2By2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_1by2':
        return (
          <Grid_1By2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'grid_2by1':
        return (
          <Grid_2By1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
          />
        )

      case 'row-grid':
        return (
          <CustomGrid
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            allState={allState}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
            lendingPageFor={lendingPageFor}
          />
        )

      case 'grid_2by1by2':
        return (
          <Grid_2by1by2
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            allState={allState}
            fromThemePage={fromThemePage}
            homepageFor={homepageFor}
            lendingPageFor={lendingPageFor}
          />
        )

      case 'grid_2-1-1':
        return (
          <Grid2_1By1
            layoutsInfo={layoutsInfo}
            section={section}
            setLayoutDetails={setLayoutDetails}
            layoutDetails={layoutDetails}
            fromLendingPage={fromLendingPage}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            fromThemePage={fromThemePage}
          />
        )

      default:
        return null
    }
  }

  const sectionDelete = () => {
    Swal.fire({
      title: _SwalDelete.title,
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: _SwalDelete.confirmButtonText,
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(section?.section_id)
      } else if (result.isDenied) {
      }
    })
  }

  const sectionEdit = () => {
    setModalShow({
      ...modalShow,
      show: !modalShow?.show,
      layoutId: layoutsInfo?.layout_id,
      layoutName: layoutsInfo?.layout_name?.toLowerCase()?.includes('product')
        ? 'Product List'
        : layoutsInfo?.layout_name,
      layoutTypeId: layoutsInfo?.layout_type_id,
      layoutTypeName: layoutsInfo?.layout_type_name,
      sectionId: section?.section_id,
      type:
        layoutsInfo?.name === 'Custom Grid'
          ? 'customGridSelection'
          : 'normalLayoutSelection'
    })
  }

  return (
    <div>
      <ComponentEdit
        sectionDelete={sectionDelete}
        sectionEdit={sectionEdit}
        sectionStatus={section?.status}
      >
        <DynamicPositionComponent
          heading={section?.title}
          paragraph={section?.sub_title}
          headingPosition={
            section?.title_position?.toLowerCase() === 'left'
              ? 'start'
              : section?.title_position?.toLowerCase() === 'center'
              ? 'center'
              : 'end'
          }
          buttonPosition={
            section?.link_position?.toLowerCase() === 'left'
              ? 'start'
              : section?.link_position?.toLowerCase() === 'right'
              ? 'end'
              : 'center'
          }
          //   buttonPosition={
          //     section?.link_in?.toLowerCase() === 'section'
          //       ? section?.link_position?.toLowerCase() === 'left'
          //         ? 'start'
          //         : section?.link_position?.toLowerCase() === 'center'
          //         ? 'center'
          //         : 'end'
          //       : section?.title_position?.toLowerCase() === 'left'
          //       ? 'end'
          //       : section?.title_position?.toLowerCase() === 'right'
          //       ? 'start'
          //       : section?.link_position?.toLowerCase() === 'left'
          //       ? 'start'
          //       : section?.link_position?.toLowerCase() === 'right'
          //       ? 'end'
          //       : 'center'
          //   }
          buttonPositionDirection={section?.link_in?.toLowerCase()}
          link_text={section?.link_text}
          link={section?.link}
          titleColor={section?.title_color}
          textColor={section?.text_color}
          backgroundColor={section?.background_color}
          bgPosition={section?.background_type}
          backgroundImage={section?.background_image}
          fromLendingPage={fromLendingPage}
          fromThemePage={fromThemePage}
        >
          <GridImageSwitch layoutsInfo={layoutsInfo} section={section} />
        </DynamicPositionComponent>
      </ComponentEdit>
    </div>
  )
}

export default GridImageLayout
