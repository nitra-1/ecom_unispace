const ThankYouModal = ({
  title,
  description,
  handleButtonClick,
  buttonName,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center max-w-sm">
        <svg
          width="70"
          height="70"
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.1"
            d="M45 90C69.8528 90 90 69.8528 90 45C90 20.1472 69.8528 0 45 0C20.1472 0 0 20.1472 0 45C0 69.8528 20.1472 90 45 90Z"
            fill="#145CA8"
          />
          <path
            d="M44.5375 14.4453C27.9264 14.4453 14.4453 27.9264 14.4453 44.5375C14.4453 61.1486 27.9264 74.6298 44.5375 74.6298C61.1486 74.6298 74.6298 61.1486 74.6298 44.5375C74.6298 27.9264 61.1486 14.4453 44.5375 14.4453Z"
            fill="#145CA8"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M59.7581 33.8429C60.4392 34.524 60.4392 35.6284 59.7581 36.3084L40.5781 55.4895C39.897 56.1706 38.7936 56.1706 38.1125 55.4895L29.3936 46.7706C28.7125 46.0895 28.7125 44.9862 29.3936 44.3051C30.0748 43.624 31.1792 43.624 31.8592 44.3051L39.3448 51.7906L57.2925 33.8429C57.9736 33.1618 59.0781 33.1618 59.7581 33.8429Z"
            fill="white"
          />
        </svg>
        {title && <h3 className="text-xl font-semibold mt-4">{title}</h3>}
        {description && <p className="mt-2">{description}</p>}
        <button
          type="submit"
          onClick={handleButtonClick}
          className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full mt-4"
        >
          {buttonName}
        </button>
      </div>
    </div>
  );
};

export default ThankYouModal;
