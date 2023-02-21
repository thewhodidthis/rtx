import * as matrix from "./matrix.js"
import { point, vector, round, subtract, equal } from "./tuple.js"
import { Shape, shape, worldToObject, normalToWorld } from "./shape.js"
import { group } from "./group.js"
import { sphere } from "./sphere.js"
import { ray } from "./ray.js"
import { material } from "./material.js"

// Feature: Abstract Shapes

// Scenario: The default transformation
//   Given s ← test_shape()
//   Then s.transform = identity_matrix
{
  const s = shape()

  console.assert(matrix.equal(s.transform, matrix.id4()))
}

// Scenario: Assigning a transformation
//   Given s ← test_shape()
//   When set_transform(s, translation(2, 3, 4))
//   Then s.transform = translation(2, 3, 4)
{
  const s = shape()
  const t = matrix.translation(2, 3, 4)

  s.transform = t

  console.assert(matrix.equal(s.transform, t))
}

// Scenario: The default material
//   Given s ← test_shape()
//   When m ← s.material
//   Then m = material()
{
  const m = material()
  const s = shape(m)

  console.assert(Object.is(s.material, m))
}

// Scenario: Assigning a material
//   Given s ← test_shape()
//     And m ← material()
//     And m.ambient ← 1
//   When s.material ← m
//   Then s.material = m
{
  const m = material(1)
  const s = shape(m)

  console.assert(Object.is(s.material, m))
}

// Scenario: Intersecting a scaled shape with a ray
//   Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And s ← test_shape()
//   When set_transform(s, scaling(2, 2, 2))
//     And xs ← intersect(s, r)
//   Then s.saved_ray.origin = point(0, 0, -2.5)
//     And s.saved_ray.direction = vector(0, 0, 0.5)
{
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const s = shape()

  s.transform = matrix.scaling(2, 2, 2)

  const x = Shape.intersect((_, r) => r)(s, r)

  console.assert(equal(x.direction, vector(0, 0, 0.5)))
  console.assert(equal(x.origin, point(0, 0, -2.5)))
}

// Scenario: Intersecting a translated shape with a ray
//   Given r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And s ← test_shape()
//   When set_transform(s, translation(5, 0, 0))
//     And xs ← intersect(s, r)
//   Then s.saved_ray.origin = point(-5, 0, -5)
//     And s.saved_ray.direction = vector(0, 0, 1)
{
  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const s = shape()

  s.transform = matrix.translation(5, 0, 0)

  const x = Shape.intersect((_, r) => r)(s, r)

  console.assert(equal(x.direction, vector(0, 0, 1)))
  console.assert(equal(x.origin, point(-5, 0, -5)))
}

// Scenario: Computing the normal on a translated shape
//   Given s ← test_shape()
//   When set_transform(s, translation(0, 1, 0))
//     And n ← normal_at(s, point(0, 1.70711, -0.70711))
//   Then n = vector(0, 0.70711, -0.70711)
{
  const s = shape()

  s.transform = matrix.translation(0, 1, 0)

  const n = Shape.normal((_, p) => subtract(p, point()))(s, point(0, 1.70711, -0.70711))

  console.assert(equal(round(n), vector(0, 0.70711, -0.70711)))
}

// Scenario: Computing the normal on a transformed shape
//   Given s ← test_shape()
//     And m ← scaling(1, 0.5, 1) * rotation_z(π/5)
//   When set_transform(s, m)
//     And n ← normal_at(s, point(0, √2/2, -√2/2))
//   Then n = vector(0, 0.97014, -0.24254)
{
  const s = shape()

  s.transform = matrix.multiply(matrix.scaling(1, 0.5, 1), matrix.rotationz(Math.PI / 5))

  const k = Math.sqrt(2) / 2
  const n = Shape.normal((_, p) => subtract(p, point()))(s, point(0, k, -k))

  console.assert(equal(round(n), vector(0, 0.97014, -0.24254)))
}

// Scenario: A shape has a parent attribute
//   Given s ← test_shape()
//   Then s.parent is nothing
{
  const s = shape()

  console.assert(s.parent === undefined)
}

// Scenario: Converting a point from world to object space
//   Given g1 ← group()
//     And set_transform(g1, rotation_y(π/2))
//     And g2 ← group()
//     And set_transform(g2, scaling(2, 2, 2))
//     And add_child(g1, g2)
//     And s ← sphere()
//     And set_transform(s, translation(5, 0, 0))
//     And add_child(g2, s)
//   When p ← world_to_object(s, point(-2, 0, -10))
//   Then p = point(0, 0, -1)
{
  const g = group(matrix.rotationy(Math.PI / 2))
  const e = group()

  g.push(e)

  e.transform = matrix.scaling(2, 2, 2)

  const s = sphere()

  e.push(s)

  s.transform = matrix.translation(5, 0, 0)

  const p = worldToObject(s, point(-2, 0, -10))

  console.assert(equal(round(p), point(0, 0, -1)))
}

// Scenario: Converting a normal from object to world space
//   Given g1 ← group()
//     And set_transform(g1, rotation_y(π/2))
//     And g2 ← group()
//     And set_transform(g2, scaling(1, 2, 3))
//     And add_child(g1, g2)
//     And s ← sphere()
//     And set_transform(s, translation(5, 0, 0))
//     And add_child(g2, s)
//   When n ← normal_to_world(s, vector(√3/3, √3/3, √3/3))
//   Then n = vector(0.2857, 0.4286, -0.8571)
{
  const g = group(matrix.rotationy(Math.PI / 2))
  const e = group()

  g.push(e)

  e.transform = matrix.scaling(1, 2, 3)

  const s = sphere()

  e.push(s)

  s.transform = matrix.translation(5, 0, 0)

  const q = Math.sqrt(3) / 3
  const n = normalToWorld(s, vector(q, q, q))

  console.assert(equal(round(n), vector(0.28571, 0.42857, -0.85714)))
}

// Scenario: Finding the normal on a child object
//   Given g1 ← group()
//     And set_transform(g1, rotation_y(π/2))
//     And g2 ← group()
//     And set_transform(g2, scaling(1, 2, 3))
//     And add_child(g1, g2)
//     And s ← sphere()
//     And set_transform(s, translation(5, 0, 0))
//     And add_child(g2, s)
//   When n ← normal_at(s, point(1.7321, 1.1547, -5.5774))
//   Then n = vector(0.2857, 0.4286, -0.8571)
{

  const g = group(matrix.rotationy(Math.PI / 2))
  const e = group()

  g.push(e)
  e.transform = matrix.scaling(1, 2, 3)

  const s = sphere()

  e.push(s)
  s.transform = matrix.translation(5, 0, 0)

  const q = Math.sqrt(3) / 3
  const n = normalToWorld(s, vector(q, q, q))

  console.assert(equal(round(n), vector(0.28571, 0.42857, -0.85714)))
}
