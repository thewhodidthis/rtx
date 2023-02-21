import { dot, subtract, point } from "./tuple.js"
import { inverse } from "./matrix.js"
import { material } from "./material.js"
import { Shape } from "./shape.js"
import { intersection } from "./intersection.js"
import { transform } from "./ray.js"

export const intersect = Shape.intersect((s, r) => {
  const o = point()

  const a = dot(r.direction, r.direction)
  const d = subtract(r.origin, o)

  const b = 2 * dot(r.direction, d)
  const c = dot(d, d) - 1

  const discriminant = (b * b) - (4 * a * c)
  const result = []

  if (discriminant >= 0) {
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a)

    result.push(intersection(t1, s), intersection(t2, s))
  }

  return result
})


export const normal = Shape.normal((_, p) => {
  return subtract(p, point())
})

export class Sphere extends Shape {
  constructor(...options) {
    super(...options)
  }
  get intersect() {
    return intersect
  }
  get normal() {
    return normal
  }
}

export function sphere(...options) {
  return new Sphere(...options)
}

export function glass() {
  const m = material()

  m.transparency = 1
  m.refractive = 1.5

  return sphere(m)
}

// This is non object tracking basic intersect.
export function basicintersect(s, ray) {
  const r = transform(ray, inverse(s.transform))
  const o = point(0, 0, 0)
  const a = dot(r.direction, r.direction)
  const d = subtract(r.origin, o)
  const b = 2 * dot(r.direction, d)
  const c = dot(d, d) - 1

  const discriminant = b ** 2 - (4 * a * c)
  const result = []

  if (discriminant >= 0) {
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a)

    result.push(t1, t2)
  }

  return result
}
