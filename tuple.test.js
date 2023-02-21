import { almostequal } from "./helper.js"
import {
  reflect,
  point,
  vector,
  color,
  equal,
  add,
  subtract,
  multiply,
  divide,
  magnitude,
  negate,
  normalize,
  dot,
  cross
} from "./tuple.js"

console.assert(almostequal(1.0000000000000001, 1.0))

// Feature: Tuples, Vectors, and Points

// Scenario: A tuple with w=1.0 is a point
//   Given a ← tuple(4.3, -4.2, 3.1, 1.0)
//   Then a.x = 4.3
//     And a.y = -4.2
//     And a.z = 3.1
//     And a.w = 1.0
//     And a is a point
//     And a is not a vector
{
  const a = [4.3, -4.2, 3.1, 1.0]

  console.assert(a.at(0) === 4.3)
  console.assert(a.at(1) === -4.2)
  console.assert(a.at(2) === 3.1)
  console.assert(a.at(3) === 1)
}

// Scenario: point() creates tuples with w=1
//   Given p ← point(4, -4, 3)
//   Then p = tuple(4, -4, 3, 1)
{
  const p = point(4, -4, 3)

  console.assert(p.at(3) === 1)
  console.assert(Array.isArray(p))
}

// Scenario: A tuple with w=0 is a vector
//   Given a ← tuple(4.3, -4.2, 3.1, 0.0)
//   Then a.x = 4.3
//     And a.y = -4.2
//     And a.z = 3.1
//     And a.w = 0.0
//     And a is not a point
//     And a is a vector
{
  const a = [4.3, -4.2, 3.1, 0.0]

  console.assert(a.at(0) === 4.3)
  console.assert(a.at(1) === -4.2)
  console.assert(a.at(2) === 3.1)
  console.assert(a.at(3) === 0)
}

// Scenario: vector() creates tuples with w=0
//   Given v ← vector(4, -4, 3)
//   Then v = tuple(4, -4, 3, 0)
{
  const v = vector(4, -4, 3)

  console.assert(v.at(3) === 0)
  console.assert(Array.isArray(v))
}

// Scenario: Adding two tuples
//   Given a1 ← tuple(3, -2, 5, 1)
//     And a2 ← tuple(-2, 3, 1, 0)
//    Then a1 + a2 = tuple(1, 1, 6, 1)
{
  const a1 = [3, -2, 5, 1]
  const a2 = [-2, 3, 1, 0]
  const result = add(a1, a2)
  const expect = [1, 1, 6, 1]

  console.assert(equal(result, expect))
}

// Scenario: Subtracting two points
//   Given p1 ← point(3, 2, 1)
//     And p2 ← point(5, 6, 7)
//   Then p1 - p2 = vector(-2, -4, -6)
{
  const p1 = point(3, 2, 1)
  const p2 = point(5, 6, 7)
  const result = subtract(p1, p2)
  const expect = vector(-2, -4, -6)

  console.assert(equal(result, expect))
  console.assert(result[3] === 0)
}

// Scenario: Subtracting a vector from a point
//   Given p ← point(3, 2, 1)
//     And v ← vector(5, 6, 7)
//   Then p - v = point(-2, -4, -6)
{
  const p = point(3, 2, 1)
  const v = vector(5, 6, 7)
  const result = subtract(p, v)
  const expect = point(-2, -4, -6)

  console.assert(equal(result, expect))
  console.assert(result[3] === 1)
}

// Scenario: Subtracting two vectors
//   Given v1 ← vector(3, 2, 1)
//     And v2 ← vector(5, 6, 7)
//   Then v1 - v2 = vector(-2, -4, -6)
{
  const v1 = vector(3, 2, 1)
  const v2 = vector(5, 6, 7)
  const result = subtract(v1, v2)
  const expect = vector(-2, -4, -6)

  console.assert(equal(result, expect))
  console.assert(result[3] === 0)
}

