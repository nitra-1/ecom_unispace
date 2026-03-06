'use client'

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosProvider from '@/lib/AxiosProvider'
import ProductList from '@/app/products/(product-helper)/ProductList'
import Link from 'next/link'
import { Button } from '@heroui/react'

const GroupProducts = ({
  wishlistProjectId,
  products,
  setProducts,
  projectName,
  deleteProject
}) => {
  const { user } = useSelector((state) => state?.user)
  // const [products, setProducts] = useState([]);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const query = `?userId=${user?.userId}&wishlistProjectId=${wishlistProjectId}&getprojectproduct=true`

        const res = await axiosProvider({
          method: 'GET',
          endpoint: `Wishlist/byUserId${query}`
        })
        const items = res?.data?.data
        setProducts(items || [])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.userId) {
      fetchProducts()
    }
  }, [user?.userId, wishlistProjectId])

  const handleRemoveProduct = async (productIdToRemove) => {
    if (!user?.userId || !wishlistProjectId || !productIdToRemove) return

    const previousProducts = [...products]
    setProducts((currentProducts) =>
      currentProducts.filter((p) => p.id !== productIdToRemove)
    )

    try {
      await axiosProvider({
        method: 'DELETE',
        endpoint: `Wishlist?userId=${user.userId}&wishlistProjectId=${wishlistProjectId}&Id=${productIdToRemove}`
      })
    } catch (err) {
      console.error('Failed to remove product:', err)
      setError('Failed to remove product. Please try again.')
      setProducts(previousProducts) // rollback
    }
  }

  return (
    <div className="w-full">
      {loading ? null : error ? (
        <p className="text-red-500 text-center py-4">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No products in this project
        </p>
      ) : (
        <>
          {products.length >= 1 && (
            <div className="flex items-end justify-end mb-3">
              <Button
                className="hover:underline text-red-500 transition-all duration-300 ease-in-out border-gray-300 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProject()
                }}
                title="Delete project"
              >
                {' '}
                Remove {projectName}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => {
              const productId = product.id
              return (
                <div key={productId} className="relative">
                  <button
                    onClick={() => handleRemoveProduct(productId)}
                    className="absolute top-2 right-2 z-[9] p-1.5 bg-white/80 rounded-full  hover:bg-white hover:scale-110 transition-all"
                    title="Remove from project"
                    aria-label="Remove from project"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <ProductList
                    product={product}
                    isWishlistProduct={true}
                    wishlistShow={false}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default GroupProducts
