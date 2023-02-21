import { material, lighting } from "./material.js"
import { stripe } from "./pattern.js"
import { sphere } from "./sphere.js"
import { color, round, point, vector, equal } from "./tuple.js"
import { pointlight } from "./light.js"
import { almostequal } from "./helper.js"

// Feature: Materials

// Scenario: The default material
//   Given m ← material()
//   Then m.color = color(1, 1, 1)
//     And m.ambient = 0.1
//     And m.diffuse = 0.9
//     And m.specular = 0.9
//     And m.shininess = 200.0
{
  const m = material()

  console.assert(equal(m.color, color(1, 1, 1)))
  console.assert(almostequal(m.ambient, 0.1))
  console.assert(almostequal(m.shininess, 200))
  console.assert(almostequal(m.diffuse, 0.9))
  console.assert(almostequal(m.specular, 0.9))
}

// Background:
//   Given m ← material()
//     And position ← point(0, 0, 0)
// Scenario: Lighting with the eye between the light and the surface
//   Given eyev ← vector(0, 0, -1)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 0, -10), color(1, 1, 1))
//   When result ← lighting(m, light, position, eyev, normalv)
//   Then result = color(1.9, 1.9, 1.9)
{
  const m = material()
  const p = point()

  const eye = vector(0, 0, -1)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 0, -10), color(1, 1, 1))
  const result = lighting(m, sphere(), light, p, eye, n)

  console.assert(equal(result, color(1.9, 1.9, 1.9)))
}

// Scenario: Lighting with the eye between light and surface, eye offset 45°
//   Given eyev ← vector(0, √2/2, -√2/2)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 0, -10), color(1, 1, 1))
//   When result ← lighting(m, light, position, eyev, normalv)
//   Then result = color(1.0, 1.0, 1.0)
{
  const m = material()
  const p = point()

  const k = Math.sqrt(2) / 2
  const eye = vector(0, k, k)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 0, -10), color(1, 1, 1))
  const result = lighting(m, sphere(), light, p, eye, n)

  console.assert(equal(result, color(1, 1, 1)))
}

// Scenario: Lighting with eye opposite surface, light offset 45°
//   Given eyev ← vector(0, 0, -1)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 10, -10), color(1, 1, 1))
//   When result ← lighting(m, light, position, eyev, normalv)
//   Then result = color(0.7364, 0.7364, 0.7364)
{
  const m = material()
  const p = point()

  const eye = vector(0, 0, -1)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 10, -10), color(1, 1, 1))
  const result = round(lighting(m, sphere(), light, p, eye, n))

  console.assert(equal(result, color(0.7364, 0.7364, 0.7364)))
}

// Scenario: Lighting with eye in the path of the reflection vector
//   Given eyev ← vector(0, -√2/2, -√2/2)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 10, -10), color(1, 1, 1))
//   When result ← lighting(m, light, position, eyev, normalv)
//   Then result = color(1.6364, 1.6364, 1.6364)
{
  const m = material()
  const p = point()

  const k = Math.sqrt(2) / 2
  const eye = vector(0, -k, -k)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 10, -10), color(1, 1, 1))
  const result = round(lighting(m, sphere(), light, p, eye, n))

  console.assert(equal(result, color(1.6364, 1.6364, 1.6364)))
}

// Scenario: Lighting with the light behind the surface
//   Given eyev ← vector(0, 0, -1)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 0, 10), color(1, 1, 1))
//   When result ← lighting(m, light, position, eyev, normalv)
//   Then result = color(0.1, 0.1, 0.1)
{
  const m = material()
  const p = point()

  const eye = vector(0, 0, -1)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 0, 10), color(1, 1, 1))
  const result = round(lighting(m, sphere(), light, p, eye, n))

  console.assert(equal(result, color(0.1, 0.1, 0.1)))
}

// Scenario: Lighting with the surface in shadow
//   Given eyev ← vector(0, 0, -1)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 0, -10), color(1, 1, 1))
//     And in_shadow ← true
//   When result ← lighting(m, light, position, eyev, normalv, in_shadow)
//   Then result = color(0.1, 0.1, 0.1)
{
  const m = material()
  const p = point()

  const eye = vector(0, 0, -1)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 0, -10), color(1, 1, 1))
  const result = lighting(m, sphere(), light, p, eye, n, true)

  console.assert(equal(result, color(0.1, 0.1, 0.1)))
}

// Scenario: Lighting with a pattern applied
//   Given m.pattern ← stripe_pattern(color(1, 1, 1), color(0, 0, 0))
//     And m.ambient ← 1
//     And m.diffuse ← 0
//     And m.specular ← 0
//     And eyev ← vector(0, 0, -1)
//     And normalv ← vector(0, 0, -1)
//     And light ← point_light(point(0, 0, -10), color(1, 1, 1))
//   When c1 ← lighting(m, light, point(0.9, 0, 0), eyev, normalv, false)
//     And c2 ← lighting(m, light, point(1.1, 0, 0), eyev, normalv, false)
//   Then c1 = color(1, 1, 1)
//     And c2 = color(0, 0, 0)
{
  const m = material()

  m.pattern = stripe()
  m.ambient = 1
  m.specular = 0
  m.diffuse = 0

  const eye = vector(0, 0, -1)
  const n = vector(0, 0, -1)
  const light = pointlight(point(0, 0, -10), color(1, 1, 1))

  const c1 = lighting(m, sphere(), light, point(0.9, 0, 0), eye, n)
  const c2 = lighting(m, sphere(), light, point(1.1, 0, 0), eye, n)

  console.assert(equal(c1, color(1, 1, 1)))
  console.assert(equal(c2, color()))
}

// Scenario: Reflectivity for the default material
//   Given m ← material()
//   Then m.reflective = 0.0
{
  const m = material()

  console.assert(m.reflective === 0)
}

// Scenario: Transparency and Refractive Index for the default material
//   Given m ← material()
//   Then m.transparency = 0.0
//     And m.refractive_index = 1.0
{
  const m = material()

  console.assert(m.transparency === 0)
  console.assert(m.refractive === 1)
}
