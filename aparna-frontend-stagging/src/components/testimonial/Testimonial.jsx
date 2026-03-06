import Image from 'next/image'
import { reactImageUrl } from '../../lib/GetBaseUrl'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath'

const Testimonial = ({ card, fromLendingPage }) => {
  return (
    <div className="pv-testimonial-main h-full">
      <div className="pv-testimonial-inner">
        {card?.image && (
          <Image
            src={
              card &&
              encodeURI(
                `${reactImageUrl}${
                  fromLendingPage ? _lendingPageImg_ : _homePageImg_
                }${card?.image}`
              )
            }
            alt={card?.image_alt ? card?.image_alt : 'image'}
            className="testimonial_box-img"
            width={300}
            height={300}
            quality={100}
          />
        )}
        <div
          className="testimonial_box-name"
          dangerouslySetInnerHTML={{ __html: card?.title }}
        ></div>
        <div
          className="testimonial_box-job"
          dangerouslySetInnerHTML={{ __html: card?.sub_title }}
        ></div>
        <div
          className="testimonial_box-text"
          dangerouslySetInnerHTML={{ __html: card?.description }}
        ></div>
      </div>
    </div>
  )
}

export default Testimonial
