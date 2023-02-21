import { intersection, intersections, prepare } from "./intersection.js"
import { sphere } from "./sphere.js"
import { plane } from "./plane.js"
import { world, refract, reflect, colorat, intersect, shade, shadowed, defaultworld } from "./world.js"
import { ray } from "./ray.js"
import testpattern from "./pattern.js"
import { equal, round, point, color, vector } from "./tuple.js"
import * as matrix from "./matrix.js"
import { pointlight } from "./light.js"

// Feature: World

// Scenario: Creating a world
//   Given w ← world()
//   Then w contains no objects
//     And w has no light source
{
  const w = world()

  console.assert(w.objects.length === 0)
  console.assert(w.light === undefined)
}

// Scenario: The default world
//   Given light ← point_light(point(-10, 10, -10), color(1, 1, 1))
//     And s1 ← sphere() with:
//       | material.color     | (0.8, 1.0, 0.6)        |
//       | material.diffuse   | 0.7                    |
//       | material.specular  | 0.2                    |
//     And s2 ← sphere() with:
//       | transform | scaling(0.5, 0.5, 0.5) |
//   When w ← default_world()
//   Then w.light = light
//     And w contains s1
//     And w contains s2
{
  const light = pointlight(point(-10, 10, -10), color(1, 1, 1))
  const w = defaultworld()

  console.assert(equal(w.light.intensity, light.intensity))
  console.assert(equal(w.light.position, light.position))

  const [a, b] = w.objects

  console.assert(equal(a.material.color, color(0.8, 1, 0.6)))
  console.assert(a.material.specular === 0.2)
  console.assert(a.material.diffuse === 0.7)

  console.assert(matrix.equal(b.transform, matrix.scaling(0.5, 0.5, 0.5)))
}

// Scenario: Intersect a world with a ray
//   Given w ← default_world()
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//   When xs ← intersect_world(w, r)
//   Then xs.count = 4
//     And xs[0].t = 4
//     And xs[1].t = 4.5
//     And xs[2].t = 5.5
//     And xs[3].t = 6
{
  const w = defaultworld()
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const xs = intersect(w, r)

  const [a, b, c, d] = xs

  console.assert(xs.length === 4)
  console.assert(a.t === 4)
  console.assert(b.t === 4.5)
  console.assert(c.t === 5.5)
  console.assert(d.t === 6)
}

// Scenario: Shading an intersection
//   Given w ← default_world()
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And shape ← the first object in w
//     And i ← intersection(4, shape)
//   When comps ← prepare_computations(i, r)
//     And c ← shade_hit(w, comps)
//   Then c = color(0.38066, 0.47583, 0.2855)
{
  const w = defaultworld()
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const [s] = w.objects
  const i = intersection(4, s)
  const c = prepare(i, r)

  console.assert(equal(round(shade(w, c)), color(0.38066, 0.47583, 0.2855)))
}

// Scenario: Shading an intersection from the inside
//   Given w ← default_world()
//     And w.light ← point_light(point(0, 0.25, 0), color(1, 1, 1))
//     And r ← ray(point(0, 0, 0), vector(0, 0, 1))
//     And shape ← the second object in w
//     And i ← intersection(0.5, shape)
//   When comps ← prepare_computations(i, r)
//     And c ← shade_hit(w, comps)
//   Then c = color(0.90498, 0.90498, 0.90498)
{
  const w = defaultworld()

  w.light = pointlight(point(0, 0.25, 0), color(1, 1, 1))

  const r = ray(point(), vector(0, 0, 1))
  const [, s] = w.objects
  const i = intersection(0.5, s)
  const c = prepare(i, r)

  console.assert(equal(round(shade(w, c)), color(0.90498, 0.90498, 0.90498)))
}

// Scenario: The color when a ray misses
//   Given w ← default_world()
//     And r ← ray(point(0, 0, -5), vector(0, 1, 0))
//   When c ← color_at(w, r)
//   Then c = color(0, 0, 0)
{
  const w = defaultworld()
  const r = ray(point(0, 0, -5), vector(0, 1, 0))
  const c = colorat(w, r)

  console.assert(equal(c, color()))
}

// Scenario: The color when a ray hits
//   Given w ← default_world()
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//   When c ← color_at(w, r)
//   Then c = color(0.38066, 0.47583, 0.2855)
{
  const w = defaultworld()
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const c = colorat(w, r)

  console.assert(equal(round(c), color(0.38066, 0.47583, 0.2855)))
}

// Scenario: The color with an intersection behind the ray
//   Given w ← default_world()
//     And outer ← the first object in w
//     And outer.material.ambient ← 1
//     And inner ← the second object in w
//     And inner.material.ambient ← 1
//     And r ← ray(point(0, 0, 0.75), vector(0, 0, -1))
//   When c ← color_at(w, r)
//   Then c = inner.material.color
{
  const w = defaultworld()
  const [outer, inner] = w.objects

  outer.material.ambient = 1
  inner.material.ambient = 1

  const r = ray(point(0, 0, 0.75), vector(0, 0, -1))
  const c = colorat(w, r)

  console.assert(equal(c, inner.material.color))
}

// Scenario: There is no shadow when nothing is collinear with point and light
//   Given w ← default_world()
//     And p ← point(0, 10, 0)
//    Then is_shadowed(w, p) is false
{
  const w = defaultworld()
  const p = point(0, 10, 0)

  console.assert(!shadowed(w, p))
}

// Scenario: The shadow when an object is between the point and the light
//   Given w ← default_world()
//     And p ← point(10, -10, 10)
//    Then is_shadowed(w, p) is true
{
  const w = defaultworld()
  const p = point(10, -10, 10)

  console.assert(shadowed(w, p))
}

// Scenario: There is no shadow when an object is behind the light
//   Given w ← default_world()
//     And p ← point(-20, 20, -20)
//    Then is_shadowed(w, p) is false
{
  const w = defaultworld()
  const p = point(-20, 20, -20)

  console.assert(!shadowed(w, p))
}

// Scenario: There is no shadow when an object is behind the point
//   Given w ← default_world()
//     And p ← point(-2, 2, -2)
//    Then is_shadowed(w, p) is false
{
  const w = defaultworld()
  const p = point(-2, 2, -2)

  console.assert(!shadowed(w, p))
}

// Scenario: shade_hit() is given an intersection in shadow
//   Given w ← world()
//     And w.light ← point_light(point(0, 0, -10), color(1, 1, 1))
//     And s1 ← sphere()
//     And s1 is added to w
//     And s2 ← sphere() with:
//       | transform | translation(0, 0, 10) |
//     And s2 is added to w
//     And r ← ray(point(0, 0, 5), vector(0, 0, 1))
//     And i ← intersection(4, s2)
//   When comps ← prepare_computations(i, r)
//     And c ← shade_hit(w, comps)
//   Then c = color(0.1, 0.1, 0.1)
{
  const l = pointlight(point(0, 0, -10), color(1, 1, 1))
  const s = sphere()

  s.transform = matrix.translation(0, 0, 10)

  const w = world(l, sphere(), s)
  const r = ray(point(0, 0, 5), vector(0, 0, 1))
  const i = intersection(4, s)
  const c = shade(w, prepare(i, r))

  console.assert(equal(c, color(0.1, 0.1, 0.1)))
}

// Scenario: The reflected color for a nonreflective material
//   Given w ← default_world()
//     And r ← ray(point(0, 0, 0), vector(0, 0, 1))
//     And shape ← the second object in w
//     And shape.material.ambient ← 1
//     And i ← intersection(1, shape)
//   When comps ← prepare_computations(i, r)
//     And color ← reflected_color(w, comps)
//   Then color = color(0, 0, 0)
{
  const w = defaultworld()
  const r = ray(point(), vector(0, 0, 1))
  const [,s] = w.objects

  s.material.ambient = 1

  const i = intersection(1, s)
  const c = reflect(w, prepare(i, r))

  console.assert(equal(c, color()))
}

// Scenario: The reflected color for a reflective material
//   Given w ← default_world()
//     And shape ← plane() with:
//       | material.reflective | 0.5                   |
//       | transform           | translation(0, -1, 0) |
//     And shape is added to w
//     And r ← ray(point(0, 0, -3), vector(0, -√2/2, √2/2))
//     And i ← intersection(√2, shape)
//   When comps ← prepare_computations(i, r)
//     And color ← reflected_color(w, comps)
//   Then color = color(0.19032, 0.2379, 0.14274)
{
  const w = defaultworld()
  const s = plane()

  s.material.reflective = 0.5
  s.transform = matrix.translation(0, -1, 0)

  w.objects.push(s)

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, -3), vector(0, -q, q))
  const i = intersection(Math.sqrt(2), s)
  const c = reflect(w, prepare(i, r))

  console.assert(equal(round(c), round(color(0.19033, 0.23791, 0.14275))))
}

