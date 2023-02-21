import { schlick, intersection, hit, intersections, prepare } from "./intersection.js"
import { point, vector, equal, round } from "./tuple.js"
import { triangle } from "./triangle.js"
import { sphere, glass } from "./sphere.js"
import { ray } from "./ray.js"
import { almostequal } from "./helper.js"
import { translation, scaling } from "./matrix.js"
import { plane } from "./plane.js"

// Feature: Intersections

// Scenario: An intersection encapsulates t and object
//   Given s ← sphere()
//   When i ← intersection(3.5, s)
//   Then i.t = 3.5
//     And i.object = s
{
  const s = sphere()
  const i = intersection(3.5, s)

  console.assert(i.t === 3.5)
  console.assert(Object.is(i.object, s))
}

// Scenario: Aggregating intersections
//   Given s ← sphere()
//     And i1 ← intersection(1, s)
//     And i2 ← intersection(2, s)
//   When xs ← intersections(i1, i2)
//   Then xs.count = 2
//     And xs[0].t = 1
//     And xs[1].t = 2
{
  const s = sphere()
  const i1 = intersection(1, s)
  const i2 = intersection(2, s)
  const xs = intersections(i1, i2)

  console.assert(xs.length === 2)
  console.assert(xs[0].t === 1)
  console.assert(xs[1].t === 2)
}

// Scenario: The hit, when all intersections have positive t
//   Given s ← sphere()
//     And i1 ← intersection(1, s)
//     And i2 ← intersection(2, s)
//     And xs ← intersections(i2, i1)
//   When i ← hit(xs)
//   Then i = i1
{
  const s = sphere()
  const i1 = intersection(1, s)
  const i2 = intersection(2, s)
  const xs = intersections(i2, i1)
  const i = hit(xs)

  console.assert(i === i1)
}

// Scenario: The hit, when some intersections have negative t
//   Given s ← sphere()
//     And i1 ← intersection(-1, s)
//     And i2 ← intersection(1, s)
//     And xs ← intersections(i2, i1)
//   When i ← hit(xs)
//   Then i = i2
{
  const s = sphere()
  const i1 = intersection(-1, s)
  const i2 = intersection(1, s)
  const xs = intersections(i2, i1)
  const i = hit(xs)

  console.assert(i === i2)
}

// Scenario: The hit, when all intersections have negative t
//   Given s ← sphere()
//     And i1 ← intersection(-2, s)
//     And i2 ← intersection(-1, s)
//     And xs ← intersections(i2, i1)
//   When i ← hit(xs)
//   Then i is nothing
{
  const s = sphere()
  const i1 = intersection(-2, s)
  const i2 = intersection(-1, s)
  const xs = intersections(i2, i1)
  const i = hit(xs)

  console.assert(i === undefined)
}

// Scenario: The hit is always the lowest nonnegative intersection
//   Given s ← sphere()
//     And i1 ← intersection(5, s)
//     And i2 ← intersection(7, s)
//     And i3 ← intersection(-3, s)
//     And i4 ← intersection(2, s)
//     And xs ← intersections(i1, i2, i3, i4)
//   When i ← hit(xs)
//   Then i = i4
{
  const s = sphere()
  const i1 = intersection(5, s)
  const i2 = intersection(7, s)
  const i3 = intersection(-3, s)
  const i4 = intersection(2, s)
  const xs = intersections(i1, i2, i3, i4)
  const i = hit(xs)

  console.assert(i === i4)
}

// Scenario: Precomputing the state of an intersection
//   Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And shape ← sphere()
//     And i ← intersection(4, shape)
//   When comps ← prepare_computations(i, r)
//   Then comps.t = i.t
//     And comps.object = i.object
//     And comps.point = point(0, 0, -1)
//     And comps.eyev = vector(0, 0, -1)
//     And comps.normalv = vector(0, 0, -1)
{
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const s = sphere()
  const i = intersection(4, s)
  const c = prepare(i, r)

  console.assert(Object.is(c.object, i.object))
  console.assert(equal(c.point, point(0, 0, -1)))
  console.assert(equal(c.eye, vector(0, 0, -1)))
  console.assert(equal(c.normal, vector(0, 0, -1)))
}

