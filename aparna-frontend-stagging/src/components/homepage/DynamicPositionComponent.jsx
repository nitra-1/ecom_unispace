import { checkCase, reactImageUrl } from '@/lib/GetBaseUrl'
import { _homePageImg_, _lendingPageImg_ } from '@/lib/ImagePath'
import Image from 'next/image'
import Link from 'next/link'

function DynamicPositionComponent({
  heading,
  paragraph,
  headingPosition,
  buttonPosition,
  btnText,
  redirectTo,
  buttonPositionDirection,
  children,
  TitleColor,
  TextColor,
  section,
  card,
  fromLendingPage,
  layoutsInfo,
  ...props
}) {
  const calculateButtonPosition = () => {
    if (buttonPositionDirection === 'title') {
      if (headingPosition === 'left') {
        return 'right'
      } else if (headingPosition === 'right') {
        return 'left'
      } else {
        return 'center'
      }
    } else {
      return buttonPosition
    }
  }

  const renderOptionheading = () => {
    switch (headingPosition) {
      case 'left':
        return 'justify-content-between'
      case 'center':
        return 'flex-column'
      case 'right':
        return 'flex-r-reverse justify-content-between'
      default:
        return null // Render nothing for unknown options
    }
  }

  const renderOptionbutton = () => {
    // Calculate the button position based on the logic above
    const calculatedButtonPosition = calculateButtonPosition()

    switch (calculatedButtonPosition) {
      case 'left':
        return 'me-au'
      case 'center':
        return 'm-au'
      case 'right':
        return 'ms-au'
      default:
        return null // Render nothing for unknown options
    }
  }

  return (
    <div
      className={`${
        card?.in_container !== false && section?.in_container !== false
          ? 'site-container'
          : 'no-site-container'
      }  ${headingPosition}`}
    >
      <div
        className={`${
          (card?.background_color &&
            card?.background_color.toLowerCase() !== '#ffffff') ||
          (section?.background_color &&
            section?.background_color.toLowerCase() !== '#ffffff')
            ? `my-[20px] py-[24px] md:py-[36px] px-4`
            : ''
        } ${
          (card?.background_color.toLowerCase() !== '#ffffff' &&
            section?.background_color.toLowerCase() !== '#ffffff') ||
          (card?.background_image && section?.background_image && 'p-4 sm:p-6')
        }`}
        style={{
          backgroundColor:
            (card?.background_color &&
              card?.background_color.toLowerCase() !== '#ffffff') ||
            (section?.background_color &&
              section?.background_color.toLowerCase() !== '#ffffff')
              ? card?.background_color || section?.background_color
              : 'transparent',

          backgroundImage: card?.background_image
            ? `url(${reactImageUrl}${
                fromLendingPage ? _lendingPageImg_ : _homePageImg_
              }${card?.background_image})`
            : 'none',

          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {(heading || paragraph || buttonPositionDirection === 'title') && (
          <div
            className={`heading-main ${
              buttonPositionDirection === 'section' ? 'gp-0' : ''
            } ${renderOptionheading()}`}
          >
            <div>
              <h2
                style={{
                  textAlign: headingPosition,
                  color: TitleColor
                }}
                className="flex-column titleHeadingH1"
              >
                {heading}
              </h2>
              {paragraph && (
                <p
                  className="subtitleHeadingP flex-column titleHeadingH1"
                  style={{
                    textAlign: headingPosition,
                    color: TextColor
                  }}
                >
                  {paragraph}
                </p>
              )}
            </div>
            <div className={`${renderOptionbutton()} button_pos`}>
              {buttonPositionDirection === 'title' && (
                <Link
                  href={checkCase(card)}
                  // style={{
                  //   borderColor: TextColor,
                  //   color: TextColor,
                  // }}
                  //   target="_blank"
                  className={`flex items-center font-medium font-sans gap-2 text-[12px] sm:text-lg hover:underline text-[#0073CF]`}
                  {...props}
                >
                  {btnText}
                  <Image
                    src="/icon/blue_arrow.svg"
                    width={8}
                    height={7}
                    quality={100}
                    alt="next arrow"
                  />
                </Link>
              )}
            </div>
          </div>
        )}
        {children}
        {buttonPositionDirection === 'section' && (
          <div className={`fl btn-ch jc-${buttonPosition}`}>
            <Link
              href={redirectTo}
              style={{
                borderColor: TextColor,
                color: TextColor
              }}
              target="_blank"
              className="m-btn heading_button"
              {...props}
            >
              {btnText}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DynamicPositionComponent
