/* global palettes packed */

const hexToRgb = (hex) => {
  const result = /([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

const rgbToHsl = (rgb) => {
  rgb.r /= 255
  rgb.g /= 255
  rgb.b /= 255
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  let h
  let s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rgb.r:
        h = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0)
        break
      case rgb.g:
        h = (rgb.b - rgb.r) / d + 2
        break
      case rgb.b:
        h = (rgb.r - rgb.g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  }
}

const lerpH = (h1, h2, percent) => {
  const d = h2 - h1
  const delta = d + ((Math.abs(d) > 180) ? ((d < 0) ? 360 : -360) : 0)
  let newH = h1 + (delta * percent)
  while (newH < 0) newH += 360
  while (newH >= 360) newH -= 360
  return newH
}

const lerpSL = (sl1, sl2, percent) => {
  return sl1 + ((sl2 - sl1) * percent)
}

const getColour = (x, y, pal, flipX, flipY) => { // eslint-disable-line no-unused-vars
  //  work out which 16th we are in
  while (x < 0) x += 1
  while (x >= 1) x -= 1
  while (y < 0) y += 1
  while (y >= 1) y -= 1
  let newX = x
  let newY = y
  while (newX < 0) newX += 1
  while (newX >= 1) newX -= 1
  while (newY < 0) newY += 1
  while (newY >= 1) newY -= 1
  let indexX1 = Math.floor(newX * 16)
  let indexY1 = Math.floor(newY * 16)
  if (indexX1 < 0) indexX1 = 15
  if (indexY1 < 0) indexY1 = 15
  if (indexX1 >= 16) indexX1 = 0
  if (indexY1 >= 16) indexY1 = 0

  let indexX2 = indexX1 + 1
  let indexY2 = indexY1 + 1
  if (indexX2 < 0) indexX2 = 15
  if (indexY2 < 0) indexY2 = 15
  if (indexX2 >= 16) indexX2 = 0
  if (indexY2 >= 16) indexY2 = 0

  let xPercent = (x - (indexX1 * 1 / 16)) / (1 / 16)
  let yPercent = (y - (indexY1 * 1 / 16)) / (1 / 16)
  while (xPercent < 0) xPercent += 1
  while (yPercent < 0) yPercent += 1

  const tl = palettes[pal][`${indexX1},${indexY1}`]
  const tr = palettes[pal][`${indexX2},${indexY1}`]
  const br = palettes[pal][`${indexX2},${indexY2}`]
  const bl = palettes[pal][`${indexX1},${indexY2}`]

  const topColour = {
    h: lerpH(tl.h, tr.h, xPercent),
    s: lerpSL(tl.s, tr.s, xPercent),
    l: lerpSL(tl.l, tr.l, xPercent)
  }
  const bottomColour = {
    h: lerpH(bl.h, br.h, xPercent),
    s: lerpSL(bl.s, br.s, xPercent),
    l: lerpSL(bl.l, br.l, xPercent)
  }
  const middleColour = {
    h: lerpH(topColour.h, bottomColour.h, yPercent),
    s: lerpSL(topColour.s, bottomColour.s, yPercent),
    l: lerpSL(topColour.l, bottomColour.l, yPercent)
  }
  return middleColour
}

const unpack = () => { // eslint-disable-line no-unused-vars
  const newPalettes = []
  packed.forEach((palString) => {
    const arrayString = palString.split('')
    const palette = {}
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let hex = []
        for (let i = 0; i < 6; i++) {
          hex.push(arrayString.shift())
        }
        hex = hex.join('')
        palette[`${x},${y}`] = rgbToHsl(hexToRgb(hex))
      }
    }
    newPalettes.push(palette)
  })
  return newPalettes
}
