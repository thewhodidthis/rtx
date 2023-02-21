import { canvas, ppm } from "./canvas.js"
import { almostequal, lines } from "./helper.js"
import { color, equal } from "./tuple.js"

// Feature: Canvas

// Scenario: Creating a canvas
//   Given c ← canvas(10, 20)
//   Then c.width = 10
//     And c.height = 20
//     And every pixel of c is color(0, 0, 0)
{
  const c = canvas(10, 20)

  console.assert(almostequal(c.height, 20))
  console.assert(almostequal(c.width, 10))

  c.pixels.forEach((p) => {
    console.assert(equal(p, color()))
  })
}

// Scenario: Writing pixels to a canvas
//   Given c ← canvas(10, 20)
//     And red ← color(1, 0, 0)
//   When write_pixel(c, 2, 3, red)
//   Then pixel_at(c, 2, 3) = red
{
  const c = canvas(10, 20)
  const red = color(1, 0, 0)

  c.write(2, 3, red)
  c.write(4, 5, red)

  console.assert(equal(c.read(2, 3), red))
  console.assert(equal(c.read(4, 5), red))
}

// Scenario: Constructing the PPM header
//   Given c ← canvas(5, 3)
//   When ppm ← canvas_to_ppm(c)
//   Then lines 1-3 of ppm are
//     """
//     P3
//     5 3
//     255
//     """
{
  const c = canvas(5, 3)
  const result = ppm(c)
  const expect = `
P3
5 3
255
`

  console.assert(lines(result, 1, 3) === lines(expect, 1, 3))
}

// Scenario: Constructing the PPM pixel data
//   Given c ← canvas(5, 3)
//     And c1 ← color(1.5, 0, 0)
//     And c2 ← color(0, 0.5, 0)
//     And c3 ← color(-0.5, 0, 1)
//   When write_pixel(c, 0, 0, c1)
//     And write_pixel(c, 2, 1, c2)
//     And write_pixel(c, 4, 2, c3)
//     And ppm ← canvas_to_ppm(c)
//   Then lines 4-6 of ppm are
//     """
//     255 0 0 0 0 0 0 0 0 0 0 0 0 0 0
//     0 0 0 0 0 0 0 128 0 0 0 0 0 0 0
//     0 0 0 0 0 0 0 0 0 0 0 0 0 0 255
//     """
{
  const c = canvas(5, 3)

  const c1 = color(1.5, 0, 0)
  const c2 = color(0, 0.5, 0)
  const c3 = color(-0.5, 0, 1)

  c.write(0, 0, c1)
  c.write(2, 1, c2)
  c.write(4, 2, c3)

  const result = ppm(c)
  const expect = `
255 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 128 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 255
`

  console.assert(lines(result, 4, 6) === lines(expect, 1, 3))
}

// Scenario: Splitting long lines in PPM files
//   Given c ← canvas(10, 2)
//   When every pixel of c is set to color(1, 0.8, 0.6)
//     And ppm ← canvas_to_ppm(c)
//   Then lines 4-7 of ppm are
//     """
//     255 204 153 255 204 153 255 204 153 255 204 153 255 204 153 255 204
//     153 255 204 153 255 204 153 255 204 153 255 204 153
//     255 204 153 255 204 153 255 204 153 255 204 153 255 204 153 255 204
//     153 255 204 153 255 204 153 255 204 153 255 204 153
//     """
{
  const c = canvas(10, 2)

  c.pixels.forEach((_, i) => {
    c.pixels[i] = color(1, 0.8, 0.6)
  })

  const result = ppm(c)
  const expect = `
255 204 153 255 204 153 255 204 153 255 204 153 255 204 153 255 204
153 255 204 153 255 204 153 255 204 153 255 204 153
255 204 153 255 204 153 255 204 153 255 204 153 255 204 153 255 204
153 255 204 153 255 204 153 255 204 153 255 204 153
`

  console.assert(lines(result, 4, 7) === lines(expect, 1, 4))
}

// Scenario: PPM files are terminated by a newline character
//   Given c ← canvas(5, 3)
//   When ppm ← canvas_to_ppm(c)
//   Then ppm ends with a newline character
{
  const c = canvas(5, 3)
  const result = ppm(c)

  console.assert(result.endsWith("\n"))
}
