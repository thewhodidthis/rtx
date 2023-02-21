import { sphere } from "./sphere.js"
import { intersection, intersections } from "./intersection.js"
import { translation } from "./matrix.js"
import { cube } from "./cube.js"
import { point, vector } from "./tuple.js"
import { ray } from "./ray.js"
import { csg, union, filter, allowed, intersect } from "./csg.js"

// Feature: Constructive Solid Geometry (CSG)

// Scenario: CSG is created with an operation and two shapes
//   Given s1 ← sphere()
//     And s2 ← cube()
//   When c ← csg("union", s1, s2)
//   Then c.operation = "union"
//     And c.left = s1
//     And c.right = s2
//     And s1.parent = c
//     And s2.parent = c
{
  const s1 = sphere()
  const s2 = cube()
  const c = union(s1, s2)

  console.assert(c.operation === "union")
  console.assert(Object.is(c.l, s1))
  console.assert(Object.is(c.r, s2))
  console.assert(Object.is(s1.parent, c))
  console.assert(Object.is(s2.parent, c))
}

// Scenario Outline: Evaluating the rule for a CSG operation
//   When result ← intersection_allowed("<op>", <lhit>, <inl>, <inr>)
//   Then result = <result>
//
//   Examples:
//   | op           | lhit  | inl   | inr   | result |
//   | union        | true  | true  | true  | false  |
//   | union        | true  | true  | false | true   |
//   | union        | true  | false | true  | false  |
//   | union        | true  | false | false | true   |
//   | union        | false | true  | true  | false  |
//   | union        | false | true  | false | false  |
//   | union        | false | false | true  | true   |
//   | union        | false | false | false | true   |
//   # append after the union examples...
//   | intersection | true  | true  | true  | true   |
//   | intersection | true  | true  | false | false  |
//   | intersection | true  | false | true  | true   |
//   | intersection | true  | false | false | false  |
//   | intersection | false | true  | true  | true   |
//   | intersection | false | true  | false | true   |
//   | intersection | false | false | true  | false  |
//   | intersection | false | false | false | false  |
//   # append after the intersection examples...
//   | difference   | true  | true  | true  | false  |
//   | difference   | true  | true  | false | true   |
//   | difference   | true  | false | true  | false  |
//   | difference   | true  | false | false | true   |
//   | difference   | false | true  | true  | true   |
//   | difference   | false | true  | false | true   |
//   | difference   | false | false | true  | false  |
//   | difference   | false | false | false | false  |
{
  const table = [
    { op: "intersection", hit: true, inl: true, inr: true, result: true },
    { op: "intersection", hit: true, inl: true, inr: false, result: false },
    { op: "intersection", hit: true, inl: false, inr: true, result: true },
    { op: "intersection", hit: true, inl: false, inr: false, result: false },
    { op: "intersection", hit: false, inl: true, inr: true, result: true },
    { op: "intersection", hit: false, inl: true, inr: false, result: true },
    { op: "intersection", hit: false, inl: false, inr: true, result: false },
    { op: "intersection", hit: false, inl: false, inr: false, result: false },
    { op: "union", hit: true, inl: true, inr: true, result: false },
    { op: "union", hit: true, inl: true, inr: false, result: true },
    { op: "union", hit: true, inl: false, inr: true, result: false },
    { op: "union", hit: true, inl: false, inr: false, result: true },
    { op: "union", hit: false, inl: true, inr: true, result: false },
    { op: "union", hit: false, inl: true, inr: false, result: false },
    { op: "union", hit: false, inl: false, inr: true, result: true },
    { op: "union", hit: false, inl: false, inr: false, result: true },
    { op: "difference", hit: true, inl: true, inr: true, result: false },
    { op: "difference", hit: true, inl: true, inr: false, result: true },
    { op: "difference", hit: true, inl: false, inr: true, result: false },
    { op: "difference", hit: true, inl: false, inr: false, result: true },
    { op: "difference", hit: false, inl: true, inr: true, result: true },
    { op: "difference", hit: false, inl: true, inr: false, result: true },
    { op: "difference", hit: false, inl: false, inr: true, result: false },
    { op: "difference", hit: false, inl: false, inr: false, result: false },
  ]

  table.forEach(({ op, hit, inl, inr, result }) => {
    const x = allowed(op, hit, inl, inr)

    console.assert(x === result)
  })
}

// Scenario Outline: Filtering a list of intersections
//   Given s1 ← sphere()
//     And s2 ← cube()
//     And c ← csg("<operation>", s1, s2)
//     And xs ← intersections(1:s1, 2:s2, 3:s1, 4:s2)
//   When result ← filter_intersections(c, xs)
//   Then result.count = 2
//     And result[0] = xs[<x0>]
//     And result[1] = xs[<x1>]
//
//   Examples:
//   | operation    | x0 | x1 |
//   | union        | 0  | 3  |
//   | intersection | 1  | 2  |
//   | difference   | 0  | 1  |
{
  const s1 = sphere()
  const s2 = cube()

  const xs = intersections(
    intersection(1, s1),
    intersection(2, s2),
    intersection(3, s1),
    intersection(4, s2),
  )

  const table = [
    { op: "intersection", x0: 1, x1: 2 },
    { op: "union", x0: 0, x1: 3 },
    { op: "difference", x0: 0, x1: 1 },
  ]

  table.forEach(({ op, x0, x1 }) => {
    const result = filter(csg(op, s1, s2), xs)

    console.assert(result.length === 2)
    console.assert(result[0] === xs[x0])
    console.assert(result[1] === xs[x1])
  })
}

// Scenario: A ray misses a CSG object
//   Given c ← csg("union", sphere(), cube())
//     And r ← ray(point(0, 2, -5), vector(0, 0, 1))
//   When xs ← local_intersect(c, r)
//   Then xs is empty
{
  const c = union(sphere(), cube())
  const r = ray(point(0, 2, -5), vector(0, 0, 1))
  const x = intersect(c, r)

  console.assert(!x.length)
}

// Scenario: A ray hits a CSG object
//   Given s1 ← sphere()
//     And s2 ← sphere()
//     And set_transform(s2, translation(0, 0, 0.5))
//     And c ← csg("union", s1, s2)
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//   When xs ← local_intersect(c, r)
//   Then xs.count = 2
//     And xs[0].t = 4
//     And xs[0].object = s1
//     And xs[1].t = 6.5
//     And xs[1].object = s2
{
  const s1 = sphere()
  const s2 = sphere()

  s2.transform = translation(0, 0, 0.5)

  const c = union(s1, s2)
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const x = intersect(c, r)

  console.assert(x.length === 2)

  const [a, b] = x

  console.assert(a.t === 4)
  console.assert(Object.is(a.object, s1))
  console.assert(b.t === 6.5)
  console.assert(Object.is(b.object, s2))
}
