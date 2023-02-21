import { dot, add, subtract, multiply, negate, reflect } from "./tuple.js"
import { EPSILON } from "./helper.js"
import { position, ray } from "./ray.js"

export function intersection(t, s, u, v) {
  return { t, object: s, u, v }
}

export function intersections(...items) {
  return [...items].sort((a, b) => a?.t - b?.t)
}

export function hit(items = []) {
  return items.find(item => item.t > 0)
}

export function schlick(o = {}) {
  let cos = dot(o.eye, o.normal)

  if (o.n1 > o.n2) {
    const n = o.n1 / o.n2
    const sin2T = n ** 2 * (1 - cos ** 2)

    if (sin2T > 1) {
      return 1
    }

    cos = Math.sqrt(1 - sin2T)
  }

  const r0 = ((o.n1 - o.n2) / (o.n1 + o.n2)) ** 2

  return r0 + (1 - r0) * (1 - cos) ** 5
}

export function prepare(i = intersection(), r = ray(), a = []) {
  const o = { ...i }

  o.point = position(r, o.t)
  o.normal = o.object.normal(o.object, o.point, i)
  o.eye = negate(r.direction)
  o.inside = false

  if (dot(o.normal, o.eye) < 0) {
    o.normal = negate(o.normal)
    o.inside = true
  }

  o.overpoint = add(o.point, multiply(o.normal, EPSILON))
  o.underpoint = subtract(o.point, multiply(o.normal, EPSILON))
  o.reflect = reflect(r.direction, o.normal)

  if (a.length === 0) {
    a.push(i)
  }

  const objects = new Set()

  for (const x of a) {
    const { object } = x

    if (Object.is(x, i)) {
      o.n1 = objects.size ? Array.from(objects).at(-1).material.refractive : 1
    }

    if (objects.has(object)) {
      objects.delete(object)
    } else {
      objects.add(object)
    }

    if (Object.is(x, i)) {
      o.n2 = objects.size ? Array.from(objects).at(-1).material.refractive : 1

      break
    }
  }

  return o
}
