import { focusInput } from "@/lib/AllGlobalFunction";
import React from "react";

const SearchBar = ({ onChange, value, placeholder, id }) => {
  return (
    <div className="m-search">
      <input
        className="m-search__ip"
        type="search"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <label htmlFor="">
        <i
          role="button"
          type="submit"
          className="m-icon m-search__icon"
          onClick={() => focusInput(id)}
        ></i>
      </label>
    </div>
  );
};

export default SearchBar;

// import Link from 'next/link'
// import { Formik, Form } from 'formik'
// import * as Yup from 'yup'
// import { useRouter } from 'next/router'
// import axiosProvider from '../../lib/AxiosProvider'
// import { useImmer } from 'use-immer'
// import { useEffect, useRef } from 'react'

// const SearchBar = ({ placeholder }) => {
//   const router = useRouter()
//   const profileRef = useRef(null)
//   const [suggestions, setSuggestions] = useImmer(false)

//   const validationSchema = Yup.object().shape({
//     searchTexts: Yup.string().required()
//   })

//   // const handleSearch = async (values) => {
//   //   setSuggestions(false)
//   //   document.activeElement.blur()
//   //   router.push(
//   //     `searchList?searchTexts=${values?.searchTexts}&pageIndex=1&pageSize=18`
//   //   )
//   // }
//   // const fetchData = async (endpoint, setterFunc) => {
//   //   const response = await axiosProvider({
//   //     method: 'GET',
//   //     endpoint
//   //   })
//   //   if (response?.data?.code === 200) {
//   //     return setterFunc(response)
//   //   } else {
//   //     setSuggestions(false)
//   //   }
//   // }

//   const getSuggestion = async (text) => {
//     fetchData(`user/Product/searchSugession?searchText=${text}`, (resp) => {
//       setSuggestions(resp?.data?.data)
//     })
//   }

//   const checkCatLevel = (level, id) => {
//     switch (level) {
//       case 1:
//         return `/products-subcategories?CategoryId=${id}`

//       case 2:
//         return `/products-childcategories?subCategoryId=${id}`

//       case 3:
//         return `/productlist?CategoryId=${id}&pageIndex=1&pageSize=18`

//       default:
//         return '#.'
//     }
//   }

//   useEffect(() => {
//     setSuggestions(false)
//   }, [])

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setSuggestions(false)
//       }
//     }

//     document.body.addEventListener('click', handleOutsideClick)
//     return () => {
//       document.body.removeEventListener('click', handleOutsideClick)
//     }
//   }, [])
//   return (
//     <div className='search_container' ref={profileRef}>
//       <Formik
//         enableReinitialize={true}
//         initialValues={{
//           searchTexts: router?.query?.searchTexts ?? ''
//         }}
//         validationSchema={validationSchema}
//         // onSubmit={handleSearch}
//       >
//         {({ values, setFieldValue, errors, touched }) => (
//           <Form className='search_form'>
//             <input
//               type='search'
//               placeholder={placeholder}
//               name={'searchTexts'}
//               value={values?.searchTexts ?? ''}
//               onChange={(e) => {
//                 setFieldValue('searchTexts', e?.target?.value)
//                 if (e?.target?.value.trim().length >= 3) {
//                   getSuggestion(e?.target?.value)
//                 } else {
//                   setSuggestions(false)
//                 }
//               }}
//               className='search_textbox'
//             />
//             <button type='submit' className='search_submit'>
//               <i className='m-icon m-search-icon'></i>
//             </button>

//             {(suggestions?.categories?.length > 0 ||
//               suggestions?.brands?.length > 0 ||
//               suggestions?.products?.length > 0) && (
//               <div className='suggestions_container'>
//                 <div className='p_indide'>
//                   {suggestions?.categories?.length > 0 && (
//                     <ul className='suggestions_list'>
//                       <li className='static_title'>Categories</li>
//                       {suggestions?.categories?.map((categories, index) => (
//                         <li key={index} className='suggestion_item'>
//                           <Link
//                             href={checkCatLevel(
//                               categories?.currentLevel,
//                               categories?.id
//                             )}
//                             onClick={() => {
//                               setSuggestions(false)
//                               setFieldValue('searchTexts', '')
//                             }}
//                           >
//                             {categories?.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {suggestions?.brands?.length > 0 && (
//                     <ul className='suggestions_list'>
//                       <li className='static_title'>Brands</li>
//                       {suggestions?.brands?.map((brand, index) => (
//                         <li key={index} className='suggestion_item'>
//                           <Link
//                             href={`/brands/BrandDetail?brandId=${brand?.id}&pageIndex=1&pageSize=10`}
//                             onClick={() => {
//                               setSuggestions(false)
//                               setFieldValue('searchTexts', '')
//                             }}
//                           >
//                             {brand?.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {suggestions?.products?.length > 0 && (
//                     <ul className='suggestions_list'>
//                       <li className='static_title'>Products</li>
//                       {suggestions?.products?.map((product, index) => (
//                         <li key={index} className='suggestion_item'>
//                           <Link
//                             href={`/product-details?pguid=${product?.guid}`}
//                             onClick={() => {
//                               setSuggestions(false)
//                               setFieldValue('searchTexts', '')
//                             }}
//                           >
//                             {product?.productName}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//               </div>
//             )}
//           </Form>
//         )}
//       </Formik>
//     </div>
//   )
// }

// export default SearchBar
