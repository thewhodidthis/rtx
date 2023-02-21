import { point, vector, equal, round } from "./tuple.js"
import {
  inverse,
  multiply,
  id4,
  mat4,
  equal as matrixequal,
  translation,
  rotation,
  scaling,
  shearing,
  rotationx,
  rotationy,
  rotationz
} from "./matrix.js"
import {
  default as transform,
  view,
  translate,
  scale,
  skew,
  rotate,
  rotatex,
  rotatey,
  rotatez
} from "./transform.js"

// Feature: Matrix Transformations

// Scenario: Multiplying by a translation matrix
//   Given transform ← translation(5, -3, 2)
//     And p ← point(-3, 4, 5)
//    Then transform * p = point(2, 1, 7)
{
  const t = translation(5, -3, 2)
  const a = point(-3, 4, 5)
  const b = point(2, 1, 7)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(translate(a, 5, -3, 2), b))
}

// Scenario: Multiplying by the inverse of a translation matrix
//   Given transform ← translation(5, -3, 2)
//     And inv ← inverse(transform)
//     And p ← point(-3, 4, 5)
//    Then inv * p = point(-8, 7, 3)
{
  const t = translation(5, -3, 2)
  const i = inverse(t)
  const a = point(-3, 4, 5)
  const b = point(-8, 7, 3)

  console.assert(equal(multiply(i, a), b))
}

// Scenario: Translation does not affect vectors
//   Given transform ← translation(5, -3, 2)
//     And v ← vector(-3, 4, 5)
//    Then transform * v = v
{
  const t = translation(5, -3, 2)
  const v = vector(-3, 4, 5)

  console.assert(equal(multiply(t, v), v))
  console.assert(equal(translate(v, 5, -3, 2), v))
}

// Scenario: A scaling matrix applied to a point
//   Given transform ← scaling(2, 3, 4)
//     And p ← point(-4, 6, 8)
//    Then transform * p = point(-8, 18, 32)
{
  const t = scaling(2, 3, 4)
  const a = vector(-4, 6, 8)
  const b = vector(-8, 18, 32)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(scale(a, 2, 3, 4), b))
}

// Scenario: A scaling matrix applied to a vector
//   Given transform ← scaling(2, 3, 4)
//     And v ← vector(-4, 6, 8)
//    Then transform * v = vector(-8, 18, 32)
{
  const t = scaling(2, 3, 4)
  const v = vector(-4, 6, 8)
  const b = vector(-8, 18, 32)

  console.assert(equal(multiply(t, v), b))
  console.assert(equal(scale(v, 2, 3, 4), b))
}

// Scenario: Multiplying by the inverse of a scaling matrix
//   Given transform ← scaling(2, 3, 4)
//     And inv ← inverse(transform)
//     And v ← vector(-4, 6, 8)
//    Then inv * v = vector(-2, 2, 2)
{
  const t = scaling(2, 3, 4)
  const i = inverse(t)
  const v = vector(-4, 6, 8)
  const b = vector(-2, 2, 2)

  console.assert(equal(multiply(i, v), b))
}

// Scenario: Reflection is scaling by a negative value
//   Given transform ← scaling(-1, 1, 1)
//     And p ← point(2, 3, 4)
//    Then transform * p = point(-2, 3, 4)
{
  const t = scaling(-1, 1, 1)
  const a = point(2, 3, 4)
  const b = point(-2, 3, 4)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(scale(a, -1, 1, 1), b))
}

