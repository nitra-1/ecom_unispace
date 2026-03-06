import React, { useState, useRef } from 'react';
import Slider from 'react-slick';


function  ConditionalyThumbline(props) {

    const [cardCount, setCardCount] = useState(0);

    const handleCardCountChange = (count) => {
        setCardCount(count);
    };

    function CardList(props) {
        const { onCardCountChange } = props;

        const cards = [
            { id: 1, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/thumbimgs/retaillabs/2022/3/10/b25f89eb-fbeb-4013-829e-32ee5b5daaa01646895183668-Roadster-HRX_Unisex.jpg' },
            { id: 2, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/bfa5c871-a5a5-4d81-b46e-18aedccfdc9b1644407437913-Kurta_sets-_Anouk-_AAY_-_more.jpg' },
            { id: 3, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/046147d1-1874-4c10-adb9-6dbd88b606e71644407437923-Kurtas-_Anouk-_Sangria_-_more.jpg' },
            { id: 4, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3923c0c1-2260-4f0e-9598-15b6f9d7731c1644407437960-Roadster_and_H-N_Shirts.jpg' },
            { id: 5, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3923c0c1-2260-4f0e-9598-15b6f9d7731c1644407437960-Roadster_and_H-N_Shirts.jpg' },
            { id: 6, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/ffaa74a6-4824-4b19-8936-70ffaef92f001644407437937-M-H_and_HRX_Tshirts.jpg' },
            { id: 7, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3f41465b-7109-4bb2-bf79-ab89ff2128be1644407437899-HRX_and_Harvard_Trackpants.jpg' },
            { id: 8, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/201d1bfd-287e-47b6-bef6-3c46eac444a51644407437906-Jeans_-_Roadster-_M-H_and_more.jpg' },
            { id: 9, thumbimg: 'https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/201d1bfd-287e-47b6-bef6-3c46eac444a51644407437906-Jeans_-_Roadster-_M-H_and_more.jpg' },
        ];

        const handleCardCount = () => {
            onCardCountChange(cards.length);
        };

        return (
            <div className='d-flex justify-content-center'>
                {cards.map((card) => (
                    // <div key={card.id}>
                    //     <h3>{card.title}</h3>
                    // </div>
                    <div key={card.id} style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src={card.thumbimg} alt="" />
                        </a>
                    </div>
                ))}
                {handleCardCount()}
            </div>
        );
    }

    function SlickSlider() {

        const sliderRefs = useRef(null);
        const settings = {
            arrows: false,
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 7,
            slidesToScroll: 1,
            // centerMode: true,
        };

        return (
            <div className='position-relative'>
                <h2>Slick Slider</h2>
                <Slider {...settings} ref={sliderRefs} >
                    {/* <Stack direction="horizontal" className='flex-wrap justify-content-center'> */}
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/retaillabs/2022/3/10/b25f89eb-fbeb-4013-829e-32ee5b5daaa01646895183668-Roadster-HRX_Unisex.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/bfa5c871-a5a5-4d81-b46e-18aedccfdc9b1644407437913-Kurta_sets-_Anouk-_AAY_-_more.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/046147d1-1874-4c10-adb9-6dbd88b606e71644407437923-Kurtas-_Anouk-_Sangria_-_more.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/76acf345-fc62-4b49-8b2c-9c0fc9c925311644407437977-Tops_-_Dressberry-_AAY_-_more.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3923c0c1-2260-4f0e-9598-15b6f9d7731c1644407437960-Roadster_and_H-N_Shirts.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/ffaa74a6-4824-4b19-8936-70ffaef92f001644407437937-M-H_and_HRX_Tshirts.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3f41465b-7109-4bb2-bf79-ab89ff2128be1644407437899-HRX_and_Harvard_Trackpants.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/retaillabs/2022/3/10/b25f89eb-fbeb-4013-829e-32ee5b5daaa01646895183668-Roadster-HRX_Unisex.jpg" alt="" />
                        </a>
                    </div>
                    <div style={{ "width": "200px", "height": "auto" }}>
                        <a href="#">
                            <img style={{ "width": "200px" }} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/bfa5c871-a5a5-4d81-b46e-18aedccfdc9b1644407437913-Kurta_sets-_Anouk-_AAY_-_more.jpg" alt="" />
                        </a>
                    </div>
                    {/* </Stack> */}
                </Slider>
                <div className="pv-thumbline-btn-main">
                    <button className='slide_btn pv-thumbline-slide_left border-0 position-absolute' onClick={() => { sliderRefs.current.slickPrev() }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.025" height="21.549" viewBox="0 0 12.025 21.549">
                            <g id="Icon" transform="translate(1.25 1.25)">
                                <g id="Icon-2" data-name="Icon" transform="translate(0)">
                                    <path id="Path" d="M17.025,25.3a1.246,1.246,0,0,1-.884-.366L6.616,15.409a1.25,1.25,0,0,1,0-1.768l9.525-9.525a1.25,1.25,0,0,1,1.768,1.768L9.268,14.525l8.641,8.641a1.25,1.25,0,0,1-.884,2.134Z" transform="translate(-7.5 -5)" fill="#3d3d3d" />
                                </g>
                            </g>
                        </svg>
                    </button>
                    <button className='slide_btn pv-thumbline-slide_right border-0 position-absolute' onClick={() => { sliderRefs.current.slickNext() }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12.025" height="21.549" viewBox="0 0 12.025 21.549">
                            <g id="Icon" transform="translate(-6.25 -3.75)">
                                <g id="Icon-2" data-name="Icon" transform="translate(7.5 5)">
                                    <path id="Path" d="M7.5,25.3a1.25,1.25,0,0,1-.884-2.134l8.641-8.641L6.616,5.884A1.25,1.25,0,0,1,8.384,4.116l9.525,9.525a1.25,1.25,0,0,1,0,1.768L8.384,24.933A1.246,1.246,0,0,1,7.5,25.3Z" transform="translate(-7.5 -5)" fill="#3d3d3d" />
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {cardCount <= 8 ? (
                <CardList onCardCountChange={handleCardCountChange()} />
            ) : (
                <SlickSlider />
            )}
        </div>
    );
}

export default ConditionalyThumbline;
