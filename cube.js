import { EPSILON } from "./helper.js"
import { intersection } from "./intersection.js"
import { Shape } from "./shape.js"
import { vector } from "./tuple.js"

export class Cube extends Shape {
  constructor(...options) {
    super(...options)
  }
  get intersect() {
    return Shape.intersect(intersect)
  }
  get normal() {
    return Shape.normal(normal)
  }
}

export function normal(_, [x, y, z]) {
  const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z))

  if (max === Math.abs(x) ) {
    return vector(x, 0, 0)
  }

  if (max === Math.abs(y)) {
    return vector(0, y, 0)
  }

  return vector(0, 0, z)
}

export function intersect(s, r) {
  const [xmin, xmax] = axischecker(r.origin[0], r.direction[0])
  const [ymin, ymax] = axischecker(r.origin[1], r.direction[1])
  const [zmin, zmax] = axischecker(r.origin[2], r.direction[2])

  const min = Math.max(xmin, ymin, zmin)
  const max = Math.min(xmax, ymax, zmax)

  const result = []

  if (min <= max) {
    result.push(intersection(min, s), intersection(max, s))
  }

  return result
}

export function cube(...options) {
  return new Cube(...options)
}

export function axischecker(origin, direction) {
  const f = Math.abs(direction) >= EPSILON ? 1 / direction : self.Infinity

  const min = f * (-origin - 1)
  const max = f * (-origin + 1)

  const result = [min, max]

  return min > max ? result.reverse() : result
}