// Scenario: The hit, when an intersection occurs on the inside
//   Given r ← ray(point(0, 0, 0), vector(0, 0, 1))
//     And shape ← sphere()
//     And i ← intersection(1, shape)
//   When comps ← prepare_computations(i, r)
//   Then comps.point = point(0, 0, 1)
//     And comps.eyev = vector(0, 0, -1)
//     And comps.inside = true
//       # normal would have been (0, 0, 1), but is inverted!
//     And comps.normalv = vector(0, 0, -1)
{
  const r = ray(point(), vector(0, 0, 1))
  const s = sphere()
  const i = intersection(1, s)
  const c = prepare(i, r)

  console.assert(equal(c.point, point(0, 0, 1)))
  console.assert(equal(c.eye, vector(0, 0, -1)))
  console.assert(c.inside)
  console.assert(equal(c.normal, vector(0, 0, -1)))
}

// Scenario: The hit should offset the point
//   Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And shape ← sphere() with:
//       | transform | translation(0, 0, 1) |
//     And i ← intersection(5, shape)
//   When comps ← prepare_computations(i, r)
//   Then comps.over_point.z < -EPSILON/2
//     And comps.point.z > comps.over_point.z
{
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const s = sphere()

  s.transform = translation(0, 0, 1)

  const i = intersection(5, s)
  const c = prepare(i, r)

  console.assert(c.overpoint[2] < -Number.EPSILON / 2)
  console.assert(c.point[2] > c.overpoint[2])
}

// Scenario: Precomputing the reflection vector
//   Given shape ← plane()
//     And r ← ray(point(0, 1, -1), vector(0, -√2/2, √2/2))
//     And i ← intersection(√2, shape)
//   When comps ← prepare_computations(i, r)
//   Then comps.reflectv = vector(0, √2/2, √2/2)
{
  const s = plane()

  const k = Math.sqrt(2) / 2
  const r = ray(point(0, 1, -1), vector(0, -k, k))
  const i = intersection(Math.sqrt(2), s)
  const c = prepare(i, r)

  console.assert(equal(round(c.reflect), round(vector(0, k, k))))
}

// Scenario Outline: Finding n1 and n2 at various intersections
//   Given A ← glass_sphere() with:
//       | transform                 | scaling(2, 2, 2) |
//       | material.refractive_index | 1.5              |
//     And B ← glass_sphere() with:
//       | transform                 | translation(0, 0, -0.25) |
//       | material.refractive_index | 2.0                      |
//     And C ← glass_sphere() with:
//       | transform                 | translation(0, 0, 0.25) |
//       | material.refractive_index | 2.5                     |
//     And r ← ray(point(0, 0, -4), vector(0, 0, 1))
//     And xs ← intersections(2:A, 2.75:B, 3.25:C, 4.75:B, 5.25:C, 6:A)
//   When comps ← prepare_computations(xs[<index>], r, xs)
//   Then comps.n1 = <n1>
//     And comps.n2 = <n2>
//
//   Examples:
//     | index | n1  | n2  |
//     | 0     | 1.0 | 1.5 |
//     | 1     | 1.5 | 2.0 |
//     | 2     | 2.0 | 2.5 |
//     | 3     | 2.5 | 2.5 |
//     | 4     | 2.5 | 1.5 |
//     | 5     | 1.5 | 1.0 |
{
  const a = glass()

  a.transform = scaling(2, 2, 2)
  a.material.refractive = 1.5

  const b = glass()

  b.transform = translation(0, 0, -0.25)
  b.material.refractive = 2

  const c = glass()

  c.transform = translation(0, 0, 0.25)
  c.material.refractive = 2.5

  const r = ray(point(0, 0, -4), vector(0, 0, 1))
  const x = intersections(
    intersection(2, a),
    intersection(2.75, b),
    intersection(3.25, c),
    intersection(4.75, b),
    intersection(5.25, c),
    intersection(6, a),
  )

  const table = [
    { n1: 1, n2: 1.5 },
    { n1: 1.5, n2: 2 },
    { n1: 2, n2: 2.5 },
    { n1: 2.5, n2: 2.5 },
    { n1: 2.5, n2: 1.5 },
    { n1: 1.5, n2: 1 },
  ]

  table.forEach((o, i) => {
    const k = prepare(x[i], r, x)

    console.assert(k.n1 === o.n1)
    console.assert(k.n2 === o.n2)
  })
}