// Scenario: Subtracting a vector from the zero vector
//   Given zero ← vector(0, 0, 0)
//     And v ← vector(1, -2, 3)
//   Then zero - v = vector(-1, 2, -3)
{
  const zero = vector()
  const v = vector(1, -2, 3)
  const result = subtract(zero, v)
  const expect = vector(-1, 2, -3)

  console.assert(equal(result, expect))
}

// Scenario: Negating a tuple
//   Given a ← tuple(1, -2, 3, -4)
//   Then -a = tuple(-1, 2, -3, 4)
{
  const a = [1, -2, 3, -4]
  const result = negate(a)
  const expect = [-1, 2, -3, 4]

  console.assert(equal(result, expect))
}

// Scenario: Multiplying a tuple by a scalar
//   Given a ← tuple(1, -2, 3, -4)
//   Then a * 3.5 = tuple(3.5, -7, 10.5, -14)
{
  const a = [1, -2, 3, -4]
  const result = multiply(a, 3.5)
  const expect = [3.5, -7, 10.5, -14]

  console.assert(equal(result, expect))
}

// Scenario: Multiplying a tuple by a fraction
//   Given a ← tuple(1, -2, 3, -4)
//   Then a * 0.5 = tuple(0.5, -1, 1.5, -2)
{
  const a = [1, -2, 3, -4]
  const result = multiply(a, 0.5)
  const expect = [0.5, -1, 1.5, -2]

  console.assert(equal(result, expect))
}

// Scenario: Dividing a tuple by a scalar
//   Given a ← tuple(1, -2, 3, -4)
//   Then a / 2 = tuple(0.5, -1, 1.5, -2)
{
  const a = [1, -2, 3, -4]
  const result = divide(a, 2)
  const expect = [0.5, -1, 1.5, -2]

  console.assert(equal(result, expect))
}

// Scenario: Computing the magnitude of vector(1, 0, 0)
//   Given v ← vector(1, 0, 0)
//   Then magnitude(v) = 1
console.assert(almostequal(magnitude(vector(1, 0, 0)), 1))

// Scenario: Computing the magnitude of vector(0, 1, 0)
//   Given v ← vector(0, 1, 0)
//   Then magnitude(v) = 1
console.assert(almostequal(magnitude(vector(0, 1, 0)), 1))

// Scenario: Computing the magnitude of vector(0, 0, 1)
//   Given v ← vector(0, 0, 1)
//   Then magnitude(v) = 1
console.assert(almostequal(magnitude(vector(0, 0, 1)), 1))

// Scenario: Computing the magnitude of vector(1, 2, 3)
//   Given v ← vector(1, 2, 3)
//   Then magnitude(v) = √14
console.assert(almostequal(magnitude(vector(1, 2, 3)), Math.sqrt(14)))

// Scenario: Computing the magnitude of vector(-1, -2, -3)
//   Given v ← vector(-1, -2, -3)
//   Then magnitude(v) = √14
console.assert(almostequal(magnitude(vector(-1, -2, -3)), Math.sqrt(14)))

// Scenario: Normalizing vector(4, 0, 0) gives (1, 0, 0)
//   Given v ← vector(4, 0, 0)
//   Then normalize(v) = vector(1, 0, 0)
console.assert(equal(normalize(vector(4, 0, 0)), vector(1, 0, 0)))

// Scenario: Normalizing vector(1, 2, 3)
//   Given v ← vector(1, 2, 3)
//                                   # vector(1/√14,   2/√14,   3/√14)
//   Then normalize(v) = approximately vector(0.26726, 0.53452, 0.80178)
console.assert(
  equal(
    normalize(
      vector(1, 2, 3)
    ),
    vector(0.2672612419124244, 0.5345224838248488, 0.8017837257372732)
  )
)

// Scenario: The magnitude of a normalized vector
//   Given v ← vector(1, 2, 3)
//   When norm ← normalize(v)
//   Then magnitude(norm) = 1
console.assert(almostequal(magnitude(normalize(vector(1, 2, 3))), 1))

