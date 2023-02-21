import { equal, point, vector, normalize } from "./tuple.js"
import { ray } from "./ray.js"
import { cylinder } from "./cylinder.js"

// Feature: Cylinders

// Scenario Outline: A ray misses a cylinder
//   Given cyl ← cylinder()
//     And direction ← normalize(<direction>)
//     And r ← ray(<origin>, direction)
//   When xs ← local_intersect(cyl, r)
//   Then xs.count = 0
//
//   Examples:
//     | origin          | direction       |
//     | point(1, 0, 0)  | vector(0, 1, 0) |
//     | point(0, 0, 0)  | vector(0, 1, 0) |
//     | point(0, 0, -5) | vector(1, 1, 1) |
{
  const table = [
    { origin: point(1, 0, 0), direction: vector(0, 1, 0) },
    { origin: point(0, 0, 0), direction: vector(0, 1, 0) },
    { origin: point(0, 0, -5), direction: vector(1, 1, 1) },
  ]

  table.forEach(({ origin, direction }) => {
    const c = cylinder()
    const d = normalize(direction)
    const r = ray(origin, d)
    const x = c.intersect(c, r)

    console.assert(x.length === 0)
  })
}

// Scenario Outline: A ray strikes a cylinder
//   Given cyl ← cylinder()
//     And direction ← normalize(<direction>)
//     And r ← ray(<origin>, direction)
//   When xs ← local_intersect(cyl, r)
//   Then xs.count = 2
//     And xs[0].t = <t0>
//     And xs[1].t = <t1>
//
//   Examples:
//     | origin            | direction         | t0      | t1      |
//     | point(1, 0, -5)   | vector(0, 0, 1)   | 5       | 5       |
//     | point(0, 0, -5)   | vector(0, 0, 1)   | 4       | 6       |
//     | point(0.5, 0, -5) | vector(0.1, 1, 1) | 6.80798 | 7.08872 |
{
  const table = [
    { origin: point(1, 0, -5), direction: vector(0, 0, 1), t1: 5, t2: 5 },
    { origin: point(0, 0, -5), direction: vector(0, 0, 1), t1: 4, t2: 6 },
    { origin: point(0.5, 0, -5), direction: vector(0.1, 1, 1), t1: 6.80798, t2: 7.08872 },
  ]

  table.forEach(({ origin, direction, t1, t2 }) => {
    const c = cylinder()
    const d = normalize(direction)
    const r = ray(origin, d)
    const x = c.intersect(c, r)

    console.assert(x.length === 2)
    console.assert(parseFloat(x[0]?.t?.toFixed(5)) === t1)
    console.assert(parseFloat(x[1]?.t?.toFixed(5)) === t2)
  })
}

// Scenario Outline: Normal vector on a cylinder
//   Given cyl ← cylinder()
//   When n ← local_normal_at(cyl, <point>)
//   Then n = <normal>
//
//   Examples:
//     | point           | normal           |
//     | point(1, 0, 0)  | vector(1, 0, 0)  |
//     | point(0, 5, -1) | vector(0, 0, -1) |
//     | point(0, -2, 1) | vector(0, 0, 1)  |
//     | point(-1, 1, 0) | vector(-1, 0, 0) |
{
  const table = [
    { point: point(1, 0, 0), normal: vector(1, 0, 0) },
    { point: point(0, 5, -1), normal: vector(0, 0, -1) },
    { point: point(0, -2, 1), normal: vector(0, 0, 1) },
    { point: point(-1, 1, 0), normal: vector(-1, 0, 0) },
  ]

  table.forEach(({ point: p, normal }) => {
    const c = cylinder()
    const n = c.normal(c, p)

    console.assert(equal(n, normal))
  })
}

// Scenario: The default minimum and maximum for a cylinder
//   Given cyl ← cylinder()
//   Then cyl.minimum = -infinity
//     And cyl.maximum = infinity
{
  const c = cylinder()

  console.assert(c.minimum === -self.Infinity)
  console.assert(c.maximum === self.Infinity)
}

