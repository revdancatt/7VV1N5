/* global fxrand getColour */
// Make the background
const makeBackground = (columnCount, pals, gradChance, hide) => { // eslint-disable-line no-unused-vars
  //  Step one, make an array of numbers which is going to be the column sizes
  let columns = []
  for (let c = 0; c < columnCount; c++) {
    columns.push(fxrand())
  }
  //  Now sort them into order
  columns = columns.sort(function (a, b) {
    return a - b
  })
  columns.unshift(0)
  columns.push(1)
  //  Now go through the columns, breaking them up into sections
  const segments = []
  for (let c = 0; c <= columnCount; c++) {
    const width = columns[c + 1] - columns[c]
    let newTop = 1
    const areas = []
    while (newTop > 0) {
      let height = (2 - Math.sqrt(fxrand() * 4)) * width
      if (height < 0.001) height = 0.001
      newTop -= height
      if (newTop < 0) newTop = 0
      const newArea = {
        x: columns[c],
        y: newTop,
        w: width,
        h: height
      }
      const midPoint = {
        x: newArea.x + (newArea.w / 2),
        y: newArea.y - (newArea.h / 2)
      }
      if (fxrand() < 0.4) midPoint.x = 1 - midPoint.x
      if (fxrand() < 0.3) midPoint.y = 1 - midPoint.y
      if (fxrand() < 0.1) midPoint.x += fxrand()
      if (fxrand() < 0.1) midPoint.y += fxrand()
      while (midPoint.x >= 1) midPoint.x -= 1
      while (midPoint.y >= 1) midPoint.y -= 1
      newArea.colour1 = getColour(midPoint.x, midPoint.y, pals[Math.floor(fxrand() * pals.length)])
      newArea.colour2 = getColour(midPoint.x, midPoint.y, pals[Math.floor(fxrand() * pals.length)])
      newArea.gradient = true
      if (fxrand() > gradChance) {
        newArea.colour2 = newArea.colour1
        newArea.gradient = false
      }
      newArea.gradUpDown = fxrand() < 0.75
      newArea.hidden = fxrand() < hide
      areas.push(newArea)
    }
    segments.push(areas)
  }
  return segments
}
