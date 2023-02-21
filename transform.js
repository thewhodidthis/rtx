import { multiply, translation, rotation, scaling, shearing, mat4 } from "./matrix.js"
import { normalize, negate, subtract, point, vector, cross } from "./tuple.js"

export default function transform(o, ...transformations) {
  return transformations.reduce((p, t) => multiply(t, p), o)
}

export function translate(o, ...rest) {
  return multiply(translation(...rest), o)
}

export function scale(o, ...rest) {
  return multiply(scaling(...rest), o)
}

export function skew(o, ...rest) {
  return multiply(shearing(...rest), o)
}

export function rotate(o, ...rest) {
  return multiply(rotation(...rest), o)
}

export function rotatex(o, r) {
  return rotate(o, r)
}

export function rotatey(o, r) {
  return rotate(o, 0, r)
}

export function rotatez(o, r) {
  return rotate(o, 0, 0, r)
}

export function view(from = point(), to = point(), up = vector(0, 1, 0)) {
  const forward = normalize(subtract(to, from))
  const left = cross(forward, normalize(up))
  const y = cross(left, forward)
  const orientation = mat4(...left, ...y, ...negate(forward), ...point())

  return multiply(orientation, translation(...negate(from)))
}
