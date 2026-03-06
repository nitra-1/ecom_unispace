import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import ProductCardSkeleton from './ProductCardSkeleton'

const HomepageSkeleton = ({ sequence }) => {
  const generateSkeletons = (type) => {
    switch (type) {
      case 'banner':
        return (
          <div className="pv-hidden">
            <div className="section_spacing_b">
              <Skeleton width="4000px" height="500px" />
            </div>
          </div>
        )
        break
      case 'product':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <ProductCardSkeleton productItem={5} />
          </div>
        )
        break
      case 'gallery':
        return (
          <div className="section_spacing_b pv-product-grid grid_1-2by2">
            <div className="pv-hidden">
              <Skeleton width="2000px" height="615px" />
            </div>
            <div className="pv-hidden">
              <Skeleton width="2000px" height="300px" />
            </div>
            <div className="pv-hidden">
              <Skeleton width="2000px" height="300px" />
            </div>
            <div className="pv-hidden">
              <Skeleton width="2000px" height="300px" />
            </div>
            <div className="pv-hidden">
              <Skeleton width="2000px" height="300px" />
            </div>
          </div>
        )
        break
      case 'thumbnail':
        return (
          <>
            <div className="pv-hidden">
              <Skeleton width="5000px" height="50px" />
            </div>
            <div className="section_spacing_b pv-product-grid">
              <div className="pv-hidden">
                <Skeleton width="500px" height="346px" />
              </div>
              <div className="pv-hidden">
                <Skeleton width="500px" height="346px" />
              </div>
              <div className="pv-hidden">
                <Skeleton width="500px" height="346px" />
              </div>
              <div className="pv-hidden">
                <Skeleton width="500px" height="346px" />
              </div>
            </div>
          </>
        )
        break
      default:
        break
    }
  }

  return (
    <div className="site-container">
      {sequence.map((item, index) => {
        return <div key={index}>{generateSkeletons(item.type)}</div>
      })}
    </div>
  )
}

export default HomepageSkeleton
