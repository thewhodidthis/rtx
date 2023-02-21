import { color, vector, point } from "./tuple.js"
import { multiply, rotation, translation, scaling }  from "./matrix.js"
import { WHITE } from "./pattern.js"
import { plane } from "./plane.js"
import { sphere } from "./sphere.js"
import { cube } from "./cube.js"
import { ppm } from "./canvas.js"
import { camera, render } from "./camera.js"
import { pointlight } from "./light.js"
import { view } from "./transform.js"
import { material } from "./material.js"
import { world } from "./world.js"

const pixels = 250
const c = camera(pixels, pixels, 0.785)
const from = point(-6, 6, -10)
const to = point(6, 0, 6)
const up = vector(-0.45, 1, 0)

c.transform = view(from, to, up)

const light = pointlight(point(-400, 50, -10), color(0.2, 0.2, 0.2))
const spot = pointlight(point(50, 100, -50), color(1, 1, 1))

const white = material(WHITE, 0.1, 0.7, 0)

white.reflective = 0.1

const blue = { ...white, color: color(0.537, 0.831, 0.914) }
const red = { ...white, color: color(0.941, 0.322, 0.388) }
const purple = { ...white, color: color(0.373, 0.404, 0.550) }

const standard = multiply(translation(1, -1, 1), scaling(0.5, 0.5, 0.5))

const large = multiply(standard, scaling(3.5, 3.5, 3.5))
const medium = multiply(standard, scaling(3, 3, 3))
const small = multiply(standard, scaling(2, 2, 2))

const s = sphere(material(purple.color, 0, 0.2, 1, 200, 0.7, 0.7, 1.5), large)
const b = plane(material(WHITE, 1, 0, 0))

b.transform = multiply(translation(0, 0, 500), rotation(Math.PI / 2, 0, 0))

const cubes = [
  cube(red, multiply(translation(4, 0, 0), medium)),
  cube(blue, multiply(translation(8.5, 1.5, -0.5), large)),
  cube(red, multiply(translation(0, 0, 4), large)),
  cube(white, multiply(translation(4, 0, 4), small)),
  cube(purple, multiply(translation(7.5, 0.5, 4), medium)),
  cube(white, multiply(translation(-0.25, 0.25, 8), medium)),
  cube(blue, multiply(translation(4, 1, 7.5), large)),
  cube(red, multiply(translation(10, 2, 7.5), medium)),
  cube(white, multiply(translation(8, 2, 12), small)),
  cube(white, multiply(translation(20, 1, 9), small)),
  cube(blue, multiply(translation(-0.5, -5, 0.25), large)),
  cube(red, multiply(translation(4, -4, 0), large)),
  cube(white, multiply(translation(8.5, -4, 0), large)),
  cube(white, multiply(translation(0, -4, 4), large)),
  cube(purple, multiply(translation(-0.5, -4.5, 8), large)),
  cube(white, multiply(translation(0, -8, 4), large)),
  cube(white, multiply(translation(-0.5, -8.5, 8), large)),
]

const w = world(spot, b, s, ...cubes)

w.lights.push(light)

const image = render(c, w, 2)

console.log(ppm(image))
