import apiPath from '@/api-urls'
import { fetchServerSideApi } from '@/security/Token'
import MasterCategory from '../MasterCategory'
import SignatureBrands from '../SignatureBrands'

const Page = async ({ searchParams }) => {
  const CategoryId = searchParams?.CategoryId
  let getCategory = []
  let getBrands = []

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

    if (categoriesResponse?.code === 200 && Array.isArray(categoriesResponse?.data)) {
      getCategory = categoriesResponse.data
    } else {
      console.warn('Unexpected response format or status for categories:', categoriesResponse)
    }
    if (brandsResponse?.code === 200 && Array.isArray(brandsResponse?.data)) {
      getBrands = brandsResponse.data
    } else {
      console.warn(
        'Unexpected response format or status for brands:',
        brandsResponse
      )
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }

  return (
    <div>
      <MasterCategory masterCategory={getCategory} CategoryId={CategoryId} />
      <SignatureBrands brands={getBrands}/>
    </div>
  )
}

export default Page
