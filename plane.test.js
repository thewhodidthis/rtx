import { equal, point, vector } from "./tuple.js"
import { ray } from "./ray.js"
import { plane, intersect, normal } from "./plane.js"

// Feature: Planes

// Scenario: The normal of a plane is constant everywhere
//   Given p ← plane()
//   When n1 ← local_normal_at(p, point(0, 0, 0))
//     And n2 ← local_normal_at(p, point(10, 0, -10))
//     And n3 ← local_normal_at(p, point(-5, 0, 150))
//   Then n1 = vector(0, 1, 0)
//     And n2 = vector(0, 1, 0)
//     And n3 = vector(0, 1, 0)
{
  const p = plane()

  console.assert(equal(normal(p, point(0, 0, 0)), vector(0, 1, 0)))
  console.assert(equal(normal(p, point(10, 0, -10)), vector(0, 1, 0)))
  console.assert(equal(normal(p, point(-5, 0, 150)), vector(0, 1, 0)))
}

// Scenario: Intersect with a ray parallel to the plane
//   Given p ← plane()
//     And r ← ray(point(0, 10, 0), vector(0, 0, 1))
//   When xs ← local_intersect(p, r)
//   Then xs is empty
{
  const p = plane()
  const r = ray(point(0, 10, 0), vector(0, 0, 1))
  const x = intersect(p, r)

  console.assert(x === undefined)
}

// Scenario: Intersect with a coplanar ray
//   Given p ← plane()
//     And r ← ray(point(0, 0, 0), vector(0, 0, 1))
//   When xs ← local_intersect(p, r)
//   Then xs is empty
{
  const p = plane()
  const r = ray(point(0, 0, 0), vector(0, 0, 1))
  const x = intersect(p, r)

  console.assert(x === undefined)
}

// Scenario: A ray intersecting a plane from above
//   Given p ← plane()
//     And r ← ray(point(0, 1, 0), vector(0, -1, 0))
//   When xs ← local_intersect(p, r)
//   Then xs.count = 1
//     And xs[0].t = 1
//     And xs[0].object = p
{
  const p = plane()
  const r = ray(point(0, 1, 0), vector(0, -1, 0))
  const x = intersect(p, r)

  console.assert(x.length === 1)
  console.assert(JSON.stringify(x[0].object) === JSON.stringify(p))
  console.assert(x[0].t === 1)
}

// Scenario: A ray intersecting a plane from below
//   Given p ← plane()
//     And r ← ray(point(0, -1, 0), vector(0, 1, 0))
//   When xs ← local_intersect(p, r)
//   Then xs.count = 1
//     And xs[0].t = 1
//     And xs[0].object = p
{
  const p = plane()
  const r = ray(point(0, -1, 0), vector(0, 1, 0))
  const x = intersect(p, r)

  console.assert(x.length === 1)
  console.assert(JSON.stringify(x[0].object) === JSON.stringify(p))
  console.assert(x[0].t === 1)
}
