import { chunk, almostequal }  from "./helper.js"
import { Tuple, dot, tuple } from "./tuple.js"

export class Matrix extends Array {}

export function matrix(r = 0, c = r) {
  return (...a) => new Matrix(...chunk(Array(r * c).fill(0).map((v, i) => a[i] ?? v), c))
}

export const mat2 = matrix(2)
export const mat3 = matrix(3)
export const mat4 = matrix(4)

export function identity(size) {
  const f = matrix(size)
  const m = f()

  return () => m.map((r, i) => r.map((_, j) => i === j ? 1 : 0))
}

export const id2 = identity(2)
export const id3 = identity(3)
export const id4 = identity(4)

export function equal(a, b, m) {
  return a.every((u, i) => u.every((v, j) => almostequal(v, b[i][j], m)))
}

export function inverse(m) {
  if (!invertible(m)) {
    throw new Error("matrix not invertible, sorry")
  }

  // TODO: Check if invertible.
  const c = m.map((r, i) => r.map((_, j) => cofactor(m, i, j)))
  const d = determinant(m)

  return transpose(c).map(r => r.map(v => v / d))
}

export function invertible(m) {
  return determinant(m) !== 0
}

export function determinant(m) {
  if (m.length > 2) {
    // Take the first row.
    return m[0].map((v, i) => v * cofactor(m, 0, i)).reduce((a, b) => a + b, 0)
  }

  if (m.length < 2) {
    return 0
  }

  return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0])
}

export function transpose(m) {
  return new Matrix(...columns(m))
}

export function reverse(m) {
  return m.map(r => r.reverse())
}

export function minor(...args) {
  return determinant(sub(...args))
}

export function cofactor(m, r, c) {
  const result = minor(m, r, c)

  // if row + column is an odd number, then you negate the minor.
  // Otherwise, you just return the minor as is.
  return (r + c) % 2 === 0 ? result : -result
}

export function sub(m, r, c) {
  return m.filter((_, i) => i !== r).map(r => r.filter((_, i) => i !== c))
}

export function multiply(a, b) {
  if (b instanceof Tuple) {
    const r = a?.map(r => dot(r, b))
    const t = tuple(a?.length)

    return t(...r)
  }

  return a?.map(function(r) {
    return this?.map(t => dot(r, t))
  }, transpose(b))
}

function* columns(m) {
  for (let i = 0; i < m.length; i += 1) {
    const v =  m.reduce((a, b) => {
      const c = b[i]

      if (c === undefined) {
        return a
      }

      return [...a, c]
    }, [])

    if (v.length) {
      yield v
    }
  }
}

export function* rows(m) {
  for (let i = 0; i < m.length; i += 1) {
    yield m[i]
  }
}

// Transformation matrices.
export function translation(x = 0, y = 0, z = 0) {
  const t = id4()

  // NOTE: Remember to transpose in column-major scenarios.
  t[0][3] = x
  t[1][3] = y
  t[2][3] = z

  return t
}

export function scaling(x = 1, y = 1, z = 1) {
  const t = id4()

  t[0][0] = x
  t[1][1] = y
  t[2][2] = z

  return t
}

export function rotation(x = 0, y = 0, z = 0) {
  const t = id4()

  if (x) {
    t[1][1] = Math.cos(x)
    t[1][2] = Math.sin(x) * -1
    t[2][1] = Math.sin(x)
    t[2][2] = Math.cos(x)
  }

  if (y) {
    t[0][0] = Math.cos(y)
    t[0][2] = Math.sin(y)
    t[2][0] = Math.sin(y) * -1
    t[2][2] = Math.cos(y)
  }

  if (z) {
    t[0][0] = Math.cos(z)
    t[0][1] = Math.sin(z) * -1
    t[1][0] = Math.sin(z)
    t[1][1] = Math.cos(z)
  }

  return t
}

export function rotationx(r) {
  return rotation(r)
}

export function rotationy(r) {
  return rotation(0, r)
}

export function rotationz(r) {
  return rotation(0, 0, r)
}

export function shearing(xy = 0, xz = 0, yx = 0, yz = 0, zx = 0, zy = 0) {
  const t = id4()

  t[0][1] = xy
  t[0][2] = xz

  t[1][0] = yx
  t[1][2] = yz

  t[2][0] = zx
  t[2][1] = zy

  return t
}
