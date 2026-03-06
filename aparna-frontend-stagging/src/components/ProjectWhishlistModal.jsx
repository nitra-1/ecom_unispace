// components/ProjectWhishlistModal.jsx
import React from 'react'
import ProjectWhishlist from '@/components/ProjectWhishlist'

export default function ProjectWhishlistModal({
  open,
  onClose,
  product,
  onSaved,
  axiosProvider,
  brandId,
  sellerId,
  productId,
  setToast
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex z-50" onClick={onClose}>
      <div className="max-h-dvh flex m-auto w-[95%] sm:w-[600px]">
        <div
          className="w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6 my-4 relative overflow-y-auto test"
          onClick={(e) => e.stopPropagation()}
        >
          <ProjectWhishlist
            product={product}
            onClose={onClose}
            onSaved={onSaved}
            axiosProvider={axiosProvider}
            brandId={brandId}
            productId={productId}
            sellerId={sellerId}
            setToast={setToast}
          />
        </div>
      </div>
    </div>
  )
}
