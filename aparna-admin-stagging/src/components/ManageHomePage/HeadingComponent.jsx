import React from 'react'
import {
  _homePageImg_,
  _lendingPageImg_,
  _themePageImg_
} from '../../lib/ImagePath'

function DynamicPositionComponent({
  heading,
  paragraph,
  headingPosition,
  buttonPosition,
  buttonPositionDirection,
  link_text,
  link,
  children,
  textColor,
  titleColor,
  backgroundColor,
  backgroundImage,
  bgPosition,
  fromLendingPage = false,
  fromThemePage = false
}) {
  const renderOptionHeading = () => {
    switch (headingPosition) {
      case 'start':
        return 'justify-content-between'
      case 'center':
        return 'flex-column'
      case 'end':
        return 'flex-row-reverse justify-content-between'
      default:
        return null
    }
  }
  const renderOptionButton = () => {
    switch (buttonPosition) {
      case 'start':
        return 'me'
      case 'center':
        return 'm'
      case 'end':
        return 'ms'
      default:
        return null
    }
  }

  const renderOptionBackGround = () => {
    switch (bgPosition) {
      case 'Background With Color':
        return { backgroundColor: backgroundColor }
      case 'Background With Image':
        return {
          backgroundImage: `url(${`${process.env.REACT_APP_IMG_URL}${
            fromLendingPage
              ? _lendingPageImg_
              : fromThemePage
              ? _themePageImg_
              : _homePageImg_
          }${backgroundImage}`})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }
      default:
        return null
    }
  }

  const handleRedirect = () => {
    window.location.href = link
  }

  return (
    <section
      className="py-3 border border-2 border-black border-opacity-10"
      style={renderOptionBackGround()}
    >
      <div className={`container ${headingPosition}`}>
        <div className={`d-flex align-items-center ${renderOptionHeading()}`}>
          <div>
            <h2
              style={{
                textAlign: headingPosition,
                margin: '0',
                color: titleColor ? titleColor : '#000',
                fontSize: '1.25rem'
              }}
              className="flex-column "
            >
              {heading}
            </h2>
            <div>
              <p
                style={{
                  textAlign: headingPosition,
                  margin: '0',
                  color: textColor ? textColor : '#000'
                }}
              >
                {paragraph}
              </p>
            </div>
          </div>
          <div className={`${renderOptionButton()}-auto`}>
            {buttonPositionDirection === 'title' && (
              <button
                className="btn mb-3"
                style={{
                  color: titleColor ? titleColor : '#FFF',
                  border: titleColor
                    ? `1px solid ${titleColor}`
                    : '1px solid #FFF'
                }}
                onClick={handleRedirect}
              >
                {link_text}
              </button>
            )}
          </div>
        </div>
        {children}
        {buttonPositionDirection === 'section' && (
          <div className={`d-flex justify-content-${buttonPosition}`}>
            <button
              className="btn my-3"
              style={{
                color: titleColor ? titleColor : '#FFF',
                border: titleColor
                  ? `1px solid ${titleColor}`
                  : '1px solid #FFF'
              }}
              onClick={handleRedirect}
            >
              {link_text}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default DynamicPositionComponent
