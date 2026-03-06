// import React, {
//   useEffect,
//   useRef,
//   useState,
//   forwardRef,
//   useImperativeHandle
// } from 'react'

// const Stepper = forwardRef(({ tabCount, activeTabRetriever }, ref) => {
//   const [currIndex, setCurrIndex] = useState(0)
//   const [direction, setDirection] = useState('next')
//   const [isDomLoaded, setIsDomLoaded] = useState(false)
//   const progressElm = useRef(null)
//   const [indicators, setIndicators] = useState([])
//   const prevBtn = useRef(null)
//   const nextBtn = useRef(null)

//   useImperativeHandle(ref, () => {
//     return {
//       triggerNext() {
//         next()
//       },
//       triggerPrev() {
//         prev()
//       }
//     }
//   })

//   useEffect(() => {
//     setIsDomLoaded(true)
//     setIndicators(
//       document.getElementsByClassName('m-stepper__screen-indicator')
//     )
//     disableControls()
//   }, [])

//   useEffect(() => {
//     if (indicators && indicators.length) {
//       if (direction === 'prev') {
//         indicators[currIndex].style.transitionDelay = '0s'
//         progressElm.current.style.width = `${
//           (currIndex / (indicators.length - 1)) * 100
//         }%`
//         disableControls()
//       } else {
//         indicators[currIndex].style.transitionDelay = '0.6s'
//         progressElm.current.style.width = `${
//           (currIndex / (indicators.length - 1)) * 100
//         }%`
//         disableControls()
//       }
//     }

//     if (activeTabRetriever) {
//       activeTabRetriever(currIndex + 1)
//     }
//   }, [currIndex])

//   const disableControls = () => {
//     if (prevBtn.current && nextBtn.current) {
//       if (currIndex <= 0) {
//         prevBtn.current.disabled = true
//       } else if (currIndex >= indicators.length - 1) {
//         nextBtn.current.disabled = true
//       } else {
//         prevBtn.current.disabled = false
//         nextBtn.current.disabled = false
//       }
//     }
//   }

//   const next = () => {
//     setDirection('next')
//     indicators[currIndex + 1].classList.add('completed')
//     setCurrIndex((prev) => prev + 1)
//   }

//   const prev = () => {
//     setDirection('prev')
//     indicators[currIndex].classList.remove('completed')
//     setCurrIndex((prev) => prev - 1)
//   }
//   return (
//     <>
//       <div className='m-stepper'>
//         <>
//           <div className='m-stepper__wrapper'>
//             <div className='m-stepper__progress' ref={progressElm}></div>
//             {tabCount &&
//               [...Array(tabCount)].map((e, i) => {
//                 return (
//                   <div
//                     className='m-stepper__screen-indicator'
//                     key={Math.floor(Math.random() * 100000)}
//                   >
//                     {i + 1}
//                   </div>
//                 )
//               })}
//           </div>
//         </>
//       </div>
//       {/* <div className='m-stepper__screen-wrapper'>
//       <p className='m-stepper__screen-name m-stepper__screen-name--disable'>Bag</p>
//       <p className='m-stepper__screen-name'>Address</p>
//       <p className='m-stepper__screen-name'> Payment</p>
//       <p className='m-stepper__screen-name'>Summary</p>
//       </div> */}
//     </>
//   )
// })

// export default Stepper
