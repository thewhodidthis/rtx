import { almostequal, EPSILON } from "./helper.js"
import { Shape } from "./shape.js"
import { intersection } from "./intersection.js"
import { vector } from "./tuple.js"

export class Cone extends Shape {
  constructor(...options) {
    super(...options)

    this.minimum = self.Infinity * -1
    this.maximum = self.Infinity
    this.open = true
  }
  get intersect() {
    return Shape.intersect(intersect)
  }
  get normal() {
    return Shape.normal(normal)
  }
}

export function intersect(s, r) {
  const result = []
  const a = Math.pow(r.direction[0], 2) - Math.pow(r.direction[1], 2) + Math.pow(r.direction[2], 2)
  const b = (2 * r.origin[0] * r.direction[0]) -
            (2 * r.origin[1] * r.direction[1]) +
            (2 * r.origin[2] * r.direction[2])
  const c = Math.pow(r.origin[0], 2) - Math.pow(r.origin[1], 2) + Math.pow(r.origin[2], 2)

  // Ray is parallel to the y axis.
  if (almostequal(a, 0)) {
    if (b === 0) {
      return result
    }

    result.push(intersection(-c / (2 * b), s))
  }

  const disc = Math.pow(b, 2) - (4 * a * c)

  // Ray does not intersect the cone.
  if (disc < 0) {
    return result
  }

  let t0 = (-b - Math.sqrt(disc)) / (2 * a)
  let t1 = (-b + Math.sqrt(disc)) / (2 * a)

  if (t0 > t1) {
    [t0, t1] = [t1, t0]
  }

  const y0 = r.origin[1] + (t0 * r.direction[1])

  if (s.minimum < y0 && y0 < s.maximum) {
    result.push(intersection(t0, s))
  }

  const y1 = r.origin[1] + (t1 * r.direction[1])

  if (s.minimum < y1 && y1 < s.maximum) {
    result.push(intersection(t1, s))
  }

  if (s.open || almostequal(r.direction[1], 0)) {
    return result
  }

  {
    const t = (s.minimum - r.origin[1]) / r.direction[1]

    if (capchecker(r, t, s.minimum)) {
      result.push(intersection(t, s))
    }
  }

  {
    const t = (s.maximum - r.origin[1]) / r.direction[1]

    if (capchecker(r, t, s.maximum)) {
      result.push(intersection(t, s))
    }
  }

  return result
}

export function normal({ maximum, minimum }, [x, y, z]) {
  // Compute the square of the distance from the y axis.
  const d = Math.pow(x, 2) + Math.pow(z, 2)

  if (d < 1 && y >= maximum - EPSILON) {
    return vector(0, 1, 0)
  }

  if (d < 1 && y <= minimum + EPSILON) {
    return vector(0, -1, 0)
  }

  const q = -1 * Math.sign(y) * Math.sqrt(d)

  return vector(x, q, z)
}

export function cone(...options) {
  return new Cone(...options)
}

function capchecker(r, t, y) {
  const x = r.origin[0] + (t * r.direction[0])
  const z = r.origin[2] + (t * r.direction[2])

  return (Math.pow(x, 2) + Math.pow(z, 2)) <= Math.abs(y)
}
