import {
  default as pattern,
  patternatshape,
  patternat,
  BLACK,
  WHITE,
  gradient,
  checkers,
  ring,
  stripe,
  stripeatshape,
} from "./pattern.js"
import * as matrix from "./matrix.js"
import { color, point, equal } from "./tuple.js"
import { sphere } from "./sphere.js"

// Feature: Patterns

// Background:
//   Given black ← color(0, 0, 0)
//     And white ← color(1, 1, 1)/ Background:
// Given black ← color(0, 0, 0)
// And white ← color(1, 1, 1)
{
  console.assert(equal(BLACK, color()))
  console.assert(equal(WHITE, color(1, 1, 1)))
}

// Scenario: Creating a stripe pattern
//   Given pattern ← stripe_pattern(white, black)
//   Then pattern.a = white
//     And pattern.b = black
{
  const p = stripe()

  console.assert(equal(p.a, WHITE))
  console.assert(equal(p.b, BLACK))
}

// Scenario: A stripe pattern is constant in y
//   Given pattern ← stripe_pattern(white, black)
//   Then stripe_at(pattern, point(0, 0, 0)) = white
//     And stripe_at(pattern, point(0, 1, 0)) = white
//     And stripe_at(pattern, point(0, 2, 0)) = white
{
  const p = stripe()

  console.assert(equal(p.at(point()), WHITE))
  console.assert(equal(p.at(point(0, 1, 0)), WHITE))
  console.assert(equal(p.at(point(0, 2, 0)), WHITE))
}

// Scenario: A stripe pattern is constant in z
//   Given pattern ← stripe_pattern(white, black)
//   Then stripe_at(pattern, point(0, 0, 0)) = white
//     And stripe_at(pattern, point(0, 0, 1)) = white
//     And stripe_at(pattern, point(0, 0, 2)) = white
{
  const p = stripe()

  console.assert(equal(p.at(point()), WHITE))
  console.assert(equal(p.at(point(0, 0, 1)), WHITE))
  console.assert(equal(p.at(point(0, 0, 2)), WHITE))
}

// Scenario: A stripe pattern alternates in x
//   Given pattern ← stripe_pattern(white, black)
//   Then stripe_at(pattern, point(0, 0, 0)) = white
//     And stripe_at(pattern, point(0.9, 0, 0)) = white
//     And stripe_at(pattern, point(1, 0, 0)) = black
//     And stripe_at(pattern, point(-0.1, 0, 0)) = black
//     And stripe_at(pattern, point(-1, 0, 0)) = black
//     And stripe_at(pattern, point(-1.1, 0, 0)) = white
{
  const p = stripe()

  console.assert(equal(p.at(point()), WHITE))
  console.assert(equal(p.at(point(0.9, 0, 0)), WHITE))
  console.assert(equal(p.at(point(1, 0, 0)), BLACK))
  console.assert(equal(p.at(point(-0.1, 0, 0)), BLACK))
  console.assert(equal(p.at(point(-1, 0, 0)), BLACK))
  console.assert(equal(p.at(point(-1.1, 0, 0)), WHITE))
}

// Scenario: Stripes with an object transformation
//   Given object ← sphere()
//     And set_transform(object, scaling(2, 2, 2))
//     And pattern ← stripe_pattern(white, black)
//   When c ← stripe_at_object(pattern, object, point(1.5, 0, 0))
//   Then c = white
{
  const o = sphere()

  o.transform = matrix.scaling(2, 2, 2)

  const p = stripe()
  const c = stripeatshape(p, o, point(1.5, 0, 0))

  console.assert(equal(c, WHITE))
}

// Scenario: Stripes with a pattern transformation
//   Given object ← sphere()
//     And pattern ← stripe_pattern(white, black)
//     And set_pattern_transform(pattern, scaling(2, 2, 2))
//   When c ← stripe_at_object(pattern, object, point(1.5, 0, 0))
//   Then c = white
{
  const o = sphere()
  const p = stripe()

  p.transform = matrix.scaling(2, 2, 2)

  const c = stripeatshape(p, o, point(1.5, 0, 0))

  console.assert(equal(c, WHITE))
}

// Scenario: Stripes with both an object and a pattern transformation
//   Given object ← sphere()
//     And set_transform(object, scaling(2, 2, 2))
//     And pattern ← stripe_pattern(white, black)
//     And set_pattern_transform(pattern, translation(0.5, 0, 0))
//   When c ← stripe_at_object(pattern, object, point(2.5, 0, 0))
//   Then c = white
{
  const o = sphere()

  o.transform = matrix.scaling(2, 2, 2)

  const p = stripe()

  p.transform = matrix.translation(0.5, 0, 0)

  const c = stripeatshape(p, o, point(2.5, 0, 0))

  console.assert(equal(c, WHITE))
}

// Scenario: The default pattern transformation
//   Given pattern ← test_pattern()
//   Then pattern.transform = identity_matrix
{
  const p = pattern()

  console.assert(matrix.equal(p.transform, matrix.id4()))
}

// Scenario: Assigning a transformation
//   Given pattern ← test_pattern()
//   When set_pattern_transform(pattern, translation(1, 2, 3))
//   Then pattern.transform = translation(1, 2, 3)
{
  const p = pattern()

  p.transform = matrix.translation(1, 2, 3)

  console.assert(matrix.equal(p.transform, matrix.translation(1, 2, 3)))
}

