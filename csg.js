import { intersections } from "./intersection.js"
import { Group } from "./group.js"

export class CSG {
  constructor(operation, s1, s2) {
    s1.parent = s2.parent = this

    this.l = s1
    this.r = s2
    this.operation = operation
  }
}

export function union(...shapes) {
  return new CSG("union", ...shapes)
}

export function csg(...options) {
  return new CSG(...options)
}

export function allowed(op, hit, inl, inr) {
  if (op === "intersection") {
    return (hit && inr) || (!hit && inl)
  }

  if (op === "union") {
    return (hit && !inr) || (!hit && !inl)
  }

  if (op === "difference") {
    return (hit && !inr) || (!hit && inl)
  }

  return false
}

export function intersect(c, r) {
  const lx = c.l.intersect(c.l, r)
  const rx = c.r.intersect(c.r, r)
  const xs = intersections(...lx, ...rx)

  return filter(c, xs)
}

function includes(a, b) {
  // If A is a Group, the includes operator should return true if child includes B for any child of A.
  if (a instanceof Group) {
    return a.children.find(c => includes(c, b))
  }

  // If A is a CSG object, the includes operator should return true if either child of A includes B.
  if (a instanceof CSG) {
    return includes(a.l, b) || includes(a.r, b)
  }

  // If A is any other shape, the includes operator should return true if A is equal to B.
  return Object.is(a, b)
}

export function filter(c, xs) {
  // Begin outside of both children.
  let inl = false
  let inr = false

  // Prepare a list to receive the filtered intersections.
  const result = []

  xs.forEach((i) => {
    // Should i.object be part of the "left" child, then `hit` is true.
    const hit = includes(c.l, i.object)

    if (allowed(c.operation, hit, inl, inr)) {
      result.push(i)
    }

    // Depending on which object was hit, toggle either `inl` or `inr`.
    if (hit) {
      inl = !inl
    } else {
      inr = !inr
    }
  })

  return result
}
