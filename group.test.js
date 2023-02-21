import { equal, scaling, id4, translation } from "./matrix.js"
import { shape } from "./shape.js"
import { sphere } from "./sphere.js"
import { point, vector } from "./tuple.js"
import { ray } from "./ray.js"
import { group } from "./group.js"

// Feature: Groups

// Scenario: Creating a new group
//   Given g ← group()
//   Then g.transform = identity_matrix
//     And g is empty
{
  const g = group()

  console.assert(equal(g.transform, id4()))
  console.assert(g.empty)
}

// Scenario: Adding a child to a group
//   Given g ← group()
//     And s ← test_shape()
//   When add_child(g, s)
//   Then g is not empty
//     And g includes s
//     And s.parent = g
{
  const g = group()
  const s = shape()

  g.push(s)

  console.assert(!g.empty)
  console.assert(g.children.includes(s))
  console.assert(Object.is(s.parent, g))
}

// Scenario: Intersecting a ray with an empty group
//   Given g ← group()
//     And r ← ray(point(0, 0, 0), vector(0, 0, 1))
//   When xs ← local_intersect(g, r)
//   Then xs is empty
{
  const g = group()
  const r = ray(point(), vector(0, 0, 1))
  const x = g.intersect(r)

  console.assert(x.length === 0)
}

// Scenario: Intersecting a ray with a nonempty group
//   Given g ← group()
//     And s1 ← sphere()
//     And s2 ← sphere()
//     And set_transform(s2, translation(0, 0, -3))
//     And s3 ← sphere()
//     And set_transform(s3, translation(5, 0, 0))
//     And add_child(g, s1)
//     And add_child(g, s2)
//     And add_child(g, s3)
//   When r ← ray(point(0, 0, -5), vector(0, 0, 1))
//     And xs ← local_intersect(g, r)
//   Then xs.count = 4
//     And xs[0].object = s2
//     And xs[1].object = s2
//     And xs[2].object = s1
//     And xs[3].object = s1
{
  const s1 = sphere()
  const s2 = sphere()
  const s3 = sphere()

  s2.transform = translation(0, 0, -3)
  s3.transform = translation(5, 0, 0)

  const g = group()

  g.push(s1, s2, s3)

  const r = ray(point(0, 0, -5), vector(0, 0, 1))
  const x = g.intersect(r)

  console.assert(Object.is(x[0].object, s2))
  console.assert(Object.is(x[1].object, s2))
  console.assert(Object.is(x[2].object, s1))
  console.assert(Object.is(x[3].object, s1))
}

// Scenario: Intersecting a transformed group
//   Given g ← group()
//     And set_transform(g, scaling(2, 2, 2))
//     And s ← sphere()
//     And set_transform(s, translation(5, 0, 0))
//     And add_child(g, s)
//   When r ← ray(point(10, 0, -10), vector(0, 0, 1))
//     And xs ← intersect(g, r)
//   Then xs.count = 2
{
  const s = sphere()

  s.transform = translation(5, 0, 0)

  const g = group(scaling(2, 2, 2))

  g.push(s)

  const r = ray(point(10, 0, -10), vector(0, 0, 1))
  const x = g.intersect(r)

  console.assert(x.length === 2, 110)
}
