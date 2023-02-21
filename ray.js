import { add, multiply } from "./tuple.js"
import * as matrix from "./matrix.js"

export function ray(origin, direction) {
  return { origin, direction }
}

export function position(r, t) {
  return add(r.origin, multiply(r.direction, t))
}

export function transform(r, m) {
  const d = matrix.multiply(m, r.direction)
  const o = matrix.multiply(m, r.origin)

  return ray(o, d)
}