// Scenario: The under point is offset below the surface
//   Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And shape ← glass_sphere() with:
//       | transform | translation(0, 0, 1) |
//     And i ← intersection(5, shape)
//     And xs ← intersections(i)
//   When comps ← prepare_computations(i, r, xs)
//   Then comps.under_point.z > EPSILON/2
//     And comps.point.z < comps.under_point.z
{
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const s = glass()

  s.transform = translation(0, 0, 1)

  const i = intersection(5, s)
  const k = prepare(i, r, intersections(i))

  console.assert(k.underpoint[2] > Number.EPSILON / 2)
  console.assert(k.point[2] < k.underpoint[2])
}

// Scenario: The Schlick approximation under total internal reflection
//   Given shape ← glass_sphere()
//     And r ← ray(point(0, 0, √2/2), vector(0, 1, 0))
//     And xs ← intersections(-√2/2:shape, √2/2:shape)
//   When comps ← prepare_computations(xs[1], r, xs)
//     And reflectance ← schlick(comps)
//   Then reflectance = 1.0
{
  const s = glass()
  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, q), vector(0, 1, 0))
  const x = intersections(intersection(-q, s), intersection(q, s))
  const k = prepare(x[1], r, x)
  const reflectance = schlick(k)

  console.assert(reflectance === 1)
}

// Scenario: The Schlick approximation with a perpendicular viewing angle
//   Given shape ← glass_sphere()
//     And r ← ray(point(0, 0, 0), vector(0, 1, 0))
//     And xs ← intersections(-1:shape, 1:shape)
//   When comps ← prepare_computations(xs[1], r, xs)
//     And reflectance ← schlick(comps)
//   Then reflectance = 0.04
{
  const s = glass()
  const r = ray(point(0, 0, 0), vector(0, 1, 0))
  const x = intersections(intersection(-1, s), intersection(1, s))
  const k = prepare(x[1], r, x)
  const reflectance = schlick(k)

  console.assert(almostequal(reflectance, 0.04))
}

// Scenario: The Schlick approximation with small angle and n2 > n1
//   Given shape ← glass_sphere()
//     And r ← ray(point(0, 0.99, -2), vector(0, 0, 1))
//     And xs ← intersections(1.8589:shape)
//   When comps ← prepare_computations(xs[0], r, xs)
//     And reflectance ← schlick(comps)
//   Then reflectance = 0.48873
{
  const s = glass()
  const r = ray(point(0, 0.99, -2), vector(0, 0, 1))
  const x = intersections(intersection(1.8589, s))
  const k = prepare(x[0], r, x)
  const reflectance = schlick(k)

  console.assert(almostequal(reflectance, 0.48873, 10 ** 10))
}

// Scenario: An intersection can encapsulate `u` and `v`
//   Given s ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//   When i ← intersection_with_uv(3.5, s, 0.2, 0.4)
//   Then i.u = 0.2
//     And i.v = 0.4
{
  const s = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const i = intersection(3.5, s, 0.2, 0.4)

  console.assert(i.u === 0.2)
  console.assert(i.v === 0.4)
}