// Scenario Outline: Intersecting a constrained cylinder
//   Given cyl ← cylinder()
//     And cyl.minimum ← 1
//     And cyl.maximum ← 2
//     And direction ← normalize(<direction>)
//     And r ← ray(<point>, direction)
//   When xs ← local_intersect(cyl, r)
//   Then xs.count = <count>
//
//   Examples:
//     |   | point             | direction         | count |
//     | 1 | point(0, 1.5, 0)  | vector(0.1, 1, 0) | 0     |
//     | 2 | point(0, 3, -5)   | vector(0, 0, 1)   | 0     |
//     | 3 | point(0, 0, -5)   | vector(0, 0, 1)   | 0     |
//     | 4 | point(0, 2, -5)   | vector(0, 0, 1)   | 0     |
//     | 5 | point(0, 1, -5)   | vector(0, 0, 1)   | 0     |
//     | 6 | point(0, 1.5, -2) | vector(0, 0, 1)   | 2     |
{
  const table = [
    { point: point(0, 1.5, 0), direction: vector(0.1, 1, 0), count: 0 },
    { point: point(0, 3, -5), direction: vector(0, 0, 1), count: 0 },
    { point: point(0, 0, -5), direction: vector(0, 0, 1), count: 0 },
    { point: point(0, 2, -5), direction: vector(0, 0, 1), count: 0 },
    { point: point(0, 1, -5), direction: vector(0, 0, 1), count: 0 },
    { point: point(0, 1.5, -2), direction: vector(0, 0, 1), count: 2 },
  ]

  table.forEach(({ point: p, direction, count }) => {
    const c = cylinder()

    c.minimum = 1
    c.maximum = 2

    const d = normalize(direction)
    const r = ray(p, d)
    const x = c.intersect(c, r)

    console.assert(x.length === count)
  })
}

// Scenario: The default closed value for a cylinder
//   Given cyl ← cylinder()
//   Then cyl.closed = false
{
  const c = cylinder()

  console.assert(!c.closed)
}

// Scenario Outline: Intersecting the caps of a closed cylinder
//   Given cyl ← cylinder()
//     And cyl.minimum ← 1
//     And cyl.maximum ← 2
//     And cyl.closed ← true
//     And direction ← normalize(<direction>)
//     And r ← ray(<point>, direction)
//   When xs ← local_intersect(cyl, r)
//   Then xs.count = <count>
//
//   Examples:
//     |   | point            | direction        | count |
//     | 1 | point(0, 3, 0)   | vector(0, -1, 0) | 2     |
//     | 2 | point(0, 3, -2)  | vector(0, -1, 2) | 2     |
//     | 3 | point(0, 4, -2)  | vector(0, -1, 1) | 2     | # corner case
//     | 4 | point(0, 0, -2)  | vector(0, 1, 2)  | 2     |
//     | 5 | point(0, -1, -2) | vector(0, 1, 1)  | 2     | # corner case
{
  const table = [
    { point: point(0, 3, 0), direction: vector(0, -1, 0), count: 0 },
    { point: point(0, 3, -2), direction: vector(0, -1, 2), count: 2 },
    { point: point(0, 4, -2), direction: vector(0, -1, 1), count: 2 },
    { point: point(0, 0, -2), direction: vector(0, 1, 2), count: 2 },
    { point: point(0, -1, -2), direction: vector(0, 1, 1), count: 2 },
  ]

  table.forEach(({ point: p, direction, count }) => {
    const c = cylinder()

    c.open = false
    c.minimum = 1
    c.maximum = 2

    const d = normalize(direction)
    const r = ray(p, d)
    const x = c.intersect(c, r)

    console.assert(x.length === count)
  })
}

// Scenario Outline: The normal vector on a cylinder's end caps
//   Given cyl ← cylinder()
//     And cyl.minimum ← 1
//     And cyl.maximum ← 2
//     And cyl.closed ← true
//   When n ← local_normal_at(cyl, <point>)
//   Then n = <normal>
//
//   Examples:
//     | point            | normal           |
//     | point(0, 1, 0)   | vector(0, -1, 0) |
//     | point(0.5, 1, 0) | vector(0, -1, 0) |
//     | point(0, 1, 0.5) | vector(0, -1, 0) |
//     | point(0, 2, 0)   | vector(0, 1, 0)  |
//     | point(0.5, 2, 0) | vector(0, 1, 0)  |
//     | point(0, 2, 0.5) | vector(0, 1, 0)  |
{
  const table = [
    { point: point(0, 1, 0), normal: vector(0, -1, 0) },
    { point: point(0.5, 1, 0), normal: vector(0, -1, 0) },
    { point: point(0, 1, 0.5), normal: vector(0, -1, 0) },
    { point: point(0, 2, 0), normal: vector(0, 1, 0) },
    { point: point(0.5, 2, 0), normal: vector(0, 1, 0) },
    { point: point(0, 2, 0.5), normal: vector(0, 1, 0) },
  ]

  table.forEach(({ point: p, normal }) => {
    const c = cylinder()

    c.minimum = 1
    c.maximum = 2
    c.open = false

    const n = c.normal(c, p)

    console.assert(equal(n, normal))
  })
}