// Scenario: The dot product of two tuples
//   Given a ← vector(1, 2, 3)
//     And b ← vector(2, 3, 4)
//   Then dot(a, b) = 20
console.assert(almostequal(dot(vector(1, 2, 3), vector(2, 3, 4)), 20))

// Scenario: The cross product of two vectors
//   Given a ← vector(1, 2, 3)
//     And b ← vector(2, 3, 4)
//   Then cross(a, b) = vector(-1, 2, -1)
//     And cross(b, a) = vector(1, -2, 1)
console.assert(equal(cross(vector(1, 2, 3), vector(2, 3, 4)), vector(-1, 2, -1)))
console.assert(equal(cross(vector(2, 3, 4), vector(1, 2, 3)), vector(1, -2, 1)))

// Scenario: Colors are (red, green, blue) tuples
//   Given c ← color(-0.5, 0.4, 1.7)
//   Then c.red = -0.5
//     And c.green = 0.4
//     And c.blue = 1.7
{
  const c = color(-0.5, 0.4, 1.7)

  console.assert(almostequal(c.at(0), -0.5))
  console.assert(almostequal(c.at(1), 0.4))
  console.assert(almostequal(c.at(2), 1.7))
}

// Scenario: Adding colors
//   Given c1 ← color(0.9, 0.6, 0.75)
//     And c2 ← color(0.7, 0.1, 0.25)
//    Then c1 + c2 = color(1.6, 0.7, 1.0)
{
  const c1 = color(0.9, 0.6, 0.75)
  const c2 = color(0.7, 0.1, 0.25)
  const result = add(c1, c2)
  const expect = color(1.6, 0.7, 1.0)

  console.assert(equal(result, expect))
}

// Scenario: Subtracting colors
//   Given c1 ← color(0.9, 0.6, 0.75)
//     And c2 ← color(0.7, 0.1, 0.25)
//    Then c1 - c2 = color(0.2, 0.5, 0.5)
{
  const c1 = color(0.9, 0.6, 0.75)
  const c2 = color(0.7, 0.1, 0.25)
  const result = subtract(c1, c2)
  const expect = color(0.2, 0.5, 0.5)

  console.assert(equal(result, expect))
}

// Scenario: Multiplying colors
//   Given c1 ← color(1, 0.2, 0.4)
//     And c2 ← color(0.9, 1, 0.1)
//    Then c1 * c2 = color(0.9, 0.2, 0.04)
{
  const c1 = color(1, 0.2, 0.4)
  const c2 = color(0.9, 1, 0.1)
  const result = multiply(c1, c2)
  const expect = color(0.9, 0.2, 0.04)

  console.assert(equal(result, expect))
}

// Scenario: Multiplying a color by a scalar
//   Given c ← color(0.2, 0.3, 0.4)
//   Then c * 2 = color(0.4, 0.6, 0.8)
{
  const c = color(0.2, 0.3, 0.4)
  const result = multiply(c, 2)
  const expect = color(0.4, 0.6, 0.8)

  console.assert(equal(result, expect))
}

// Scenario: Reflecting a vector approaching at 45°
//   Given v ← vector(1, -1, 0)
//     And n ← vector(0, 1, 0)
//   When r ← reflect(v, n)
//   Then r = vector(1, 1, 0)
{
  const v = vector(1, -1, 0)
  const n = vector(0, 1, 0)
  const r = reflect(v, n)

  console.assert(equal(r, vector(1, 1, 0)))
}

// Scenario: Reflecting a vector off a slanted surface
//   Given v ← vector(0, -1, 0)
//     And n ← vector(√2/2, √2/2, 0)
//   When r ← reflect(v, n)
//   Then r = vector(1, 0, 0)
{
  const v = vector(0, -1, 0)
  const k = Math.sqrt(2) / 2
  const n = vector(k, k, 0)
  const r = reflect(v, n)
    .map(v => parseFloat(v.toFixed(5)))

  console.assert(equal(r, vector(1, 0, 0)))
}
