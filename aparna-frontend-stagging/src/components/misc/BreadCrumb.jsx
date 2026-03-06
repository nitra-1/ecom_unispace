import { spaceToDash } from '@/lib/GetBaseUrl'
import Link from 'next/link'

const BreadCrumb = ({
  items = [],
  brandName,
  className = 'breadcrumb_wrapper'
}) => {
  if (brandName) {
    return (
      <div className={className}>
        <Link href="/">Home</Link>
        {' / '}
        <Link href="/brands">Brand</Link>
        <span className="breadcrumb_seprator">/ {brandName}</span>
      </div>
    )
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index}>
            {item.link && !isLast ? (
              <Link href={item.link}>{item.text}</Link>
            ) : (
              <span className="breadcrumb_seprator !mx-0">
                {decodeURIComponent((item?.text).replaceAll('-', ' '))}
              </span>
            )}
            {!isLast && <span className="breadcrumb_seprator">/</span>}
          </span>
        )
      })}
    </div>
  )
}

export default BreadCrumb
