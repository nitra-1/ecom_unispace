import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { Image } from 'react-bootstrap';

function Homepagethumblinewoutp({ images }) {

    return (
        <div className='mt-5'>
            {/* <Stack direction="horizontal" className='flex-wrap justify-content-center'>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/retaillabs/2022/3/10/b25f89eb-fbeb-4013-829e-32ee5b5daaa01646895183668-Roadster-HRX_Unisex.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/bfa5c871-a5a5-4d81-b46e-18aedccfdc9b1644407437913-Kurta_sets-_Anouk-_AAY_-_more.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/046147d1-1874-4c10-adb9-6dbd88b606e71644407437923-Kurtas-_Anouk-_Sangria_-_more.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/76acf345-fc62-4b49-8b2c-9c0fc9c925311644407437977-Tops_-_Dressberry-_AAY_-_more.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3923c0c1-2260-4f0e-9598-15b6f9d7731c1644407437960-Roadster_and_H-N_Shirts.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/ffaa74a6-4824-4b19-8936-70ffaef92f001644407437937-M-H_and_HRX_Tshirts.jpg" alt="" />
                    </a>
                </div>
                <div style={{"width":"200px", "height":"auto"}}>
                    <a href="#">
                        <img style={{"width":"200px"}} src="https://assets.myntassets.com/f_webp,w_122,c_limit,fl_progressive,dpr_2.0/assets/images/2022/2/9/3f41465b-7109-4bb2-bf79-ab89ff2128be1644407437899-HRX_and_Harvard_Trackpants.jpg" alt="" />
                    </a>
                </div>
                
            </Stack> */}
            <div style={{"display":"grid","gridTemplateColumns":"repeat(7, minmax(0, 1fr))"}}>
                {/* {images.map((images) => {
                    <div key={images.id}>
                        <img style={{ "width": "200px" }} src={images.thumbimg} alt="" />
                    </div>
                })} */}
                {images.map((image, index) => (
                    <div key={index}>
                        <Image src={image.thumbimg} fluid />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Homepagethumblinewoutp;