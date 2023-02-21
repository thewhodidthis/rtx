// The tuple.js module contains helpers for creating and
// running math on fixed length arrays.
import { almostequal } from "./helper.js"

export class Tuple extends Array {}

export function tuple(n) {
  return (...a) => new Tuple(...a.slice(0, n))
}

export const quadruple = tuple(4)
export const triple = tuple(3)

export function point(x = 0, y = 0, z = 0) {
  return quadruple(x, y, z, 1)
}

export function vector(x = 0, y = 0, z = 0) {
  return quadruple(x, y, z, 0)
}

export function color(r = 0, g = 0, b = 0) {
  return triple(r, g, b)
}

export function equal(a, b) {
  return a.every((v, i) => almostequal(v, b[i]))
}

export function round(a, d = 5) {
  return a.map(v => parseFloat(v.toFixed(d)))
}

export function replace(a, b) {
  return a.splice(0, a.length, ...b)
}

export function add(a, b) {
  return a.map((v, i) => v + b[i])
}

export function subtract(a, b) {
  return a.map((v, i) => v - b[i])
}

// Same for Hadamard or Schur product.
export function multiply(a, b) {
  return b instanceof Array ? a.map((v, i) => v * b[i]) : a.map(v => v * b)
}

export function divide(a, b) {
  return b instanceof Array ? a.map((v, i) => v / b[i]) : a.map(v => v / b)
}

export function negate(a) {
  return a.map(v => -1 * v)
}

export function magnitude(a) {
  const o = a.map(v => v * v).reduce((u, v) => u + v)

  return Math.sqrt(o)
}

export function normalize(a) {
  return divide(a, magnitude(a))
}

export function dot(a, b) {
  return multiply(a, b).reduce((u, v) => u + v)
}

export function cross(a, b) {
  const c = vector(...a)
  const d = vector(...b)

  const x = (c[1] * d[2]) - (c[2] * d[1])
  const y = (c[2] * d[0]) - (c[0] * d[2])
  const z = (c[0] * d[1]) - (c[1] * d[0])

  return vector(x, y, z)
}

export function reflect(v, n) {
  return subtract(v, multiply(n, 2 * dot(v, n)))
}
