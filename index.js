/* global makeBackground getColour $fx fxpreview fxhash fxrand preloadImagesTmr makeBoidLines palettes */

//
//  HEXAGONES - art for bots for humans for print - revdancatt ??/??/2022
//
//
//  HELLO!! Code is copyright revdancatt (that's me), so no sneaky using it for your
//  NFT projects.
//  But please feel free to unpick it, and ask me questions. A quick note, this is written
//  as an artist, which is a slightly different (and more storytelling way) of writing
//  code, than if this was an engineering project. I've tried to keep it somewhat readable
//  rather than doing clever shortcuts, that are cool, but harder for people to understand.
//
//  You can find me at...
//  https://twitter.com/revdancatt
//  https://instagram.com/revdancatt
//  https://youtube.com/revdancatt
//

// Global values, because today I'm being an artist not an engineer!
const ratio = 1 // canvas ratio
const features = {} //  so we can keep track of what we're doing
const nextFrame = null // requestAnimationFrame, and the ability to clear it
let resizeTmr = null // a timer to make sure we don't resize too often
let highRes = false // display high or low res
let drawStarted = false // Flag if we have kicked off the draw loop
let thumbnailTaken = false
let forceDownloaded = false
const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams.entries())
const prefix = '7VV1N5'
// dumpOutputs will be set to false unless we have ?dumpOutputs=true in the URL
const dumpOutputs = urlParams.dumpOutputs === 'true'
// const startTime = new Date().getTime()

// Custom features go here
let zoom = false

//  We need this to display features
window.$fxhashFeatures = {}

//  Work out what all our features are
const makeFeatures = () => {
  features.lines1 = makeBoidLines({
    maxBoids: 4,
    velocity: 1,
    startAt: 1000,
    points: 1200,
    step: 2,
    massTurnDampen: 50,
    massMaxTurn: 0.25,
    avoidTurnDampen: 5,
    avoidMaxTurn: 1,
    // circle: 0.1,
    // xSin: 10,
    startBottom: true,
    debug: false
  })
  features.tl = fxrand() < 0.5
  features.trails = fxrand() < 0.123
  features.trailsRoated = fxrand() < 0.333
  features.cornerLines = fxrand() < 0.15
  features.grit = false

  features.zoom = []
  for (let i = 0; i < 3000; i++) features.zoom.push(fxrand())
  features.zoomPointer = 0

  window.$fxhashFeatures.Gritty = 'No'
  if (fxrand() < 0.8) {
    features.grit = true
    window.$fxhashFeatures.Gritty = 'Yes'
  }
  if (fxrand() < 0.4) features.cornerDirection = 'horizontal'

  //  Do the noise
  features.nSize = 2000
  const noisey = [0.0, 0.33, 0.66, 1.0]
  const noiseyIndex = Math.floor(fxrand() * noisey.length)
  window.$fxhashFeatures.Noisy = ['None', 'So-So', 'Obviously', 'ALL THE NOISE'][noiseyIndex]

  const noiseyChance = noisey[noiseyIndex]
  features.noise = []
  for (let y = 0; y < features.nSize; y++) {
    for (let x = 0; x < features.nSize; x++) {
      let noise = -1 // -1 indicates we don't use noise
      if (fxrand() < noiseyChance) noise = Math.floor(fxrand() * 100) //  If we do, then set the value
      features.noise.push(noise)
    }
  }

  const pickPalettes = {
    'New York': [0, 1, 2, 3],
    London: [4, 5, 6, 7],
    Paris: [8, 9, 10, 11],
    Munich: [12, 13, 14, 15],
    Monochrome: [20, 21, 22, 23],
    Red: [24, 25, 26, 27],
    Yellow: [28, 29, 30, 31],
    Green: [32, 33, 34, 35],
    Cyan: [36, 37, 38, 39],
    Blue: [40, 41, 42, 43],
    Magenta: [44, 45, 46, 47],
    Neon: [16, 17, 18, 19],
    Gen: [48, 49, 50, 51]
  }
  const pickPalette = ['Monochrome', 'Red', 'Yellow', 'Green', 'Cyan', 'Blue', 'Magenta']
  const altPalette = ['New York', 'London', 'Paris', 'Munich']
  let background1Name = pickPalette[Math.floor(fxrand() * pickPalette.length)]
  let background2Name = pickPalette[Math.floor(fxrand() * pickPalette.length)]
  while (background2Name === background1Name) background2Name = pickPalette[Math.floor(fxrand() * pickPalette.length)]
  if (fxrand() < 0.045) {
    background1Name = altPalette[Math.floor(fxrand() * altPalette.length)]
    background2Name = altPalette[Math.floor(fxrand() * altPalette.length)]
    while (background2Name === background1Name) background2Name = altPalette[Math.floor(fxrand() * altPalette.length)]
  }

  let background1 = [...pickPalettes[background1Name], pickPalettes.Neon[Math.floor(fxrand() * pickPalettes.Neon.length)]]
  let background2 = [...pickPalettes[background2Name], pickPalettes.Gen[Math.floor(fxrand() * pickPalettes.Gen.length)]]
  window.$fxhashFeatures.Background = background1Name
  window.$fxhashFeatures.Corners = background2Name

  if (fxrand() < 0.02237762) {
    background1 = pickPalettes.Neon
    background2 = pickPalettes.Gen
    window.$fxhashFeatures.Background = 'Neon'
    window.$fxhashFeatures.Corners = 'Gen'
    if (fxrand() < 0.5) {
      background1 = pickPalettes.Gen
      background2 = pickPalettes.Neon
      window.$fxhashFeatures.Background = 'Gen'
      window.$fxhashFeatures.Corners = 'Neon'
    }
    features.trails = false
    features.cornerLines = false
  }
  features.background1 = background1
  features.background2 = background2
  window.$fxhashFeatures.Trails = 'None'
  if (features.trails) {
    window.$fxhashFeatures.Trails = 'Flat'
    if (features.trailsRoated) window.$fxhashFeatures.Trails = 'Follow'
  }
  window.$fxhashFeatures['Corner Lines'] = 'None'
  if (features.cornerLines) {
    window.$fxhashFeatures['Corner Lines'] = 'Vertical'
    if (features.cornerDirection === 'horizontal') window.$fxhashFeatures['Corner Lines'] = 'Horizontal'
  }
}

