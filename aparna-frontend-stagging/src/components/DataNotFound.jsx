import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import '../../public/css/components/data-not-found.css'
import '../../public/css/components/empty-component.css'

const DataNotFound = ({ image, heading, description }) => {
  return (
    <div className="data_not_found_wrapper">
      <Image
        className="data_not_found_img max-sm:w-[320px]"
        src={image}
        width={400}
        height={400}
        quality={100}
        alt="data_not_found_img"
      />
      <h1 className="data_not_found_heading">{heading}</h1>
      <p className="data_not_found_dec">{description}</p>
      <div className="empty_fl">
        <Link href={'/'} className="m-btn btn_shop_now_login">
          Shop More
        </Link>
      </div>
    </div>
  )
}

export default DataNotFound