// Scenario: A pattern with an object transformation
//   Given shape ← sphere()
//     And set_transform(shape, scaling(2, 2, 2))
//     And pattern ← test_pattern()
//   When c ← pattern_at_shape(pattern, shape, point(2, 3, 4))
//   Then c = color(1, 1.5, 2)
{
  const s = sphere()

  s.transform = matrix.scaling(2, 2, 2)

  const p = pattern()
  const c = patternatshape(p, s, point(2, 3, 4))

  console.assert(equal(c, color(1, 1.5, 2)))
}

// Scenario: A pattern with a pattern transformation
//   Given shape ← sphere()
//     And pattern ← test_pattern()
//     And set_pattern_transform(pattern, scaling(2, 2, 2))
//   When c ← pattern_at_shape(pattern, shape, point(2, 3, 4))
//   Then c = color(1, 1.5, 2)
{
  const s = sphere()
  const p = pattern()

  p.transform = matrix.scaling(2, 2, 2)

  const c = patternatshape(p, s, point(2, 3, 4))

  console.assert(equal(c, color(1, 1.5, 2)))
}

// Scenario: A pattern with both an object and a pattern transformation
//   Given shape ← sphere()
//     And set_transform(shape, scaling(2, 2, 2))
//     And pattern ← test_pattern()
//     And set_pattern_transform(pattern, translation(0.5, 1, 1.5))
//   When c ← pattern_at_shape(pattern, shape, point(2.5, 3, 3.5))
//   Then c = color(0.75, 0.5, 0.25)
{
  const s = sphere()

  s.transform = matrix.scaling(2, 2, 2)

  const p = pattern()

  p.transform = matrix.translation(0.5, 1, 1.5)

  const c = patternatshape(p, s, point(2.5, 3, 3.5))

  console.assert(equal(c, color(0.75, 0.5, 0.25)))
}

// Scenario: A gradient linearly interpolates between colors
//   Given pattern ← gradient_pattern(white, black)
//   Then pattern_at(pattern, point(0, 0, 0)) = white
//     And pattern_at(pattern, point(0.25, 0, 0)) = color(0.75, 0.75, 0.75)
//     And pattern_at(pattern, point(0.5, 0, 0)) = color(0.5, 0.5, 0.5)
//     And pattern_at(pattern, point(0.75, 0, 0)) = color(0.25, 0.25, 0.25)
{
  const g = gradient()

  console.assert(equal(patternat(g, point()), WHITE))
  console.assert(equal(patternat(g, point(0.25, 0, 0)), color(0.75, 0.75, 0.75)))
  console.assert(equal(patternat(g, point(0.5, 0, 0)), color(0.5, 0.5, 0.5)))
  console.assert(equal(patternat(g, point(0.75, 0, 0)), color(0.25, 0.25, 0.25)))
}

// Scenario: A ring should extend in both x and z
//   Given pattern ← ring_pattern(white, black)
//   Then pattern_at(pattern, point(0, 0, 0)) = white
//     And pattern_at(pattern, point(1, 0, 0)) = black
//     And pattern_at(pattern, point(0, 0, 1)) = black
//     # 0.708 = just slightly more than √2/2
//     And pattern_at(pattern, point(0.708, 0, 0.708)) = black
{
  const r = ring()

  console.assert(equal(patternat(r, point()), WHITE))
  console.assert(equal(patternat(r, point(1, 0, 0)), BLACK))
  console.assert(equal(patternat(r, point(0, 0, 1)), BLACK))
  console.assert(equal(patternat(r, point(0.708, 0, 0.708)), BLACK))
}

// Scenario: Checkers should repeat in x
//   Given pattern ← checkers_pattern(white, black)
//   Then pattern_at(pattern, point(0, 0, 0)) = white
//     And pattern_at(pattern, point(0.99, 0, 0)) = white
//     And pattern_at(pattern, point(1.01, 0, 0)) = black
{
  const c = checkers()

  console.assert(equal(patternat(c, point()), WHITE))
  console.assert(equal(patternat(c, point(0.99, 0, 0)), WHITE))
  console.assert(equal(patternat(c, point(1.01, 0, 0)), BLACK))
}

// Scenario: Checkers should repeat in y
//   Given pattern ← checkers_pattern(white, black)
//   Then pattern_at(pattern, point(0, 0, 0)) = white
//     And pattern_at(pattern, point(0, 0.99, 0)) = white
//     And pattern_at(pattern, point(0, 1.01, 0)) = black
{
  const c = checkers()

  console.assert(equal(patternat(c, point()), WHITE))
  console.assert(equal(patternat(c, point(0, 0.99, 0)), WHITE))
  console.assert(equal(patternat(c, point(0, 1.01, 0)), BLACK))
}

// Scenario: Checkers should repeat in z
//   Given pattern ← checkers_pattern(white, black)
//   Then pattern_at(pattern, point(0, 0, 0)) = white
//     And pattern_at(pattern, point(0, 0, 0.99)) = white
//     And pattern_at(pattern, point(0, 0, 1.01)) = black
{
  const c = checkers()

  console.assert(equal(patternat(c, point()), WHITE))
  console.assert(equal(patternat(c, point(0, 0, 0.99)), WHITE))
  console.assert(equal(patternat(c, point(0, 0, 1.01)), BLACK))
}
