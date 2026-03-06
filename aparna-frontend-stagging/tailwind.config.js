const { heroui } = require('@heroui/react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    '-translate-y-0',
    'grid-cols-3',
    'md:grid-cols-4',
    'md:grid-cols-5',
    'md:grid-cols-6',
    'md:grid-cols-7',
    'md:grid-cols-8',
    'md:grid-cols-9',
    'md:grid-cols-10',
    'md:grid-cols-11',
    'md:grid-cols-12',
    '-translate-y-full'
  ],
  theme: {
    extend: {
      container: {
        padding: {
          DEFAULT: '1.5rem'
        }
      },
      screens: {
        sm: '768px',
        md: '1024px',
        lg: '1280px',
        xl: '1536px'
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        slategrey: '#707070',
        primary: '#0073CF',
        sectionTitel: '#393D46',
        'primary-hover': '#1981D3',
        'pink-light': '#FEF2F2',
        secondary: '#1F2937',
        'secondary-hover': '#1F2937',
        yellow: '#FFE869',
        yellowHover: '#F6D415',
        TextTitle: '#181826',
        grayishBlueWhite: '#F6F7FB',
        classicSilver: '#F6F7FA',
        lightGray: '#DBDBDB',
        extralightGray: '#f9f9f9',
        lightGraytext: '#878787',
        lighttext: '#535766',
        Gray: '#888888',
        JungleGreen: '#198754',
        darkgreen: '#0F5132',
        bluishgreen: '#D1E7DD',
        Scarlet: '#F33232',
        Darkgrey: '#BDBDBD',
        WhiteSmoke: '#F9F9F9',
        BlueGray: '#EDEFF5',
        SteelBlue: '#4067BC',
        // LightSilver:'#F7F8FB',
        LightSilver: '#F0F2F2',
        CharmPink: '#F8D7DA',
        ReddishBrown: '#842029',
        BluishGrey: '#B2B2B2',
        DodgerBlue: '#333EFF',
        Teal: '#03A685',
        link: '#0000EE',
        Total: '#B2EBF2',
        Placed: '#CFD8DC',
        Confirmed: '#ffcc80',
        Packed: '#ffe083',
        Shipped: '#e6ee9b',
        Delivered: '#c5e1a6',
        Cancelled: '#ffebee',
        Returned: '#ffebee',
        Replaced: '#ddedc8',
        Exchange: '#ddedc8',
        Failed: '#F8D7DA',
        returnRequested: '#fff3cd'
      },
      fontFamily: {
        dmSans: ['var(--font-dm-sans)'],
        roboto: ['var(--font-roboto)']
      },
      fontSize: {
        custom: '1.1rem',
        '1rem': '1rem',
        40: [
          '2.5rem',
          {
            lineHeight: '3rem'
          }
        ],
        48: [
          '3rem',
          {
            lineHeight: '3.75rem'
          }
        ],
        32: [
          '2rem',
          {
            lineHeight: '2.5rem'
          }
        ],
        28: [
          '1.75rem',
          {
            lineHeight: '2.25rem'
          }
        ],
        24: [
          '1.5rem',
          {
            lineHeight: '2rem'
          }
        ],
        18: [
          '1.125rem',
          {
            lineHeight: '1.75rem'
          }
        ],
        14: [
          '0.875rem',
          {
            lineHeight: '1.1394rem'
          }
        ],
        12: [
          '0.75rem',
          {
            lineHeight: '1.1394rem'
          }
        ]
      },
      boxShadow: {
        searchboxshadow: '0 1px 2px 0 rgba(148,150,159,.3)',
        prdboxshadow: '0px 0px 8px 2px #cfcfcfcc',
        prdbuttonshadow: '0px 0px 7px 0px #d5d4d4',
        light: '0 1px 10px rgba(0,0,0,.08)',
        medium: '0 4px 12px 0 rgba(0,0,0,.05)',
        card: '0 2px 16px 4px rgba(40,44,63,.07)',
        productcard: '1px 1px 5px #ccc',
        Popover: '0 4px 16px 0 rgba(0,0,0,.2)'
      }
    }
  },
  plugins: [heroui()]
}