//  Call the above make features, so we'll have the window.$fxhashFeatures available
//  for fxhash
makeFeatures()

//  This is where we bring it all together
const drawCanvas = async () => {
  drawStarted = true
  const canvas = document.getElementById('target')
  const ctx = canvas.getContext('2d')
  let w = canvas.width
  let h = canvas.height

  if (zoom) {
    if (w > h) h = w
    if (h > w) w = h
    const scale = features.zoom[features.zoomPointer] * 3 + 1
    //  This is the viewport size we'll see when we scale things up
    const vpW = canvas.width / scale
    const vpH = canvas.height / scale
    //  Work out the max size
    const mLength = Math.max(w, h)
    const remainingW = 1 - vpW / mLength
    const remainingH = 1 - vpH / mLength
    ctx.save()
    ctx.scale(scale, scale)
    ctx.translate(-w * features.zoom[features.zoomPointer + 1] * remainingW, -h * features.zoom[features.zoomPointer + 2] * remainingH)
  }
  //  Fill the page
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = w / 2000

  //  Draw the background
  features.backgrounds1.forEach((background) => {
    background.forEach((column) => {
      column.forEach((segment) => {
        if (!segment.hidden) {
          if (segment.gradient) {
            let grd = ctx.createLinearGradient(segment.x * w, segment.y * h, segment.x * w, segment.y * h + segment.h * h)
            if (!segment.gradUpDown) grd = ctx.createLinearGradient(segment.x * w, segment.y * h, segment.x * w + segment.w * w, segment.y * h)
            ctx.globalCompositeOperation = 'source-over'
            grd.addColorStop(0, `hsl(${segment.colour1.h}, ${segment.colour1.s}%, ${segment.colour1.l}%)`)
            grd.addColorStop(1, `hsl(${segment.colour2.h}, ${segment.colour2.s}%, ${segment.colour2.l}%)`)
            ctx.fillStyle = grd
          } else {
            ctx.fillStyle = `hsl(${segment.colour1.h}, ${segment.colour1.s}%, ${segment.colour1.l}%)`
          }
          ctx.beginPath()
          ctx.rect(segment.x * w, segment.y * h, segment.w * w, segment.h * h)
          ctx.fill()
        }
      })
    })
  })

  //  Draw the smattering or rotated boids
  const thisLine1 = features.lines1
  let palettePointer = 0
  let show = 0
  ctx.save()
  thisLine1.forEach((line) => {
    line.forEach((point) => {
      if (show % 40 === 0) {
        const colour = getColour(point.x, point.y, features.background1[palettePointer])
        ctx.save()
        ctx.translate(w * point.x, h * point.y)
        ctx.rotate(point.bearing * Math.PI / 180)
        ctx.beginPath()
        ctx.moveTo(-w / point.w, -h / point.h)
        ctx.lineTo(w / point.w, -h / point.h)
        ctx.lineTo(w / point.w, h / point.h)
        ctx.lineTo(-w / point.w, h / point.h)
        ctx.closePath()
        ctx.fillStyle = `hsla(${colour.h}, ${colour.s}%, ${colour.l}%, 1)`
        ctx.fill()
        ctx.restore()
      }
      show++
    })
    palettePointer++
    if (palettePointer >= features.background1.length) palettePointer = 0
  })

  //  And if we're supposed to, draw the trails
  if (features.trails) {
    const sizeMod = 1
    thisLine1.forEach((line) => {
      line.forEach((point) => {
        if (show % 2 === 0) {
          const colour = getColour(point.x, point.y, features.background1[palettePointer])
          ctx.save()
          ctx.translate(w * point.x, h * point.y)
          if (features.trailsRoated) {
            ctx.rotate(point.bearing * Math.PI / 180)
          } else {
            ctx.rotate(90 * Math.PI / 180)
          }
          ctx.beginPath()
          ctx.moveTo(-w / point.w * sizeMod * 0.1, -h / point.h * sizeMod)
          ctx.lineTo(w / point.w * sizeMod * 0.1, -h / point.h * sizeMod)
          ctx.lineTo(w / point.w * sizeMod * 0.1, h / point.h * sizeMod)
          ctx.lineTo(-w / point.w * sizeMod * 0.1, h / point.h * sizeMod)
          ctx.closePath()
          ctx.fillStyle = `hsla(${colour.h}, ${colour.s}%, ${colour.l}%, 1)`
          ctx.fill()
          ctx.restore()
        }
        show++
      })
      palettePointer++
      if (palettePointer >= features.background1.length) palettePointer = 0
    })
  }

  show = 0
  if (features.grit) {
    const sizeMod = 0.1
    thisLine1.forEach((line) => {
      line.forEach((point) => {
        if (show % 7 === 0) {
          ctx.save()
          ctx.translate(w * point.x, h * point.y)
          let xOffset = show % 3 + 1
          for (let i = 0; i < 8; i++) {
            const xOff = (w / 1000 * xOffset) / w
            const size = w / 100 * sizeMod
            const colour = getColour(Math.min(point.x + xOff, 1), point.y, features.background1[palettePointer])
            // ctx.beginPath()
            // ctx.arc(w * xOff, 0, w / 100 * sizeMod, 0, 2 * Math.PI)
            ctx.fillStyle = `hsla(${colour.h}, ${colour.s}%, ${colour.l}%, 1)`
            ctx.fillRect(w * xOff - size, -size, size * 2, size * 2)
            // ctx.fill()
            xOffset *= 2
          }
          ctx.restore()
        }
        show++
      })
      palettePointer++
      if (palettePointer >= features.background1.length) palettePointer = 0
    })
  }
  ctx.restore()

  //  Add the corner clip paths
  ctx.save()
  ctx.beginPath()
  if (features.tl) {
    ctx.arc(0, 0, w / 2, 0, 2 * Math.PI)
    ctx.arc(w, h, w / 2, 0, 2 * Math.PI)
  } else {
    ctx.arc(w, 0, w / 2, 0, 2 * Math.PI)
    ctx.arc(0, h, w / 2, 0, 2 * Math.PI)
  }
  ctx.clip()

  //  Draw the corner background
  features.backgrounds2.forEach((background) => {
    background.forEach((column) => {
      column.forEach((segment) => {
        if (!segment.hidden) {
          if (segment.gradient) {
            let grd = ctx.createLinearGradient(segment.x * w, segment.y * h, segment.x * w, segment.y * h + segment.h * h)
            if (!segment.gradUpDown) grd = ctx.createLinearGradient(segment.x * w, segment.y * h, segment.x * w + segment.w * w, segment.y * h)
            ctx.globalCompositeOperation = 'source-over'
            grd.addColorStop(0, `hsl(${segment.colour1.h}, ${segment.colour1.s}%, ${segment.colour1.l}%)`)
            grd.addColorStop(1, `hsl(${segment.colour2.h}, ${segment.colour2.s}%, ${segment.colour2.l}%)`)
            ctx.fillStyle = grd
          } else {
            ctx.fillStyle = `hsl(${segment.colour1.h}, ${segment.colour1.s}%, ${segment.colour1.l}%)`
          }
          ctx.beginPath()
          ctx.rect(segment.x * w, segment.y * h, segment.w * w, segment.h * h)
          ctx.fill()
        }
      })
    })
  })

  //  If we're supposed to draw corner lines, do that here
  if (features.cornerLines) {
    const thisLine2 = features.lines1
    palettePointer = 0
    const toggle = false
    ctx.lineWidth = w / 1000

    thisLine2.forEach((line) => {
      line.forEach((point) => {
        const colour = getColour(point.x, point.y, features.background2[palettePointer])
        ctx.save()
        ctx.translate(w * point.x, h * point.y)
        if (features.cornerDirection) ctx.rotate(90 * Math.PI / 180)
        ctx.beginPath()
        // ctx.rotate(point.bearing * Math.PI / 180)
        ctx.beginPath()
        if (toggle) {
          ctx.moveTo(-w / 4, 0)
          ctx.lineTo(w / 2, 0)
        } else {
          ctx.moveTo(0, -h / 4)
          ctx.lineTo(0, h / 2)
        }
        // toggle = !toggle
        ctx.strokeStyle = `hsla(${colour.h}, ${colour.s}%, ${colour.l}%, 1)`
        ctx.stroke()
        ctx.restore()
      })
      palettePointer++
      if (palettePointer >= features.background2.length) palettePointer = 0
    })
  }
  ctx.restore()

  //  NOISE
  let noisePointer = 0
  for (let y = 0; y < features.nSize; y++) {
    for (let x = 0; x < features.nSize; x++) {
      const noise = features.noise[noisePointer]
      if (noise >= 0) {
        ctx.fillStyle = `hsla(0, 0%, ${noise}%, 0.1)`
        ctx.fillRect(w / features.nSize * x, h / features.nSize * y, w / features.nSize, h / features.nSize)
      }
      noisePointer++
    }
  }

  if (zoom) {
    ctx.restore()
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Below is code that is common to all the projects, there may be some
  // customisation for animated work or special cases

  // Try various methods to tell the parent window that we've drawn something
  if (!thumbnailTaken) {
    try {
      $fx.preview()
    } catch (e) {
      try {
        fxpreview()
      } catch (e) {
      }
    }
    thumbnailTaken = true
  }

  // If we are forcing download, then do that now
  if (dumpOutputs || ('forceDownload' in urlParams && forceDownloaded === false)) {
    forceDownloaded = 'forceDownload' in urlParams
    await autoDownloadCanvas()
    // Tell the parent window that we have downloaded
    window.parent.postMessage('forceDownloaded', '*')
  } else {
    //  We should wait for the next animation frame here
    // nextFrame = window.requestAnimationFrame(drawCanvas)
  }
  //
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// These are the common functions that are used by the canvas that we use
// across all the projects, init sets up the resize event and kicks off the
// layoutCanvas function.
//
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//  Call this to start everything off
const init = async () => {
  features.backgrounds1 = []
  features.backgrounds1.push(makeBackground(180, features.background1, 0.4, 0))
  features.backgrounds1.push(makeBackground(48, features.background1, 0.4, 0.9))
  features.backgrounds2 = []
  features.backgrounds2.push(makeBackground(90, features.background2, 0.4, 0))

  // Resize the canvas when the window resizes, but only after 100ms of no resizing
  window.addEventListener('resize', async () => {
    //  If we do resize though, work out the new size...
    clearTimeout(resizeTmr)
    resizeTmr = setTimeout(async () => {
      await layoutCanvas()
    }, 100)
  })

  //  Now layout the canvas
  await layoutCanvas()
}

//  This is where we layout the canvas, and redraw the textures
const layoutCanvas = async (windowObj = window, urlParamsObj = urlParams) => {
  //  Kill the next animation frame (note, this isn't always used, only if we're animating)
  windowObj.cancelAnimationFrame(nextFrame)

  //  Get the window size, and devicePixelRatio
  const { innerWidth: wWidth, innerHeight: wHeight, devicePixelRatio = 1 } = windowObj
  let dpr = devicePixelRatio
  let cWidth = wWidth
  let cHeight = cWidth * ratio

  if (cHeight > wHeight) {
    cHeight = wHeight
    cWidth = wHeight / ratio
  }

  // Grab any canvas elements so we can delete them
  const canvases = document.getElementsByTagName('canvas')
  Array.from(canvases).forEach(canvas => canvas.remove())

  // Now set the target width and height
  let targetHeight = highRes ? 4096 : cHeight
  let targetWidth = targetHeight / ratio

  //  If the alba params are forcing the width, then use that (only relevant for Alba)
  if (windowObj.alba?.params?.width) {
    targetWidth = window.alba.params.width
    targetHeight = Math.floor(targetWidth * ratio)
  }

  // If *I* am forcing the width, then use that, and set the dpr to 1
  // (as we want to render at the exact size)
  if ('forceWidth' in urlParams) {
    targetWidth = parseInt(urlParams.forceWidth)
    targetHeight = Math.floor(targetWidth * ratio)
    dpr = 1
  }

  // Update based on the dpr
  targetWidth *= dpr
  targetHeight *= dpr

  //  Set the canvas width and height
  const canvas = document.createElement('canvas')
  canvas.id = 'target'
  canvas.width = targetWidth
  canvas.height = targetHeight
  document.body.appendChild(canvas)

  canvas.style.position = 'absolute'
  canvas.style.width = `${cWidth}px`
  canvas.style.height = `${cHeight}px`
  canvas.style.left = `${(wWidth - cWidth) / 2}px`
  canvas.style.top = `${(wHeight - cHeight) / 2}px`

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  //
  // Custom code (for defining textures and buffer canvas goes here) if needed
  //

  if (zoom) {
    canvas.width = canvas.height * cWidth / cHeight
    //  Put it into position
    canvas.style.position = 'absolute'
    canvas.style.width = `${wWidth}px`
    canvas.style.height = `${wHeight}px`
    canvas.style.left = '0px'
    canvas.style.top = '0px'
  } else {
    //  Put it into position
    canvas.style.position = 'absolute'
    canvas.style.width = `${cWidth}px`
    canvas.style.height = `${cHeight}px`
    canvas.style.left = `${(wWidth - cWidth) / 2}px`
    canvas.style.top = `${(wHeight - cHeight) / 2}px`
  }
  drawCanvas()
}

//  This allows us to download the canvas as a PNG
// If we are forcing the id then we add that to the filename
const autoDownloadCanvas = async () => {
  const canvas = document.getElementById('target')

  // Create a download link
  const element = document.createElement('a')
  const filename = 'forceId' in urlParams
    ? `${prefix}_${urlParams.forceId.toString().padStart(4, '0')}_${fxhash}`
    : `${prefix}_${fxhash}`
  element.setAttribute('download', filename)

  // Hide the link element
  element.style.display = 'none'
  document.body.appendChild(element)

  // Convert canvas to Blob and set it as the link's href
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  element.setAttribute('href', window.URL.createObjectURL(imageBlob))

  // Trigger the download
  element.click()

  // Clean up by removing the link element
  document.body.removeChild(element)

  // Reload the page if dumpOutputs is true
  if (dumpOutputs) {
    window.location.reload()
  }
}

//  KEY PRESSED OF DOOM
document.addEventListener('keypress', async (e) => {
  e = e || window.event
  // == Common controls ==
  // Save
  if (e.key === 's') autoDownloadCanvas()

  //   Toggle highres mode
  if (e.key === 'h') {
    highRes = !highRes
    console.log('Highres mode is now', highRes)
    await layoutCanvas()
  }

  // Custom controls
  if (e.key === 'z') {
    zoom = true
    features.zoomPointer += 2
    if (features.zoomPointer >= features.zoom.length) features.zoomPointer = 0
    await layoutCanvas()
  }
  if (e.key === 'x') {
    zoom = false
    await layoutCanvas()
  }
})

document.addEventListener('dblclick', async (e) => {
  zoom = false
  await layoutCanvas()
})

document.addEventListener('click', async (e) => {
  zoom = true
  features.zoomPointer += 2
  if (features.zoomPointer >= features.zoom.length) features.zoomPointer = 0
  await layoutCanvas()
})

//  This preloads the images so we can get access to them
// eslint-disable-next-line no-unused-vars
const preloadImages = () => {
  //  Normally we would have a test
  // if (true === true) {
  if (palettes && !drawStarted) {
    clearInterval(preloadImagesTmr)
    init()
  }
}

console.table(window.$fxhashFeatures)
