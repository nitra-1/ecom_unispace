'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import EmptyComponent from '../../../components/EmptyComponent'
import AddToCartProduct from './AddToCartProduct'
import CartModalSkeleton from '../../../components/skeleton/CartModalSkeleton'

const CartModal = ({
  isOpen,
  onClose,
  data,
  setData,
  sessionId,
  cartCalculation,
  loading,
  setLoading,
  handleLogin
}) => {
  const { user } = useSelector((state) => state?.user)
  const { cartCount } = useSelector((state) => state?.cart)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTransitionEnd = () => {
    setIsTransitioning(false)
  }

  const handleModalClick = (event) => {
    event.stopPropagation()
  }

  const handleOverlayClick = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`modal-overlay model-cart_overlay ${
        isTransitioning ? 'closing' : ''
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal ${isTransitioning ? 'closing' : ''} ${'modal-sm'}`}
        onClick={handleModalClick}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="modal-header">
          <p className="HeaderText">
            Bag <span className="sp_model_prd_item">{cartCount} items</span>
          </p>
          <button className="modal-close" onClick={handleOverlayClick}>
            <i className="m-icon m-close-modal-cart"></i>
          </button>
        </div>
        <div className="modal-body">
          {cartCount > 0 ? (
            data?.data ? (
              <AddToCartProduct
                data={data}
                setData={setData}
                mySessionId={sessionId}
                cartCalculation={cartCalculation}
                setLoading={setLoading}
                loading={loading}
              />
            ) : (
              <CartModalSkeleton />
            )
          ) : (
            <EmptyComponent
              src={'/images/emty_cart.jpg'}
              isCart
              alt={'empty_cart'}
              title={'Your cart is empty'}
              description={
                'Must add items to the cart before you proceed to checkout.'
              }
              onClick={handleLogin}
            />
          )}
        </div>

        <div className="modal-footer">
          <div className="sp_cart_btn_wrapper">
            <Link href="/cart" className="m-btn btn-buy-now" onClick={onClose}>
              View Cart
            </Link>
            <Link
              href={
                user?.userId ? '/checkout' : '/user/signin?returnTo=/checkout'
              }
              className="m-btn btn-add-cart"
              onClick={onClose}
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartModal
