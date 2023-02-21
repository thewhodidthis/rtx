import { color, equal, point } from "./tuple.js"
import { pointlight } from "./light.js"

// Feature: Lights

// Scenario: A point light has a position and intensity
//   Given intensity ← color(1, 1, 1)
//     And position ← point(0, 0, 0)
//   When light ← point_light(position, intensity)
//   Then light.position = position
//     And light.intensity = intensity
{
  const intensity = color(1, 1, 1)
  const position = point()
  const light = pointlight(position, intensity)

  console.assert(equal(light.intensity, intensity))
  console.assert(equal(light.position, position))
}
