import { equal, vector, point } from "./tuple.js"
import { ray } from "./ray.js"
import { cube } from "./cube.js"

// Feature: Cubes

// Scenario Outline: A ray intersects a cube
//   Given c ← cube()
//     And r ← ray(<origin>, <direction>)
//   When xs ← local_intersect(c, r)
//   Then xs.count = 2
//     And xs[0].t = <t1>
//     And xs[1].t = <t2>
//
//   Examples:
//     |        | origin            | direction        | t1 | t2 |
//     | +x     | point(5, 0.5, 0)  | vector(-1, 0, 0) |  4 |  6 |
//     | -x     | point(-5, 0.5, 0) | vector(1, 0, 0)  |  4 |  6 |
//     | +y     | point(0.5, 5, 0)  | vector(0, -1, 0) |  4 |  6 |
//     | -y     | point(0.5, -5, 0) | vector(0, 1, 0)  |  4 |  6 |
//     | +z     | point(0.5, 0, 5)  | vector(0, 0, -1) |  4 |  6 |
//     | -z     | point(0.5, 0, -5) | vector(0, 0, 1)  |  4 |  6 |
//     | inside | point(0, 0.5, 0)  | vector(0, 0, 1)  | -1 |  1 |
{
  const table = [
    { origin: point(5, 0.5, 0), direction: vector(-1, 0, 0), t1: 4, t2: 6 },
    { origin: point(-5, 0.5, 0), direction: vector(1, 0, 0), t1: 4, t2: 6 },
    { origin: point(0.5, 5, 0), direction: vector(0, -1, 0), t1: 4, t2: 6 },
    { origin: point(0.5, -5, 0), direction: vector(0, 1, 0), t1: 4, t2: 6 },
    { origin: point(0.5, 0, 5), direction: vector(0, 0, -1), t1: 4, t2: 6 },
    { origin: point(0.5, 0, -5), direction: vector(0, 0, 1), t1: 4, t2: 6 },
    { origin: point(0, 0.5, 0), direction: vector(0, 0, 1), t1: -1, t2: 1 },
  ]

  table.forEach(({ origin, direction, t1, t2 }) => {
    const c = cube()
    const r = ray(origin, direction)
    const x = c.intersect(c, r)

    console.assert(x.length === 2)
    console.assert(x[0].t === t1)
    console.assert(x[1].t === t2)
  })
}

// Scenario Outline: A ray misses a cube
//   Given c ← cube()
//     And r ← ray(<origin>, <direction>)
//   When xs ← local_intersect(c, r)
//   Then xs.count = 0
//
//   Examples:
//     | origin           | direction                      |
//     | point(-2, 0, 0)  | vector(0.2673, 0.5345, 0.8018) |
//     | point(0, -2, 0)  | vector(0.8018, 0.2673, 0.5345) |
//     | point(0, 0, -2)  | vector(0.5345, 0.8018, 0.2673) |
//     | point(2, 0, 2)   | vector(0, 0, -1)               |
//     | point(0, 2, 2)   | vector(0, -1, 0)               |
//     | point(2, 2, 0)   | vector(-1, 0, 0)               |
{
  const table = [
    { origin: point(-2, 0, 0), direction: vector(0.2673, 0.5345, 0.8018) },
    { origin: point(0, -2, 0), direction: vector(0.8018, 0.2673, 0.5345) },
    { origin: point(0, 0, -2), direction: vector(0.5345, 0.8018, 0.2673) },
    { origin: point(2, 0, 2), direction: vector(0, 0, -1) },
    { origin: point(0, 2, 2), direction: vector(0, -1, 0) },
    { origin: point(2, 2, 0), direction: vector(-1, 0, 0) },
  ]

  table.forEach(({ origin, direction }) => {
    const c = cube()
    const r = ray(origin, direction)
    const x = c.intersect(c, r)

    console.assert(x.length === 0)
  })
}

// Scenario Outline: The normal on the surface of a cube
//   Given c ← cube()
//     And p ← <point>
//   When normal ← local_normal_at(c, p)
//   Then normal = <normal>
//
//   Examples:
//     | point                | normal           |
//     | point(1, 0.5, -0.8)  | vector(1, 0, 0)  |
//     | point(-1, -0.2, 0.9) | vector(-1, 0, 0) |
//     | point(-0.4, 1, -0.1) | vector(0, 1, 0)  |
//     | point(0.3, -1, -0.7) | vector(0, -1, 0) |
//     | point(-0.6, 0.3, 1)  | vector(0, 0, 1)  |
//     | point(0.4, 0.4, -1)  | vector(0, 0, -1) |
//     | point(1, 1, 1)       | vector(1, 0, 0)  |
//     | point(-1, -1, -1)    | vector(-1, 0, 0) |
{
  const table = [
    { point: point(1, 0.5, -0.8), normal: vector(1, 0, 0)  },
    { point: point(-1, -0.2, 0.9), normal: vector(-1, 0, 0) },
    { point: point(-0.4, 1, -0.1), normal: vector(0, 1, 0)  },
    { point: point(0.3, -1, -0.7), normal: vector(0, -1, 0) },
    { point: point(-0.6, 0.3, 1), normal: vector(0, 0, 1)  },
    { point: point(0.4, 0.4, -1), normal: vector(0, 0, -1) },
    { point: point(1, 1, 1), normal: vector(1, 0, 0)  },
    { point: point(-1, -1, -1), normal: vector(-1, 0, 0) },
  ]

  table.forEach(({ point: p, normal }) => {
    const c = cube()
    const n = c.normal(c, p)

    console.assert(equal(n, normal))
  })
}
