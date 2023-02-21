import { vector, normalize, point } from "./tuple.js"
import { id4, multiply, transpose, inverse, sub } from "./matrix.js"
import { material } from "./material.js"
import { transform } from "./ray.js"

export class Shape {
  constructor(m = material(), t = id4()) {
    this.transform = t
    this.material = m
  }
  static intersect(f = new Function()) {
    return (s, r) => f(s, transform(r, inverse(s.transform)))
  }
  static normal(f = new Function()) {
    return (s = shape(), o = point(), ...extra) => {
      const p = worldToObject(s, o)
      const n = f(s, p, ...extra)

      return normalToWorld(s, n)
    }
  }
}

export function shape(...options) {
  return new Shape(...options)
}

export function worldToObject(s = shape(), o = point()) {
  const p = s.parent ? worldToObject(s.parent, o) : o

  return multiply(inverse(s.transform), p)
}

export function normalToWorld(s = shape(), v = vector()) {
  const n = normalize(vector(...multiply(transpose(inverse(sub(s.transform, 3, 3))), v)))

  return s.parent ? normalToWorld(s.parent, n) : n
}
