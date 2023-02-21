import { equal, point, vector, normalize } from "./tuple.js"
import { ray } from "./ray.js"
import { cone, normal } from "./cone.js"

// Feature: Cones

// Scenario Outline: Intersecting a cone with a ray
//   Given shape ← cone()
//     And direction ← normalize(<direction>)
//     And r ← ray(<origin>, direction)
//   When xs ← local_intersect(shape, r)
//   Then xs.count = 2
//     And xs[0].t = <t0>
//     And xs[1].t = <t1>
//
//   Examples:
//     | origin          | direction           | t0      | t1       |
//     | point(0, 0, -5) | vector(0, 0, 1)     | 5       |  5       |
//     | point(0, 0, -5) | vector(1, 1, 1)     | 8.66025 |  8.66025 |
//     | point(1, 1, -5) | vector(-0.5, -1, 1) | 4.55006 | 49.44994 |
{
  const table = [
    { origin: point(0, 0, -5), direction: vector(0, 0, 1), t1: 5, t2: 5 },
    { origin: point(0, 0, -5), direction: vector(1, 1, 1), t1: 8.66025, t2: 8.66025 },
    { origin: point(1, 1, -5), direction: vector(-0.5, -1, 1), t1: 4.55006, t2: 49.44994 },
  ]

  table.forEach(({ origin, direction, t1, t2 }) => {
    const c = cone()
    const d = normalize(direction)
    const r = ray(origin, d)
    const x = c.intersect(c, r)

    console.assert(x.length === 2)
    console.assert(parseFloat(x[0]?.t?.toFixed(5)) === t1)
    console.assert(parseFloat(x[1]?.t?.toFixed(5)) === t2)
  })
}

// Scenario: Intersecting a cone with a ray parallel to one of its halves
//   Given shape ← cone()
//     And direction ← normalize(vector(0, 1, 1))
//     And r ← ray(point(0, 0, -1), direction)
//   When xs ← local_intersect(shape, r)
//   Then xs.count = 1
//     And xs[0].t = 0.35355
//
{
  const c = cone()
  const d = normalize(vector(0, 1, 1))
  const r = ray(point(0, 0, -1), d)
  const x = c.intersect(c, r)

  console.assert(x.length === 1)
  console.assert(parseFloat(x[0]?.t?.toFixed(5)) === 0.35355)
}

// Scenario Outline: Intersecting a cone's end caps
//   Given shape ← cone()
//     And shape.minimum ← -0.5
//     And shape.maximum ← 0.5
//     And shape.closed ← true
//     And direction ← normalize(<direction>)
//     And r ← ray(<origin>, direction)
//   When xs ← local_intersect(shape, r)
//   Then xs.count = <count>
//
//   Examples:
//     | origin             | direction       | count |
//     | point(0, 0, -5)    | vector(0, 1, 0) | 0     |
//     | point(0, 0, -0.25) | vector(0, 1, 1) | 2     |
//     | point(0, 0, -0.25) | vector(0, 1, 0) | 4     |
{
  const table = [
    { point: point(0, 0, -5), direction: vector(0, 1, 0), count: 0 },
    { point: point(0, 0, -0.25), direction: vector(0, 1, 1), count: 2 },
    { point: point(0, 0, -0.25), direction: vector(0, 1, 0), count: 4 },
  ]

  table.forEach(({ point: p, direction, count }) => {
    const c = cone()

    c.open = false
    c.minimum = -0.5
    c.maximum = 0.5

    const d = normalize(direction)
    const r = ray(p, d)
    const x = c.intersect(c, r)

    console.assert(x.length === count)
  })
}

// Scenario Outline: Computing the normal vector on a cone
//   Given shape ← cone()
//   When n ← local_normal_at(shape, <point>)
//   Then n = <normal>
//
//   Examples:
//     | point             | normal                 |
//     | point(0, 0, 0)    | vector(0, 0, 0)        |
//     | point(1, 1, 1)    | vector(1, -√2, 1)      |
//     | point(-1, -1, 0)  | vector(-1, 1, 0)       |
{
  const table = [
    { point: point(0, 0, 0), normal: vector(0, 0, 0) },
    { point: point(1, 1, 1), normal: vector(1, -Math.sqrt(2), 1) },
    { point: point(-1, -1, 0), normal: vector(-1, 1, 0) },
  ]

  table.forEach((o) => {
    console.assert(equal(normal(cone(), o.point), o.normal))
  })
}
