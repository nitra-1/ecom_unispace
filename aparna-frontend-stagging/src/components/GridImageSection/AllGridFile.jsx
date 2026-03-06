import DynamicPositionComponent from '../homepage/DynamicPositionComponent'
import CustomGrid from './CustomGrid'
import Grid1_1By1 from './Grid1_1By1'
import Grid1_1by2 from './Grid1_1by2'
import Grid1_2_1 from './Grid1_2_1'
import Grid1_2by1 from './Grid1_2by1'
import Grid1_2by2 from './Grid1_2by2'
import Grid1_3_1 from './Grid1_3_1'
import Grid1by1_1 from './Grid1by1_1'
import Grid1By1_1_1 from './Grid1By1_1_1'
import Grid1by2_1 from './Grid1by2_1'
import Grid1by2_2by1 from './Grid1by2_2by1'
import Grid2_1_2 from './Grid2_1_2'
import Grid2by1_1 from './Grid2by1_1'
import Grid2by1_1by2 from './Grid2by1_1by2'
import Grid2by2_1 from './Grid2by2_1'
import Grid3_1_3 from './Grid3_1_3'
import Grid_col_four from './Grid_col_four'
import Grid_2by1by2 from './Grid_2by1by2'
import Grid2_1_1 from './Grid2_1_1'

const AllGridFile = ({
  layoutsInfo,
  section,
  fromLendingPage = false,
  fromThemePage = false,
  renderOptionBackGround
}) => {
  const renderComponent = () => {
    switch (layoutsInfo?.layout_class?.trim()) {
      case 'grid_1by1-1':
        return (
          <Grid1by1_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-1by1':
        return (
          <Grid1_1By1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-2by2':
        return (
          <Grid1_2by2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1by1-1-1':
        return (
          <Grid1By1_1_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2by2-1':
        return (
          <Grid2by2_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-2by1':
        return (
          <Grid1_2by1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-1by2':
        return (
          <Grid1_1by2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2by1-1':
        return (
          <Grid2by1_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1by2-1':
        return (
          <Grid1by2_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1by2-2by1':
        return (
          <Grid1by2_2by1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2by1-1by2':
        return (
          <Grid2by1_1by2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-3-1':
        return (
          <Grid1_3_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_3-1-3':
        return (
          <Grid3_1_3
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_1-2-1':
        return (
          <Grid1_2_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2-1-2':
        return (
          <Grid2_1_2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2by1by2':
        return (
          <Grid_2by1by2
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'gallery-col-4':
        return (
          <Grid_col_four
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'grid_2-1-1':
        return (
          <Grid2_1_1
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      case 'row-grid':
        return (
          <CustomGrid
            layoutsInfo={layoutsInfo}
            section={section}
            fromLendingPage={fromLendingPage}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {section?.status?.toLowerCase() === 'active' && (
        <section
          style={
            !section?.in_container
              ? renderOptionBackGround(
                  section?.background_type,
                  section?.background_color?.toLowerCase(),
                  section?.background_image,
                  fromLendingPage,
                  fromThemePage
                )
              : undefined
          }
        >
          <div
            className={`${
              section?.background_color?.toLowerCase() === '#ffffff' &&
              'section_spacing_b'
            }`}
          >
            <DynamicPositionComponent
              heading={section?.title}
              paragraph={section?.sub_title}
              btnText={section?.link_text}
              redirectTo={section?.link ?? '#.'}
              headingPosition={section?.title_position?.toLowerCase()}
              buttonPosition={section?.link_position?.toLowerCase()}
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              TitleColor={section?.title_color?.toLowerCase()}
              TextColor={section?.text_color?.toLowerCase()}
              section={section}
              card={section}
              fromLendingPage={fromLendingPage}
            >
              {renderComponent()}
            </DynamicPositionComponent>
          </div>
        </section>
      )}
    </>
  )
}

export default AllGridFile
