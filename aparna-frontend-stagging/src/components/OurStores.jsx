'use client'
import Link from 'next/link'
import React, { useState } from 'react'

const OurStores = () => {
  const data = [
    {
      location: 'Hyderabad - Jubilee Hills',
      name: 'Hyderabad Jubilee Showroom',
      address:
        '293/82/A, Plot, Ground Floor, D.No: 8-2, No. 1214, Rd Number 60, Jubilee Hills, Hyderabad, Telangana 500033',
      phone1: '+91-9154088438',
      phone2: '18001216229',
      href: 'https://www.google.com/maps/place/Aparna+Unispace+-+Jubilee+Hills/@17.4287353,78.4103373,15z/data=!4m6!3m5!1s0x3bcb914489e52aaf:0x8a3976a0047ab57!8m2!3d17.4287353!4d78.4103373!16s%2Fg%2F11c382skxt?hl=en&entry=ttu&g_ep=EgoyMDI1MDgwNi4wIKXMDSoASAFQAw%3D%3D'
    },
    {
      location: 'Hyderabad - Miyapur',
      name: 'Hyderabad Miyapur Showroom',
      address:
        'G9H3+FMH, Industrial Area, Ameenpur, Hyderabad, Telangana 500090',
      phone1: '+91-9154088438',
      phone2: '18001216229',
      href: 'https://www.google.com/maps/place/Aparna+Unispace+-+Mega+store/@17.528614,78.3542379,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcb8d56577165e5:0x9d5b65e392bc58e2!8m2!3d17.528614!4d78.3542379!16s%2Fg%2F11x83ytlj3?entry=tts&g_ep=EgoyMDI1MDcyOS4wIPu8ASoASAFQAw%3D%3D&skid=da11b7fc-6906-421e-ab33-594872006693'
    },
    {
      location: 'Bengaluru',
      name: 'Bengaluru Showroom',
      address:
        '2989/E, 12th Main Rd, opposite to Namdhari, 7th Cross, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',
      phone1: '+91-9154088438',
      phone2: '18001216229',
      href: 'https://www.google.com/maps/place/APARNA+UNISPACE/@12.9700195,77.645866,19z/data=!4m6!3m5!1s0x3bae17cbbe70fbc9:0x31a33bc579bc4cbd!8m2!3d12.9701586!4d77.6458046!16s%2Fg%2F11y1k23t6t?entry=ttu'
    },
    {
      location: 'Vijayawada',
      name: 'Vijayawada Showroom',
      address:
        'Gandikota Complex, 27-12-75, Prakasam Rd, Governor Peta, Vijayawada, Andhra Pradesh 520002',
      phone1: '+91-9154088438',
      phone2: '18001216229',
      href: 'https://www.google.com/maps/place/Aparna+Unispace/@16.511178,80.629839,15z/data=!4m6!3m5!1s0x3a35f1d218bbbe67:0xb29dd42964dfd94d!8m2!3d16.5111778!4d80.6298386!16s%2Fg%2F11kjzf__4g?ll=16.511178,80.629839&z=15&t=m&hl=en&gl=IN&mapclient=embed&cid=12870676584345885005&entry=tts'
    },
    {
      location: 'Chennai',
      name: 'Chennai Showroom',
      address:
        'Suryavarsh building, Wallace Garden, 2nd St, Thousand Lights West, Nungambakkam, Chennai, Tamil Nadu 600034',
      phone1: '+91 9154088438',
      phone2: '18001216229',
      href: 'https://www.google.com/maps/place/Aparna+Unispace+-+Chennai/@13.0605358,80.2479344,17z/data=!3m1!4b1!4m6!3m5!1s0x3a5267866717e03f:0xbf7d34ea59f7ad55!8m2!3d13.0605358!4d80.2479344!16s%2Fg%2F11svlf2gt6?entry=ttu&g_ep=EgoyMDI1MDgwNi4wIKXMDSoASAFQAw%3D%3D'
    }
  ]

  const [selected, setSelected] = useState('all')
  const displayStore =
    selected === 'all' ? data : data.filter((loc) => loc.name === selected)

  return (
    <div className="site-container">
      <div className="flex justify-center items-center mb-6 sm:mb-10">
        <h1 className="font-bold text-2xl sm:text-3xl 2xl:text-[42px] text-primary">
          Our Showrooms
        </h1>
      </div>
      <div className="my-6">
        <select
          className="border border-gray-300 rounded-lg p-2 text-gray-700"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="" disabled>
            Select Location
          </option>
          <option value="all">All Locations</option>
          {data?.map((item, index) => (
            <option key={index} value={item?.name}>
              {item?.location}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayStore?.map((items, index) => (
          <div
            key={index}
            className="p-4 sm:p-6 bg-white rounded-md shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col cursor-default"
          >
            <h3 className="text-TextTitle text-xl md:text-[22px] font-medium">
              {items?.name}
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              <span className="font-medium text-gray-800">Address: </span>
              {items?.address}
            </p>
            <div className="flex items-center gap-2 my-4">
              <div className="flex items-center justify-center w-[36px] h-[36px]rounded-full">
                <i className="m-icon phone_icon invert-0 brightness-0 w-[18px] h-[18px]"></i>
              </div>
              <Link
                href={`tel:${items?.phone1}`}
                className="text-gray-800 hover:text-[#0073CF]"
              >
                {items?.phone1}
              </Link>
              ,
              <Link
                href={`tel:${items?.phone2}`}
                className="text-gray-800 hover:text-[#0073CF]"
              >
                {items?.phone2}
              </Link>
            </div>
            <Link
              href={`${items?.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="m-btn btn-primary mt-auto"
            >
              <i className="m-icon pv-address bg-transparent brightness-0 invert w-[18px] h-[18px]"></i>
              Locate Us
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OurStores
