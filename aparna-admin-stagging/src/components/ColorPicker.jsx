import React, { useState, useEffect } from 'react'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'

const ColorPicker = ({ value, onChange, name, id }) => {
  const [colorValue, setColorValue] = useState(value ? value : '#000000')
  const [textInputValue, setTextInputValue] = useState(
    value ? value : '#000000'
  )

  useEffect(() => {
    setColorValue(value)
    setTextInputValue(value)
  }, [value])

  const hexToRgb = (hex) => {
    hex = hex.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => '#' + r + r + g + g + b + b
    )
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  const hslToRgb = (h, s, l) => {
    h = h / 360
    s = s / 100
    l = l / 100
    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }

  const rgbToHsl = (r, g, b) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h,
      s,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
        default:
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const rgbaToRgb = (r, g, b, a) => {
    const rgbAlpha = 1 - a
    const rgb = hexToRgb(colorValue)
    return {
      r: Math.round(r * a + rgb.r * rgbAlpha),
      g: Math.round(g * a + rgb.g * rgbAlpha),
      b: Math.round(b * a + rgb.b * rgbAlpha)
    }
  }

  const hslaToRgb = (h, s, l, a) => {
    const rgb = hslToRgb(h, s, l)
    return {
      r: Math.round(rgb.r * a + 255 * (1 - a)),
      g: Math.round(rgb.g * a + 255 * (1 - a)),
      b: Math.round(rgb.b * a + 255 * (1 - a))
    }
  }

  const getColorHexValue = (colorName) => {
    const colorNameLower = colorName.toLowerCase()
    const colorLookup = {
      aliceblue: '#f0f8ff',
      antiquewhite: '#faebd7',
      aqua: '#00ffff',
      aquamarine: '#7fffd4',
      azure: '#f0ffff',
      beige: '#f5f5dc',
      bisque: '#ffe4c4',
      black: '#000000',
      blanchedalmond: '#ffebcd',
      blue: '#0000ff',
      blueviolet: '#8a2be2',
      brown: '#a52a2a',
      burlywood: '#deb887',
      cadetblue: '#5f9ea0',
      chartreuse: '#7fff00',
      cornflowerblue: '#6495ed',
      cornsilk: '#fff8dc',
      crimson: '#dc143c',
      cyan: '#00ffff',
      darkblue: '#00008b',
      darkcyan: '#008b8b',
      darkgoldenrod: '#b8860b',
      darkgray: '#a9a9a9',
      darkgreen: '#006400',
      darkgrey: '#a9a9a9',
      darkkhaki: '#bdb76b',
      darkmagenta: '#8b008b',
      darkolivegreen: '#556b2f',
      darkorange: '#ff8c00',
      darkorchid: '#9932cc',
      darkred: '#8b0000',
      darksalmon: '#e9967a',
      darkseagreen: '#8fbc8f',
      darkslateblue: '#483d8b',
      darkslategray: '#2f4f4f',
      darkslategrey: '#2f4f4f',
      darkturquoise: '#00ced1',
      darkviolet: '#9400d3',
      deeppink: '#ff1493',
      deepskyblue: '#00bfff',
      dimgray: '#696969',
      dimgrey: '#696969',
      dodgerblue: '#1e90ff',
      firebrick: '#b22222',
      floralwhite: '#fffaf0',
      forestgreen: '#228b22',
      fuchsia: '#ff00ff',
      gainsboro: '#dcdcdc',
      ghostwhite: '#f8f8ff',
      gold: '#ffd700',
      goldenrod: '#daa520',
      gray: '#808080',
      green: '#008000',
      greenyellow: '#adff2f',
      grey: '#808080',
      honeydew: '#f0fff0',
      hotpink: '#ff69b4',
      indianred: '#cd5c5c',
      indigo: '#4b0082',
      ivory: '#fffff0',
      khaki: '#f0e68c',
      lavender: '#e6e6fa',
      lavenderblush: '#fff0f5',
      lawngreen: '#7cfc00',
      lemonchiffon: '#fffacd',
      lightblue: '#add8e6',
      lightcoral: '#f08080',
      lightcyan: '#e0ffff',
      lightgoldenrodyellow: '#fafad2',
      lightgray: '#d3d3d3',
      lightgreen: '#90ee90',
      lightgrey: '#d3d3d3',
      lightpink: '#ffb6c1',
      lightsalmon: '#ffa07a',
      lightseagreen: '#20b2aa',
      lightskyblue: '#87cefa',
      lightslategray: '#778899',
      lightslategrey: '#778899',
      lightsteelblue: '#b0c4de',
      lightyellow: '#ffffe0',
      lime: '#00ff00',
      limegreen: '#32cd32',
      linen: '#faf0e6',
      magenta: '#ff00ff',
      maroon: '#800000',
      mediumaquamarine: '#66cdaa',
      mediumblue: '#0000cd',
      mediumorchid: '#ba55d3',
      mediumpurple: '#9370db',
      mediumseagreen: '#3cb371',
      mediumslateblue: '#7b68ee',
      mediumspringgreen: '#00fa9a',
      mediumturquoise: '#48d1cc',
      mediumvioletred: '#c71585',
      midnightblue: '#191970',
      mintcream: '#f5fffa',
      mistyrose: '#ffe4e1',
      moccasin: '#ffe4b5',
      navajowhite: '#ffdead',
      navy: '#000080',
      oldlace: '#fdf5e6',
      olive: '#808000',
      olivedrab: '#6b8e23',
      orange: '#ffa500',
      orangered: '#ff4500',
      orchid: '#da70d6',
      palegoldenrod: '#eee8aa',
      palegreen: '#98fb98',
      paleturquoise: '#afeeee',
      palevioletred: '#db7093',
      papayawhip: '#ffefd5',
      peachpuff: '#ffdab9',
      peru: '#cd853f',
      pink: '#ffc0cb',
      plum: '#dda0dd',
      powderblue: '#b0e0e6',
      purple: '#800080',
      rebeccapurple: '#663399',
      red: '#ff0000',
      rosybrown: '#bc8f8f',
      royalblue: '#4169e1',
      saddlebrown: '#8b4513',
      salmon: '#fa8072',
      sandybrown: '#f4a460',
      seagreen: '#2e8b57',
      seashell: '#fff5ee',
      sienna: '#a0522d',
      silver: '#c0c0c0',
      skyblue: '#87ceeb',
      slateblue: '#6a5acd',
      slategray: '#708090',
      slategrey: '#708090',
      snow: '#fffafa',
      springgreen: '#00ff7f',
      steelblue: '#4682b4',
      tan: '#d2b48c',
      teal: '#008080',
      thistle: '#d8bfd8',
      tomato: '#ff6347',
      turquoise: '#40e0d0',
      violet: '#ee82ee',
      wheat: '#f5deb3',
      white: '#ffffff',
      whitesmoke: '#f5f5f5',
      yellow: '#ffff00',
      yellowgreen: '#9acd32'
    }

    return colorLookup[colorNameLower] || colorName
  }

  const handleColorChange = (event) => {
    const newColor = event.target.value
    setColorValue(newColor)
    setTextInputValue(newColor)
    onChange(newColor)
  }

  const handleTextInputChange = (event) => {
    const newColor = event.target.value
    setTextInputValue(newColor)
    try {
      let hexColor = newColor

      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
        // Check if it is HSL format
        const hslRegex =
          /hsla?\(\s*(\d+)\s*,\s*(\d+%)\s*,\s*(\d+%)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/
        const hslMatch = hslRegex.exec(newColor)
        if (hslMatch) {
          const h = parseInt(hslMatch[1])
          const s = parseInt(hslMatch[2])
          const l = parseInt(hslMatch[3])
          const a = parseFloat(hslMatch[4] || 1)
          if (hslMatch[0].startsWith('hsl')) {
            const rgbColor = hslToRgb(h, s, l)
            hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b)
          } else {
            const rgbColor = hslaToRgb(h, s, l, a)
            hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b)
          }
        } else {
          // Check if it is RGB format
          const rgbRegex =
            /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/
          const rgbMatch = rgbRegex.exec(newColor)
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1])
            const g = parseInt(rgbMatch[2])
            const b = parseInt(rgbMatch[3])
            const a = parseFloat(rgbMatch[4] || 1)
            if (rgbMatch[0].startsWith('rgb')) {
              hexColor = rgbToHex(r, g, b)
            } else {
              const rgbColor = rgbaToRgb(r, g, b, a)
              hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b)
            }
          } else {
            // Check if it is predefined color name
            hexColor = getColorHexValue(newColor)
          }
        }
      }

      setColorValue(hexColor)
      onChange(hexColor)
    } catch (error) {
      // Invalid color format, ignore
    }
  }

  return (
    <InputGroup size='sm' className='mb-3'>
      <InputGroup.Text id='inputGroup-sizing-default'>
        <input type='color' value={colorValue} onChange={handleColorChange} />
      </InputGroup.Text>
      <Form.Control
        className=' m-0'
        type='text'
        name={name}
        id={id}
        value={textInputValue}
        onChange={handleTextInputChange}
        style={{ marginLeft: '10px' }}
      />
    </InputGroup>
  )
}

export default ColorPicker