// Scenario: shade_hit() with a reflective material
//   Given w ← default_world()
//     And shape ← plane() with:
//       | material.reflective | 0.5                   |
//       | transform           | translation(0, -1, 0) |
//     And shape is added to w
//     And r ← ray(point(0, 0, -3), vector(0, -√2/2, √2/2))
//     And i ← intersection(√2, shape)
//   When comps ← prepare_computations(i, r)
//     And color ← shade_hit(w, comps)
//   Then color = color(0.87677, 0.92436, 0.82918)
{
  const w = defaultworld()
  const s = plane()

  s.material.reflective = 0.5
  s.transform = matrix.translation(0, -1, 0)

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, -3), vector(0, -q, q))
  const i = intersection(Math.sqrt(2), s)
  const c = shade(w, prepare(i, r), 1)

  console.assert(equal(round(c), color(0.87676, 0.92434, 0.82917)))
}

// Scenario: color_at() with mutually reflective surfaces
//   Given w ← world()
//     And w.light ← point_light(point(0, 0, 0), color(1, 1, 1))
//     And lower ← plane() with:
//       | material.reflective | 1                     |
//       | transform           | translation(0, -1, 0) |
//     And lower is added to w
//     And upper ← plane() with:
//       | material.reflective | 1                    |
//       | transform           | translation(0, 1, 0) |
//     And upper is added to w
//     And r ← ray(point(0, 0, 0), vector(0, 1, 0))
//   Then color_at(w, r) should terminate successfully
{
  const w = world()

  w.light = pointlight(point(), color(1, 1, 1))

  const lower = plane()

  lower.material.reflect = 1
  lower.transform = matrix.translation(0, -1, 0)

  w.objects.push(lower)

  const upper = plane()

  upper.material.reflect = 1
  upper.transform = matrix.translation(0, 1, 0)

  w.objects.push(upper)

  const r = ray(point(), vector(0, 1, 0))

  try {
    colorat(w, r)
  } catch (_) {
    console.assert(false)
  }
}

// Scenario: The reflected color at the maximum recursive depth
//   Given w ← default_world()
//     And shape ← plane() with:
//       | material.reflective | 0.5                   |
//       | transform           | translation(0, -1, 0) |
//     And shape is added to w
//     And r ← ray(point(0, 0, -3), vector(0, -√2/2, √2/2))
//     And i ← intersection(√2, shape)
//   When comps ← prepare_computations(i, r)
//     And color ← reflected_color(w, comps, 0)
//   Then color = color(0, 0, 0)
{
  const w = defaultworld()
  const s = plane()

  s.material.reflective = 0.5
  s.transform = matrix.translation(0, -1, 0)

  w.objects.push(s)

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, -3), vector(0, -q, q))
  const i = intersection(Math.sqrt(2), s)
  const c = reflect(w, prepare(i, r), 0)

  console.assert(equal(c, color()))
}

// Scenario: The refracted color with an opaque surface
//   Given w ← default_world()
//     And shape ← the first object in w
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And xs ← intersections(4:shape, 6:shape)
//   When comps ← prepare_computations(xs[0], r, xs)
//     And c ← refracted_color(w, comps, 5)
//   Then c = color(0, 0, 0)
{
  const w = defaultworld()
  const [s] = w.objects
  const r = ray(point(0, 0, -5), vector(0, 0, 1))

  const x = intersections(intersection(4, s), intersection(6, s))
  const k = prepare(x[0], r, x)
  const c = refract(w, k, 5)

  console.assert(equal(c, color()))
}

// Scenario: The refracted color at the maximum recursive depth
//   Given w ← default_world()
//     And shape ← the first object in w
//     And shape has:
//       | material.transparency     | 1.0 |
//       | material.refractive_index | 1.5 |
//     And r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And xs ← intersections(4:shape, 6:shape)
//   When comps ← prepare_computations(xs[0], r, xs)
//     And c ← refracted_color(w, comps, 0)
//   Then c = color(0, 0, 0)
{
  const w = defaultworld()
  const [s] = w.objects

  s.transparency = 1
  s.refractive = 1.5

  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const x = intersections(intersection(4, s), intersection(6, s))
  const k = prepare(x[0], r, x)
  const c = refract(w, k, 0)

  console.assert(equal(c, color()))
}

// Scenario: The refracted color under total internal reflection
//   Given w ← default_world()
//     And shape ← the first object in w
//     And shape has:
//       | material.transparency     | 1.0 |
//       | material.refractive_index | 1.5 |
//     And r ← ray(point(0, 0, √2/2), vector(0, 1, 0))
//     And xs ← intersections(-√2/2:shape, √2/2:shape)
//   # NOTE: this time you're inside the sphere, so you need
//   # to look at the second intersection, xs[1], not xs[0]
//   When comps ← prepare_computations(xs[1], r, xs)
//     And c ← refracted_color(w, comps, 5)
//   Then c = color(0, 0, 0)
{
  const w = defaultworld()
  const [s] = w.objects

  s.transparency = 1
  s.refractive = 1.5

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, q), vector(0, 1, 0))
  const x = intersections(intersection(-q, s), intersection(q, s))
  const k = prepare(x[1], r, x)
  const c = refract(w, k, 5)

  console.assert(equal(c, color()))
}