// Scenario: Rotating a point around the x axis
//   Given p ← point(0, 1, 0)
//     And half_quarter ← rotation_x(π / 4)
//     And full_quarter ← rotation_x(π / 2)
//   Then half_quarter * p = point(0, √2/2, √2/2)
//     And full_quarter * p = point(0, 0, 1)
{
  const a = point(0, 1, 0)
  const b = point(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  const c = point(0, 0, 1)

  console.assert(equal(multiply(rotationx(Math.PI / 4), a), b))
  console.assert(equal(rotatex(a, Math.PI / 4), b))
  console.assert(equal(multiply(rotationx(Math.PI / 2), a), c))
  console.assert(equal(rotatex(a, Math.PI / 2), c))
}

// Scenario: The inverse of an x-rotation rotates in the opposite direction
//   Given p ← point(0, 1, 0)
//     And half_quarter ← rotation_x(π / 4)
//     And inv ← inverse(half_quarter)
//   Then inv * p = point(0, √2/2, -√2/2)
{
  const a = point(0, 1, 0)
  const b = point(0, Math.sqrt(2) / 2, -1 * Math.sqrt(2) / 2)

  console.assert(equal(multiply(inverse(rotationx(Math.PI / 4)), a), b))
}

// Scenario: Rotating a point around the y axis
//   Given p ← point(0, 0, 1)
//     And half_quarter ← rotation_y(π / 4)
//     And full_quarter ← rotation_y(π / 2)
//   Then half_quarter * p = point(√2/2, 0, √2/2)
//     And full_quarter * p = point(1, 0, 0)
{
  const a = point(0, 0, 1)
  const b = point(Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2)
  const c = point(1, 0, 0)

  console.assert(equal(multiply(rotationy(Math.PI / 4), a), b))
  console.assert(equal(rotatey(a, Math.PI / 4), b))
  console.assert(equal(multiply(rotationy(Math.PI / 2), a), c))
  console.assert(equal(rotatey(a, Math.PI / 2), c))
}

// Scenario: Rotating a point around the z axis
//   Given p ← point(0, 1, 0)
//     And half_quarter ← rotation_z(π / 4)
//     And full_quarter ← rotation_z(π / 2)
//   Then half_quarter * p = point(-√2/2, √2/2, 0)
//     And full_quarter * p = point(-1, 0, 0)
{
  const a = point(0, 1, 0)
  const b = point(-1 * Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0)
  const c = point(-1, 0, 0)

  console.assert(equal(multiply(rotationz(Math.PI / 4), a), b))
  console.assert(equal(rotatez(a, Math.PI / 4), b))
  console.assert(equal(multiply(rotationz(Math.PI / 2), a), c))
  console.assert(equal(rotatez(a, Math.PI / 2), c))
}

// Scenario: A shearing transformation moves x in proportion to y
//   Given transform ← shearing(1, 0, 0, 0, 0, 0)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(5, 3, 4)
{
  const t = shearing(1)
  const a = point(2, 3, 4)
  const b = point(5, 3, 4)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 1), b))
}

// Scenario: A shearing transformation moves x in proportion to z
//   Given transform ← shearing(0, 1, 0, 0, 0, 0)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(6, 3, 4)
{
  const t = shearing(0, 1)
  const a = point(2, 3, 4)
  const b = point(6, 3, 4)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 0, 1), b))
}

// Scenario: A shearing transformation moves y in proportion to x
//   Given transform ← shearing(0, 0, 1, 0, 0, 0)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(2, 5, 4)
{
  const t = shearing(0, 0, 1)
  const a = point(2, 3, 4)
  const b = point(2, 5, 4)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 0, 0, 1), b))
}

// Scenario: A shearing transformation moves y in proportion to z
//   Given transform ← shearing(0, 0, 0, 1, 0, 0)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(2, 7, 4)
{
  const t = shearing(0, 0, 0, 1)
  const a = point(2, 3, 4)
  const b = point(2, 7, 4)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 0, 0, 0, 1), b))
}

// Scenario: A shearing transformation moves z in proportion to x
//   Given transform ← shearing(0, 0, 0, 0, 1, 0)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(2, 3, 6)
{
  const t = shearing(0, 0, 0, 0, 1)
  const a = point(2, 3, 4)
  const b = point(2, 3, 6)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 0, 0, 0, 0, 1), b))
}

// Scenario: A shearing transformation moves z in proportion to y
//   Given transform ← shearing(0, 0, 0, 0, 0, 1)
//     And p ← point(2, 3, 4)
//   Then transform * p = point(2, 3, 7)
{
  const t = shearing(0, 0, 0, 0, 0, 1)
  const a = point(2, 3, 4)
  const b = point(2, 3, 7)

  console.assert(equal(multiply(t, a), b))
  console.assert(equal(skew(a, 0, 0, 0, 0, 0, 1), b))
}

