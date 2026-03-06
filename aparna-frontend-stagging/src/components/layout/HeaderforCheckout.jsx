import { showToast } from '@/lib/GetBaseUrl'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch } from 'react-redux'

const HeaderforCheckout = ({
  activeAccordion,
  setActiveAccordion,
  stateValues
}) => {
  const dispatch = useDispatch()

  return (
    <header>
      <div className="site-container">
        <nav className="nav_checkoutwrapper">
          <div className="m_logo">
            <Link href="/" className="navbar__logo">
              <Image
                className="m_nav_logo max-w-[9.25rem] w-full block"
                src="/images/new-logo.svg"
                alt="company logo"
                width={100}
                height={100}
              />
              {/* <Image
                className="m_nav_logo responsive_logo"
                src="/images/logo-sidebar-mobile.svg"
                alt="company logo"
                width={100}
                height={100}
              /> */}
            </Link>
          </div>
          {/* <div className="mp-checkout-action">
            <div>
              <button
                className={`mp-header-menu ${
                  Object?.keys(stateValues?.addressVal)?.length > 0 && 'true'
                } ${activeAccordion === 1 && 'active'}`}
                onClick={() => {
                  setActiveAccordion(1)
                }}
              >
                Delivery address
              </button>
            </div>
            <span>-----</span>
            <div>
              <button
                className={`mp-header-menu ${
                  activeAccordion === 2 && 'active'
                }  ${activeAccordion === 3 && 'true'}`}
                onClick={() => {
                  if (
                    stateValues?.addressVal?.id &&
                    Object.keys(stateValues?.addressVal)?.length > 0
                  ) {
                    setActiveAccordion(2)
                  } else {
                    showToast(dispatch, {
                      data: {
                        message: 'Please select the Delivery address',
                        code: 204
                      }
                    })
                  }
                }}
              >
                Order summary
              </button>
            </div>
            <span>-----</span>
            <div>
              <button
                className={`mp-header-menu  ${
                  activeAccordion === 3 && 'active'
                }`}
                onClick={() => {
                  if (
                    stateValues?.addressVal?.id &&
                    Object.keys(stateValues?.addressVal)?.length > 0
                  ) {
                    setActiveAccordion(3)
                  } else {
                    showToast(dispatch, {
                      data: {
                        message:
                          'Please select the Delivery address and Order summery',
                        code: 204
                      }
                    })
                  }
                }}
              >
                Payment
              </button>
            </div>
          </div> */}
          <div className="mp-security-icons">
            <div className="flex flex-col items-center text-center">
              <i className="m-icon mp-lock max-md:w-4 max-md:h-4 mb-1"></i>
              <span className="text-green-700 text-[0.75rem] leading-none md:text-sm font-medium">
                Safe & Secure
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <i className="m-icon mp-secure  max-md:w-4 max-md:h-4 mb-1"></i>
              <span className="text-blue-700 text-[0.75rem] leading-none md:text-sm font-medium">
                Easy Returns
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <i className="m-icon mp-protection max-md:w-4 max-md:h-4 mb-1"></i>
              <span className="text-[0.75rem] leading-none md:text-sm text-secondary font-medium">
                100% Protection
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default HeaderforCheckout
