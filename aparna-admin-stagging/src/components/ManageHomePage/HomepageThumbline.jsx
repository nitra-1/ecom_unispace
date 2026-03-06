import React, { useRef } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider from 'react-slick';
import thumblineimg1 from "../../images/homepageadmin/homethumbline1.png"
import thumblineimg2 from "../../images/homepageadmin/homethumbline2.png"
import thumblineimg3 from "../../images/homepageadmin/homethumbline3.png"
import thumblineimg4 from "../../images/homepageadmin/homethumbline4.png"
import thumblineimg5 from "../../images/homepageadmin/homethumbline5.png"
import thumblineimg6 from "../../images/homepageadmin/homethumbline6.png"
import thumblineimg7 from "../../images/homepageadmin/homethumbline7.png"
import thumblineimg8 from "../../images/homepageadmin/homethumbline8.png"



function HomepageThumbline() {

    const sliderRef = useRef(null);

    const HomepageThumblineslider = {
        dots: false,
        arrows: false,
        slidesToShow: 7,
        autoplay: false,
        autoplaySpeed: 4000,
        infinite: true,
        centerPadding: "0px",
        centerMode: true,
    };

    return (
        <section className='pv-home-thumblinemain position-relative mt-5'>
            <Slider {...HomepageThumblineslider} ref={sliderRef} className="pv-home-thumblineinner">
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg1} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg2} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg3} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg4} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg5} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg6} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg7} />
                        </a>
                    </div>
                </div>
                <div className='pv-home-thumbline'>
                    <div className='p-1'>
                        <a href="#">
                            <img className='rounded m-auto' style={{ "width": "100%" }} src={thumblineimg8} />
                        </a>
                    </div>
                </div>

            </Slider>
            <div className="pv-thumbline-btn-main">
                <button className='slide_btn pv-thumbline-slide_left border-0' onClick={() => { sliderRef.current.slickPrev() }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12.025" height="21.549" viewBox="0 0 12.025 21.549">
                        <g id="Icon" transform="translate(1.25 1.25)">
                            <g id="Icon-2" data-name="Icon" transform="translate(0)">
                                <path id="Path" d="M17.025,25.3a1.246,1.246,0,0,1-.884-.366L6.616,15.409a1.25,1.25,0,0,1,0-1.768l9.525-9.525a1.25,1.25,0,0,1,1.768,1.768L9.268,14.525l8.641,8.641a1.25,1.25,0,0,1-.884,2.134Z" transform="translate(-7.5 -5)" fill="#3d3d3d" />
                            </g>
                        </g>
                    </svg>
                </button>
                <button className='slide_btn pv-thumbline-slide_right border-0' onClick={() => { sliderRef.current.slickNext() }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12.025" height="21.549" viewBox="0 0 12.025 21.549">
                        <g id="Icon" transform="translate(-6.25 -3.75)">
                            <g id="Icon-2" data-name="Icon" transform="translate(7.5 5)">
                                <path id="Path" d="M7.5,25.3a1.25,1.25,0,0,1-.884-2.134l8.641-8.641L6.616,5.884A1.25,1.25,0,0,1,8.384,4.116l9.525,9.525a1.25,1.25,0,0,1,0,1.768L8.384,24.933A1.246,1.246,0,0,1,7.5,25.3Z" transform="translate(-7.5 -5)" fill="#3d3d3d" />
                            </g>
                        </g>
                    </svg>
                </button>
            </div>
        </section>
    );
}

export default HomepageThumbline;