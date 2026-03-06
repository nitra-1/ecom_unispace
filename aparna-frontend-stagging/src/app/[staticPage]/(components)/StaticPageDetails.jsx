'use client'

const StaticPageDetails = ({ staticData }) => {
  return (
    staticData?.data && (
      <div className="site-container section_spacing_y">
        <div
          className="pv-static-pagemain"
          dangerouslySetInnerHTML={{
            __html: staticData?.data[0]?.pageContent || ''
          }}
        />
      </div>
    )
  )
}

export default StaticPageDetails
