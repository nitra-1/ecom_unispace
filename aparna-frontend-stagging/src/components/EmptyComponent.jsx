import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useSelector } from 'react-redux'
import '../../public/css/components/empty-component.css'

const EmptyComponent = ({
  isCart,
  src,
  alt,
  title,
  description,
  redirectTo,
  isButton,
  btnText,
  onClick,
  ...props
}) => {
  const { user } = useSelector((state) => state?.user)
  return (
    <div className="site-container">
      <div className="prdt_not__found_main empty_cart">
        <div>
          <Image
            src={src}
            className="w-f emty_cl"
            width={0}
            alt={alt ?? `image`}
            height={0}
            quality={100}
            sizes="100vh"
          />
          <h1>{title}</h1>
          <p>{description}</p>
          {isButton && (
            <div className="empty_fl">
              {!onClick ? (
                <Link
                  href={redirectTo}
                  className="m-btn btn_shop_now_login"
                  {...props}
                >
                  {btnText}
                </Link>
              ) : (
                <button className="m-btn btn_shop_now_login" onClick={onClick}>
                  {btnText}
                </button>
              )}
            </div>
          )}
          {isCart && (
            <div className="empty_fl">
              <Link href={'/'} className="m-btn btn_shop_now_login">
                Shop Now
              </Link>
              {!user?.userId && (
                <button className="m-btn btn_shop_now_login" onClick={onClick}>
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyComponent
