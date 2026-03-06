'use client'
import { useEffect, useRef, useState } from 'react'

const AccordionCheckout = ({
  id,
  accordionTitle,
  accordionContent,
  isActive,
  toggleAccordion,
  customParentAccordionClass,
  Content,
  Name,
  index,
  change,
  activeAccordion,
  showIndex = true,
  changeButtonName,
  orderCancelResponse
}) => {
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState()
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [accordionContent])

  return (
    <div
      className={customParentAccordionClass || 'accordion-check'}
      id={id && id}
    >
      <div className={`accordion_item_check ${isActive ? 'active' : ''}`}>
        <div className="accordion_title_check">
          <div>
            <div className="acc_t_fl">
              <span className="acc_span">
                {accordionTitle || 'Default Title Name'}
              </span>
              {showIndex && !isActive && index <= activeAccordion && (
                <i className="m-icon m_checked !bg-green-800"></i>
              )}
            </div>
            {!isActive && index <= activeAccordion && (
              <p className="acc_p_c">
                {Name} <span>{Content}</span>
              </p>
            )}
          </div>

          {!change && !isActive && index <= activeAccordion && (
            <button
              className={`m-btn bg-primary text-white ${
                orderCancelResponse !== 200 ? 'block' : 'hidden'
              }`}
              onClick={toggleAccordion}
            >
              {changeButtonName ? changeButtonName : 'Change'}
            </button>
          )}
        </div>
        <div
          className={`accordion_content_wrapper_check ${
            isActive ? 'show' : ''
          }`}
          ref={contentRef}
          style={{
            maxHeight: isActive ? contentHeight + 200 + 'px' : '0'
          }}
        >
          <div className="accordion_content_check">{accordionContent}</div>
        </div>
      </div>
    </div>
  )
}

export default AccordionCheckout
