/* global fxrand */

const turn = (source, target, dampen, maxTurn) => {
  let targetAngle = Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI
  while (targetAngle < 0) targetAngle += 360
  let antiAngle = source.bearing - targetAngle
  while (antiAngle < 0) antiAngle += 360
  let clockAngle = targetAngle - source.bearing
  while (clockAngle < 0) clockAngle += 360
  let headingMod = 0
  if (antiAngle < clockAngle) {
    headingMod = -antiAngle / dampen
  } else {
    headingMod = clockAngle / dampen
  }
  if (headingMod < -maxTurn) headingMod = -maxTurn
  if (headingMod > maxTurn) headingMod = maxTurn

  return headingMod
}

//  Make the lines generated from the boids

const makeBoidLines = (options) => { // eslint-disable-line no-unused-vars
  // const startTime = new Date().getTime()
  const boids = []
  //  First make all the boids
  for (let b = 0; b < options.maxBoids; b++) {
    //  Start with random settings
    let x = fxrand()
    let y = fxrand()
    let bearing = fxrand() * 360
    //  If we've been passed over options to start along the edge then we do that here
    if (options.startLeft) x = 0.001
    if (options.startRight) x = 0.999
    if (options.startTop) y = 0.001
    if (options.startBottom) y = 0.999
    if (options.startMiddle) x = 0.5
    if (options.startMiddle) y = 0.5
    if ('bearing' in options) bearing = options.bearing - 90
    boids.push({
      index: b,
      x,
      y,
      velocity: 0.002,
      bearing,
      pointCounter: 0,
      lines: [],
      line: [],
      lastPoint: {
        x,
        y
      }
    })
  }

  //  Now we have all the boids we need to run the simulations x number of times
  //  storing the lines
  const lineMap = {} // eslint-disable-line no-unused-vars
  const maxLoops = options.startAt + (options.points * options.step)
  //  Just incase we want to show the output
  let canvas = null
  let ctx = null
  let w = null
  let h = null
  //  If we are debugging...
  if (options.debug) {
    canvas = document.getElementById('target')
    ctx = canvas.getContext('2d')
    w = canvas.width
    h = canvas.height
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.fillRect(0, 0, w, h)
  }
  //  Now run the simulation
  for (let loop = 0; loop < maxLoops; loop++) {
    //  Do the things
    //  If we are in debug mode, clear the view
    if (options.debug) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
      // ctx.fillRect(0, 0, w, h)
    }

    //  First work out where the center of mass is
    const mass = {
      x: 0,
      y: 0
    }
    boids.forEach((b) => {
      mass.x += b.x
      mass.y += b.y
    })
    mass.x /= options.maxBoids
    mass.y /= options.maxBoids

    //  Do we have any special rules for the mass?
    if (options.circle) {
      mass.x = (Math.sin(loop / options.circle) / 2 * 0.8) + 0.5
      mass.y = (Math.cos(loop / options.circle) / 2 * 0.8) + 0.5
    }
    if (options.xSin) mass.x = (Math.sin(loop / options.xSin) / 2 * 0.8) + 0.5
    if (options.ySin) mass.y = (Math.sin(loop / options.ySin) / 2 * 0.8) + 0.5
    if ('xScroll' in options) mass.x = loop * options.xScroll
    if ('yScroll' in options) mass.y = loop * options.yScroll
    if ('xPos' in options) mass.x = options.xPos
    if ('yPos' in options) mass.y = options.yPos
    while (mass.x < 0) mass.x += 1
    while (mass.x >= 1) mass.x -= 1
    while (mass.y < 0) mass.y += 1
    while (mass.y >= 1) mass.y -= 1

    //  Now we have the center of mass, we can go through each boid
    //  moving them
    boids.forEach((b) => {
      //  Work out if we need to split the line and start a new one
      //  if we have started, or flipped over the pointCounter then
      //  store the line point

      let storePoint = false
      if (loop === options.startAt || b.pointCounter === options.step) {
        //  Store the point into the boid
        storePoint = true
        b.line.push({
          x: b.x,
          y: b.y,
          bearing: b.bearing
        })

        //  If the point has gone off the edge of the viewport, then we need to
        //  move the line over from the line to the lines, then start a new line
        //  beginning with the previous point and then this current one
        let breakLine = false
        let newX = b.x
        let newY = b.y
        let oldX = b.lastPoint.x
        let oldY = b.lastPoint.y
        //  Shift the other points over to the other side
        if (newX < 0) {
          breakLine = true
          newX += 1
          oldX += 1
        }
        if (newX >= 1) {
          breakLine = true
          newX -= 1
          oldX -= 1
        }
        if (newY < 0) {
          breakLine = true
          newY += 1
          oldY += 1
        }
        if (newY >= 1) {
          breakLine = true
          newY -= 1
          oldY -= 1
        }
        //  If we are supposed to break the line, then do that here
        if (breakLine) {
          b.lines.push(b.line)
          b.line = []
          b.line.push({
            x: oldX,
            y: oldY,
            bearing: b.lastPoint.bearing
          })
          b.line.push({
            x: newX,
            y: newY,
            bearing: b.bearing
          })
          while (b.x > 1) b.x -= 1
          while (b.x < 0) b.x += 1
          while (b.y > 1) b.y -= 1
          while (b.y < 0) b.y += 1
        }
      }

      b.lastPoint = {
        x: b.x,
        y: b.y,
        bearing: b.bearing
      }

      //  If we are equal to or beyond, increment the pointCounter
      if (loop >= options.startAt) b.pointCounter++
      if (b.pointCounter > options.step) b.pointCounter = 0

      //  Turn towards the center of mass
      b.bearing += turn(b, mass, options.massTurnDampen, options.massMaxTurn)

      //  Turn away from nearby boids
      const cutoff = 0.002
      boids.forEach((b2) => {
        //  If we are not matching
        if (b.x !== b2.x && b.y !== b2.y) {
          //  Check the distance
          const dist = Math.pow(b.x - b2.x, 2) + Math.pow(b.y - b2.y, 2)
          if (dist <= cutoff) b.bearing -= turn(b, b2, options.avoidTurnDampen, options.voidMaxTurn)
        }
      })

      while (b.bearing < 0) b.bearing += 360
      while (b.bearing >= 360) b.bearing -= 360

      //  Move each b by the amount
      b.x += Math.cos(b.bearing * Math.PI / 180) * b.velocity
      b.y += Math.sin(b.bearing * Math.PI / 180) * b.velocity

      if (options.debug) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'
        if (storePoint) ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.save()
        ctx.translate(w * b.x, h * b.y)
        ctx.rotate(b.bearing * Math.PI / 180)
        ctx.scale(1, 1)
        ctx.beginPath()
        ctx.moveTo(-w / 150, -h / 150)
        ctx.lineTo(w / 150, 0)
        ctx.lineTo(-w / 150, h / 150)
        ctx.closePath()
        if (loop >= options.startAt) ctx.fill()
        ctx.restore()
      }
    })

    //  Show the center of mass if we are in debug mode
    if (options.debug) {
      ctx.save()
      ctx.translate(w * mass.x, h * mass.y)
      ctx.fillStyle = 'rgb(255, 255, 0, 0.2)'
      ctx.beginPath()
      ctx.arc(0, 0, w / 150, 0, 2 * Math.PI)
      ctx.fill()
      ctx.restore()
    }
  }

  //  Now loop through all the boids putting the last line into the lines array
  let allLines = []
  boids.forEach((b) => {
    b.lines.push(b.line)
    allLines = [...allLines, ...b.lines]
  })
  // const endTime = new Date().getTime()
  allLines.forEach((line) => {
    line.forEach((p) => {
      p.w = fxrand() * 80 + 80
      p.h = fxrand() * 40 + 40
    })
  })
  return allLines
}
