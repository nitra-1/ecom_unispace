const ProductRatingDisplay = ({ rating }) => {
  const MAX_STARS = 5;

  return (
    <div className="text-center product-rating-display">
      <span className="text-[20px] font-bold block">{rating.toFixed(1)}</span>
      <div className="flex justify-center items-center gap-1">
        {[...Array(MAX_STARS)].map((_, i) => {
          const fillPercent =
            rating >= i + 1 ? 100 : rating > i ? (rating - i) * 100 : 0;

          return (
            <svg
              key={`star-${i}-${rating}`}
              className="w-6 h-6"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id={`grad-${i}-${rating}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset={`${fillPercent}%`} stopColor="#F59E0B" />
                  <stop offset={`${fillPercent}%`} stopColor="transparent" />
                </linearGradient>
              </defs>

              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                stroke="#F59E0B"
                strokeWidth="0.5"
                fill={`url(#grad-${i}-${rating})`}
              />
            </svg>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRatingDisplay;