// Scenario: Individual transformations are applied in sequence
//   Given p ← point(1, 0, 1)
//     And A ← rotation_x(π / 2)
//     And B ← scaling(5, 5, 5)
//     And C ← translation(10, 5, 7)
//   # apply rotation first
//   When p2 ← A * p
//   Then p2 = point(1, -1, 0)
//   # then apply scaling
//   When p3 ← B * p2
//   Then p3 = point(5, -5, 0)
//   # then apply translation
//   When p4 ← C * p3
//   Then p4 = point(15, 0, 7)
{
  const a = rotation(Math.PI / 2)
  const b = scaling(5, 5, 5)
  const c = translation(10, 5, 7)

  const p1 = point(1, 0, 1)
  const p2 = point(1, -1, 0)
  const p3 = point(5, -5, 0)
  const p4 = point(15, 0, 7)

  console.assert(equal(multiply(a, p1), p2))
  console.assert(equal(multiply(b, p2), p3))
  console.assert(equal(multiply(c, p3), p4))

  console.assert(equal(rotate(p1, Math.PI / 2), p2))
  console.assert(equal(scale(p2, 5, 5, 5), p3))
  console.assert(equal(translate(p3, 10, 5, 7), p4))
}

// Scenario: Chained transformations must be applied in reverse order
//   Given p ← point(1, 0, 1)
//     And A ← rotation_x(π / 2)
//     And B ← scaling(5, 5, 5)
//     And C ← translation(10, 5, 7)
//   When T ← C * B * A
//   Then T * p = point(15, 0, 7)
{
  const a = rotation(Math.PI / 2)
  const b = scaling(5, 5, 5)
  const c = translation(10, 5, 7)

  const p1 = point(1, 0, 1)
  const p2 = point(15, 0, 7)

  console.assert(equal(multiply(multiply(c, multiply(b, a)), p1), p2))
  console.assert(equal(translate(scale(rotate(p1, Math.PI / 2), 5, 5, 5), 10, 5, 7), p2))
  console.assert(equal(transform(p1, a, b, c), p2))
}

// Scenario: The transformation matrix for the default orientation
//   Given from ← point(0, 0, 0)
//     And to ← point(0, 0, -1)
//     And up ← vector(0, 1, 0)
//   When t ← view_transform(from, to, up)
//   Then t = identity_matrix
{
  const from = point()
  const to = point(0, 0, -1)
  const up = vector(0, 1, 0)
  const t = view(from, to, up)

  console.assert(matrixequal(t, id4()))
}

// Scenario: A view transformation matrix looking in positive z direction
//   Given from ← point(0, 0, 0)
//     And to ← point(0, 0, 1)
//     And up ← vector(0, 1, 0)
//   When t ← view_transform(from, to, up)
//   Then t = scaling(-1, 1, -1)
{
  const from = point()
  const to = point(0, 0, 1)
  const up = vector(0, 1, 0)
  const t = view(from, to, up)

  console.assert(matrixequal(t, scaling(-1, 1, -1)))
}

// Scenario: The view transformation moves the world
//   Given from ← point(0, 0, 8)
//     And to ← point(0, 0, 0)
//     And up ← vector(0, 1, 0)
//   When t ← view_transform(from, to, up)
//   Then t = translation(0, 0, -8)
{
  const from = point(0, 0, 8)
  const to = point()
  const up = vector(0, 1, 0)
  const t = view(from, to, up)

  console.assert(matrixequal(t, translation(0, 0, -8)))
}

// Scenario: An arbitrary view transformation
//   Given from ← point(1, 3, 2)
//     And to ← point(4, -2, 8)
//     And up ← vector(1, 1, 0)
//   When t ← view_transform(from, to, up)
//   Then t is the following 4x4 matrix:
//       | -0.50709 | 0.50709 |  0.67612 | -2.36643 |
//       |  0.76772 | 0.60609 |  0.12122 | -2.82843 |
//       | -0.35857 | 0.59761 | -0.71714 |  0.00000 |
//       |  0.00000 | 0.00000 |  0.00000 |  1.00000 |
{
  const from = point(1, 3, 2)
  const to = point(4, -2, 8)
  const up = vector(1, 1, 0)
  const t = view(from, to, up).map(r => round(r))
  const v = mat4(
    -0.50709, 0.50709, 0.67612, -2.36643,
    0.76772, 0.60609,  0.12122, -2.82843,
    -0.35857, 0.59761, -0.71714, 0,
    0, 0, 0, 1,
  )

  console.assert(matrixequal(t, v))
}
