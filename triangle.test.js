import { point, vector, equal, round } from "./tuple.js"
import { almostequal } from "./helper.js"
import { intersection, intersections, prepare } from "./intersection.js"
import { triangle, intersect, normal, SmoothTriangle } from "./triangle.js"
import { ray } from "./ray.js"

// Feature: Triangles

// Scenario: Constructing a triangle
//   Given p1 ← point(0, 1, 0)
//     And p2 ← point(-1, 0, 0)
//     And p3 ← point(1, 0, 0)
//     And t ← triangle(p1, p2, p3)
//   Then t.p1 = p1
//     And t.p2 = p2
//     And t.p3 = p3
//     And t.e1 = vector(-1, -1, 0)
//     And t.e2 = vector(1, -1, 0)
//     And t.normal = vector(0, 0, -1)
{
  const p1 = point(0, 1, 0)
  const p2 = point(-1, 0, 0)
  const p3 = point(1, 0, 0)
  const t = triangle(p1, p2, p3)

  console.assert(Object.is(t.p1, p1))
  console.assert(Object.is(t.p2, p2))
  console.assert(Object.is(t.p3, p3))

  console.assert(equal(t.e1, vector(-1, -1, 0)))
  console.assert(equal(t.e2, vector(1, -1, 0)))
  console.assert(equal(t.normal(t), vector(0, 0, -1)))
}

// Scenario: Finding the normal on a triangle
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//   When n1 ← local_normal_at(t, point(0, 0.5, 0))
//     And n2 ← local_normal_at(t, point(-0.5, 0.75, 0))
//     And n3 ← local_normal_at(t, point(0.5, 0.25, 0))
//   Then n1 = t.normal
//     And n2 = t.normal
//     And n3 = t.normal
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const n1 = normal(t, point(0, 0.5, 0))
  const n2 = normal(t, point(-0.5, 0.75, 0))
  const n3 = normal(t, point(0.5, 0.25, 0))

  console.assert(equal(n1, t.normal(t)))
  console.assert(equal(n2, t.normal(t)))
  console.assert(equal(n3, t.normal(t)))
}

// Scenario: Intersecting a ray parallel to the triangle
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//     And r ← ray(point(0, -1, -2), vector(0, 1, 0))
//   When xs ← local_intersect(t, r)
//   Then xs is empty
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const r = ray(point(0, -1, -2), vector(0, 1, 0))
  const x = intersect(t, r)

  console.assert(x.length === 0)
}

// Scenario: A ray misses the p1-p3 edge
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//     And r ← ray(point(1, 1, -2), vector(0, 0, 1))
//   When xs ← local_intersect(t, r)
//   Then xs is empty
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const r = ray(point(1, 1, -2), vector(0, 0, 1))
  const x = intersect(t, r)

  console.assert(x.length === 0)
}

// Scenario: A ray misses the p1-p2 edge
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//     And r ← ray(point(-1, 1, -2), vector(0, 0, 1))
//   When xs ← local_intersect(t, r)
//   Then xs is empty
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const r = ray(point(-1, 1, -2), vector(0, 0, 1))
  const x = intersect(t, r)

  console.assert(x.length === 0)
}

// Scenario: A ray misses the p2-p3 edge
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//     And r ← ray(point(0, -1, -2), vector(0, 0, 1))
//   When xs ← local_intersect(t, r)
//   Then xs is empty
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const r = ray(point(0, -1, -2), vector(0, 0, 1))
  const x = intersect(t, r)

  console.assert(x.length === 0)
}

// Scenario: A ray strikes a triangle
//   Given t ← triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
//     And r ← ray(point(0, 0.5, -2), vector(0, 0, 1))
//   When xs ← local_intersect(t, r)
//   Then xs.count = 1
//     And xs[0].t = 2
{
  const t = triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0))
  const r = ray(point(0, 0.5, -2), vector(0, 0, 1))
  const x = intersect(t, r)

  console.assert(x.length === 1)
  console.assert(x[0]?.t === 2)
}

// Feature: Smooth Triangles

// Background:
//   Given p1 ← point(0, 1, 0)
//     And p2 ← point(-1, 0, 0)
//     And p3 ← point(1, 0, 0)
//     And n1 ← vector(0, 1, 0)
//     And n2 ← vector(-1, 0, 0)
//     And n3 ← vector(1, 0, 0)
//   When tri ← smooth_triangle(p1, p2, p3, n1, n2, n3)
{

  const p1 = point(0, 1, 0)
  const p2 = point(-1, 0, 0)
  const p3 = point(1, 0, 0)

  const n1 = vector(0, 1, 0)
  const n2 = vector(-1, 0, 0)
  const n3 = vector(1, 0, 0)

  const t = new SmoothTriangle(p1, p2, p3, n1, n2, n3)

  // Scenario: Constructing a smooth triangle
  //   Then tri.p1 = p1
  //     And tri.p2 = p2
  //     And tri.p3 = p3
  //     And tri.n1 = n1
  //     And tri.n2 = n2
  //     And tri.n3 = n3
  {
    console.assert(equal(t.p1, p1))
    console.assert(equal(t.p2, p2))
    console.assert(equal(t.p3, p3))
    console.assert(equal(t.n1, n1))
    console.assert(equal(t.n2, n2))
    console.assert(equal(t.n3, n3))
  }

  // Scenario: An intersection with a smooth triangle stores u/v
  //   When r ← ray(point(-0.2, 0.3, -2), vector(0, 0, 1))
  //     And xs ← local_intersect(tri, r)
  //   Then xs[0].u = 0.45
  //     And xs[0].v = 0.25
  {
    const r = ray(point(-0.2, 0.3, -2), vector(0, 0, 1))
    const [x] = intersect(t, r)

    console.assert(almostequal(x.u, 0.45))
    console.assert(almostequal(x.v, 0.25))
  }

  // Scenario: A smooth triangle uses u/v to interpolate the normal
  //   When i ← intersection_with_uv(1, tri, 0.45, 0.25)
  //     And n ← normal_at(tri, point(0, 0, 0), i)
  //   Then n = vector(-0.5547, 0.83205, 0)
  {
    const i = intersection(1, t, 0.45, 0.25)
    const n = normal(t, point(), i)

    console.assert(equal(round(n), vector(-0.5547, 0.83205, 0)))
  }

  // Scenario: Preparing the normal on a smooth triangle
  //   When i ← intersection_with_uv(1, tri, 0.45, 0.25)
  //     And r ← ray(point(-0.2, 0.3, -2), vector(0, 0, 1))
  //     And xs ← intersections(i)
  //     And comps ← prepare_computations(i, r, xs)
  //   Then comps.normalv = vector(-0.5547, 0.83205, 0)
  {
    const i = intersection(1, t, 0.45, 0.25)
    const r = ray(point(-0.2, 0.3, -2), vector(0, 0, 1))
    const k = prepare(i, r, intersections(i))

    console.assert(equal(round(k.normal), vector(-0.5547, 0.83205, 0)))
  }
}
