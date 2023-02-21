import { point, subtract, normalize } from "./tuple.js"
import { ray } from "./ray.js"
import { id4, multiply, inverse } from "./matrix.js"
import { canvas } from "./canvas.js"
import { world, colorat } from "./world.js"

export function camera(h, v, fov) {
  const transform = id4()

  const aspect = h / v
  const halfview = Math.tan(fov / 2)
  const half = { w: halfview, h: halfview / aspect }

  if (aspect < 1) {
    half.w = halfview * aspect
    half.h = halfview
  }

  const resolution = 2 * half.w / h

  return { fov, h, v, transform, half, resolution }
}

export function pixelray(c = camera(), x, y) {
  // The offset from the edge of the canvas to the pixel's center
  const xoffset = (x + 0.5) * c.resolution
  const yoffset = (y + 0.5) * c.resolution

  // The untransformed coordinates of the pixel in world space. Since the
  // camera looks toward -z, +x is to the left.
  const worldx = c.half.w - xoffset
  const worldy = c.half.h - yoffset

  // Using the camera matrix, transform the canvas point and the origin,
  // and then compute the ray's direction vector. Remember that the canvas is at z = -1.
  const origin = multiply(inverse(c.transform), point())
  const pixel = multiply(inverse(c.transform), point(worldx, worldy, -1))
  const direction = normalize(subtract(pixel, origin))

  return ray(origin, direction)
}

export function render(c = camera(), w = world(), passes = 5) {
  const image = canvas(c.h, c.v)

  for (let y = 0; y < c.v; y += 1) {
    for (let x = 0; x < c.h; x += 1) {
      const r = pixelray(c, x, y)
      const s = colorat(w, r, passes)

      image.write(x, y, s)
    }
  }

  return image
}
