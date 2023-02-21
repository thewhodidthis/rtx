import { color, add, multiply, subtract, point } from "./tuple.js"
import * as matrix from "./matrix.js"
import { shape } from "./shape.js"

export const BLACK = color()
export const WHITE = color(1, 1, 1)

export default function pattern(a = WHITE, b = BLACK) {
  return { a, b, transform: matrix.id4(), at: ([x, y, z] = point()) => color(x, y, z) }
}

export function patternat(p = pattern(), pp = point()) {
  return p?.at(pp)
}

// TODO: Merge with above?
export function patternatshape(p = pattern(), o = shape(), wp = point()) {
  // TODO: Pass through `shape.worldToObject()` somehow?
  const op = matrix.multiply(matrix.inverse(o.transform), wp)
  const pp = matrix.multiply(matrix.inverse(p.transform), op)

  return p?.at(pp)
}

export function stripe(a = WHITE, b = BLACK) {
  return {
    a,
    b,
    transform: matrix.id4(),
    at([x] = point()) {
      return Math.floor(x) % 2 === 0 ? this.a : this.b
    },
  }
}

export function stripeatshape(...args) {
  return patternatshape(...args)
}

export function gradient(a = WHITE, b = BLACK) {
  return {
    a,
    b,
    transform: matrix.id4(),
    at([x] = point()) {
      const distance = subtract(this.b, this.a)
      const fraction = x - Math.floor(x)

      return add(this.a, multiply(distance, fraction))
    }
  }
}

export function ring(a = WHITE, b = BLACK) {
  return {
    a,
    b,
    transform: matrix.id4(),
    at([x, _, z] = point()) {
      return Math.floor(Math.sqrt((x * x) + (z * z))) % 2 === 0 ? this.a : this.b
    }
  }
}

export function checkers(a = WHITE, b = BLACK) {
  return {
    a,
    b,
    transform: matrix.id4(),
    at([x, y, z] = point()) {
      return Math.floor(x + y + z) % 2 === 0 ? this.a : this.b
    }
  }
}
