import apiPath from '@/api-urls'
import { fetchServerSideApi } from '@/security/Token'
import SubCaregory from '../../../SubCategory'
import SignatureBrands from '@/app/category/SignatureBrands'

const Page = async ({ params }) => {
  const { id, SubId } = params

  let allCategories = []
  let allBrands = []
  let currentCategory = null
  let childCategories = []

  try {
    const [categoriesResponse, brandsResponse] = await Promise.all([
      fetchServerSideApi({
        endpoint: apiPath.getCategory,
        method: 'GET',
        queryParams: { pageIndex: 0, pageSize: 0 }
      }),
      fetchServerSideApi({
        endpoint: apiPath.getBrands,
        method: 'GET',
        queryParams: { pageIndex: 0, pageSize: 0 }
      })
    ])

    if (
      categoriesResponse?.code === 200 &&
      Array.isArray(categoriesResponse?.data)
    ) {
      allCategories = categoriesResponse.data
    } else {
      console.warn('Unexpected response format or status:', categoriesResponse)
    }

    if (brandsResponse?.code === 200 && Array.isArray(brandsResponse?.data)) {
      allBrands = brandsResponse.data
    } else {
      console.warn(
        'Unexpected response format or status for brands:',
        brandsResponse
      )
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
  }

  if (SubId && allCategories.length > 0) {
    currentCategory = allCategories.find((category) => category.id == SubId)
    childCategories = allCategories.filter(
      (category) => category.parentId == SubId
    )
  }

  return (
    <div>
      <SubCaregory category={currentCategory} subCategories={childCategories} />
      <SignatureBrands brands={allBrands} />
    </div>
  )
}

export default Page
