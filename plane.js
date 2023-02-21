import { intersection } from "./intersection.js"
import { EPSILON } from "./helper.js"
import { Shape } from "./shape.js"
import { vector } from "./tuple.js"

export class Plane extends Shape {
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

export function intersect(s, r) {
  if (Math.abs(r.direction[1]) >= EPSILON) {
    return [intersection(-r.origin[1] / r.direction[1], s)]
  }
}

export function normal() {
  return vector(0, 1, 0)
}

export function plane(...options) {
  return new Plane(...options)
}
