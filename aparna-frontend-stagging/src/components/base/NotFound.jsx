import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const NotFound = ({ title, subTitle }) => {
  const srcNotFound = '/images/nfimage.png'
  return (
    <>
      <div className="site-container">
        <div className="not_found_main-site">
          {/* <div className="not_found_7">
            <h1 className="nf_ff_h1">404</h1>
            <h5 className="h5_fzf_title">
              {title ? title : 'This page has been probably moved somewhere...'}
            </h5>
            <p className="cotnt_fzf_ret_mn">
              {subTitle
                ? subTitle
                : 'Please back to homepage or check our offer'}
            </p>
            <Link href={'/'} className="m-btn btn-buy-now">
              Back To Home
            </Link>
          </div> */}
          <div className="px-3 max-w-[500px] mx-auto">
            <Image
              src={srcNotFound}
              width={300}
              height={300}
              quality={100}
              className="object-contain mx-auto mb-5"
              alt="not_found_Image"
            />
            <h1 className="nf_ff_h1 text-center">Page not found</h1>
            <h5 className="h5_fzf_title text-center">
              Sorry, the page you are looking for cannot be found
            </h5>
            <div className="flex items-center justify-center">
              <Link href={'/'} className="m-btn btn-buy-now">
                Back To Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound
