'use client'

import HomepageSkeleton from '@/components/skeleton/HomepageSkeleton'
import ProductDetailSkeleton from '@/components/skeleton/ProductDetailSkeleton'
import ProductListSkeleton from '@/components/skeleton/ProductListSkeleton'
import MainCategorySkeleton from '@/components/skeleton/MainCategorySkeleton'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import CartSkeleton from '@/components/skeleton/CartSkeleton'
import CheckoutSkeleton from '@/components/skeleton/CheckoutSkeleton'
import BrandSkeleton from '@/components/skeleton/BrandSkeleton'

const Loading = () => {
  const pathname = usePathname()
  const sequence = [
    { type: 'banner' },
    { type: 'product' },
    { type: 'gallery' },
    { type: 'thumbnail' }
  ]
  const [isActiveDrawer, setIsActiveDrawer] = useState({
    sortDrawer: false,
    filterDrawer: false
  })

  const switchSkeleton = (location) => {
    switch (true) {
      case location?.startsWith('/products'):
        return <ProductListSkeleton isActiveDrawer={isActiveDrawer} />
      case location.startsWith('/product'):
        return <ProductDetailSkeleton />
      case location.startsWith('/landing'):
        return <HomepageSkeleton sequence={sequence} />
      case location.startsWith('/category'):
        return <MainCategorySkeleton />
      case location === '/checkout':
        return <CheckoutSkeleton />
      case location === '/cart':
        return <CartSkeleton />
      case location.startsWith('/brands'):
        return <BrandSkeleton />
      case location === '/':
        return <HomepageSkeleton sequence={sequence} />
      //   default:
      //     return <HomepageSkeleton sequence={sequence} />
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const skeleton = switchSkeleton(pathname)
  return skeleton
}

export default Loading
