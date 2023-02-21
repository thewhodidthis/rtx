import { add, multiply, cross, dot, normalize, subtract } from "./tuple.js"
import { EPSILON } from "./helper.js"
import { Shape } from "./shape.js"
import { intersection } from "./intersection.js"

export class Triangle extends Shape {
  constructor(...points) {
    super()

    const [p1, p2, p3] = points

    this.p1 = p1
    this.p2 = p2
    this.p3 = p3

    this.e1 = subtract(p2, p1)
    this.e2 = subtract(p3, p1)
  }
  get intersect() {
    return Shape.intersect(intersect)
  }
  get normal() {
    return Shape.normal(normal)
  }
}

export class SmoothTriangle extends Triangle {
  constructor(...options) {
    const [p1, p2, p3, n1, n2, n3] = options

    super(p1, p2, p3)

    this.n1 = n1
    this.n2 = n2
    this.n3 = n3
  }
}

export function normal(t, _, hit) {
  if (hit) {
    const a = multiply(t.n2, hit.u)
    const b = multiply(t.n3, hit.v)
    const c = multiply(t.n1, (1 - hit.u - hit.v))

    return normalize(add(a, add(b, c)))
  }

  return normalize(cross(t.e2, t.e1))
}

export function intersect(t, r) {
  const k = cross(r.direction, t.e2)
  const d = dot(t.e1, k)

  if (Math.abs(d) < EPSILON) {
    return []
  }

  const f = 1 / d
  const o = subtract(r.origin, t.p1)
  const u = f * dot(o, k)

  if (u < 0 || u > 1) {
    return []
  }

  const x = cross(o, t.e1)
  const v = f * dot(r.direction, x)

  if (v < 0 || (u + v) > 1) {
    return []
  }

  const q = f * dot(t.e2, x)

  return [intersection(q, t, u, v)]
}

export function smoothtriangle(...options) {
  return new SmoothTriangle(...options)
}

export function triangle(...options) {
  return new Triangle(...options)
}