// Scenario: The refracted color with a refracted ray
//   Given w ← default_world()
//     And A ← the first object in w
//     And A has:
//       | material.ambient | 1.0            |
//       | material.pattern | test_pattern() |
//     And B ← the second object in w
//     And B has:
//       | material.transparency     | 1.0 |
//       | material.refractive_index | 1.5 |
//     And r ← ray(point(0, 0, 0.1), vector(0, 1, 0))
//     And xs ← intersections(-0.9899:A, -0.4899:B, 0.4899:B, 0.9899:A)
//   When comps ← prepare_computations(xs[2], r, xs)
//     And c ← refracted_color(w, comps, 5)
//   Then c = color(0, 0.99888, 0.04725)
{
  const w = defaultworld()
  const [a, b] = w.objects

  a.material.ambient = 1
  a.material.pattern = testpattern()

  b.material.transparency = 1
  b.material.refractive = 1.5

  const r = ray(point(0, 0, 0.1), vector(0, 1, 0))
  const x = intersections(
    intersection(-0.9899, a),
    intersection(-0.4899, b),
    intersection(0.4899, b),
    intersection(0.9899, a),
  )

  const k = prepare(x[2], r, x)
  const c = refract(w, k, 5)

  console.assert(equal(round(c), color(0, 0.99888, 0.04722)))
}

// Scenario: shade_hit() with a transparent material
//   Given w ← default_world()
//     And floor ← plane() with:
//       | transform                 | translation(0, -1, 0) |
//       | material.transparency     | 0.5                   |
//       | material.refractive_index | 1.5                   |
//     And floor is added to w
//     And ball ← sphere() with:
//       | material.color     | (1, 0, 0)                  |
//       | material.ambient   | 0.5                        |
//       | transform          | translation(0, -3.5, -0.5) |
//     And ball is added to w
//     And r ← ray(point(0, 0, -3), vector(0, -√2/2, √2/2))
//     And xs ← intersections(√2:floor)
//   When comps ← prepare_computations(xs[0], r, xs)
//     And color ← shade_hit(w, comps, 5)
//   Then color = color(0.93642, 0.68642, 0.68642)
{
  const w = defaultworld()
  const floor = plane()

  floor.material.transparency = 0.5
  floor.material.refractive = 1.5
  floor.transform = matrix.translation(0, -1, 0)

  w.objects.push(floor)

  const ball = sphere()

  ball.material.color = color(1, 0, 0)
  ball.material.ambient = 0.5
  ball.transform = matrix.translation(0, -3.5, -0.5)

  w.objects.push(ball)

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, -3), vector(0, -q, q))
  const k = prepare(intersection(Math.sqrt(2), floor), r)
  const c = shade(w, k, 5)

  console.assert(equal(round(c), color(0.93643, 0.68643, 0.68643)))
}

// Scenario: shade_hit() with a reflective, transparent material
//   Given w ← default_world()
//     And r ← ray(point(0, 0, -3), vector(0, -√2/2, √2/2))
//     And floor ← plane() with:
//       | transform                 | translation(0, -1, 0) |
//       | material.reflective       | 0.5                   |
//       | material.transparency     | 0.5                   |
//       | material.refractive_index | 1.5                   |
//     And floor is added to w
//     And ball ← sphere() with:
//       | material.color     | (1, 0, 0)                  |
//       | material.ambient   | 0.5                        |
//       | transform          | translation(0, -3.5, -0.5) |
//     And ball is added to w
//     And xs ← intersections(√2:floor)
//   When comps ← prepare_computations(xs[0], r, xs)
//     And color ← shade_hit(w, comps, 5)
//   Then color = color(0.93391, 0.69643, 0.69243)
{
  const w = defaultworld()
  const floor = plane()

  floor.transform = matrix.translation(0, -1, 0)
  floor.material.reflective = 0.5
  floor.material.transparency = 0.5
  floor.material.refractive = 1.5

  w.objects.push(floor)

  const ball = sphere()

  ball.material.color = color(1, 0, 0)
  ball.transform = matrix.translation(0, -3.5, -0.5)
  ball.material.ambient = 0.5

  w.objects.push(ball)

  const q = Math.sqrt(2) / 2
  const r = ray(point(0, 0, -3), vector(0, -q, q))
  const k = prepare(intersection(Math.sqrt(2), floor), r)
  const c = shade(w, k, 5)

  console.assert(equal(round(c), color(0.93392, 0.69643, 0.69243)))
}
