import { pointlight as light } from "./light.js"
import { shape } from "./shape.js"
import { patternatshape } from "./pattern.js"
import {
  replace,
  add,
  reflect,
  multiply,
  normalize,
  negate,
  subtract,
  dot,
  color,
  vector as v,
  point
} from "./tuple.js"

export function material(c = color(1, 1, 1), ...attributes) {
  const [
    ambient = 0.1,
    diffuse = 0.9,
    specular = 0.9,
    shininess = 200,
    reflective = 0,
    transparency = 0,
    refractive = 1,
    pattern,
  ] = attributes

  return { color: c, ambient, diffuse, pattern, specular, shininess, reflective, transparency, refractive }
}

export function lighting(
  m = material(),
  o = shape(),
  l = light(),
  p = point(),
  eye = v(),
  n = v(),
  shadowed = false,
) {
  // Find the direction to the light source.
  const direction = normalize(subtract(l.position, p))

  // Combine the surface color with the light's color / intensity.
  const c = m.pattern ? patternatshape(m.pattern, o, p) : multiply(m.color, l.intensity)

  // Compute the ambient contribution.
  const ambient = multiply(c, m.ambient)

  if (shadowed) {
    return ambient
  }

  // Black if light dot normal is negative.
  const specular = color()
  const diffuse = color()

  // Find the cosine of the angle between the light vector and
  // the normal vector. A negative number means the light is
  // on the other side of the surface.
  const lxn = dot(direction, n)

  if (lxn >= 0) {
    // Find the cosine of the angle between the reflection
    // vector and the eye vector. A negative number means the
    // light reflects away from the eye.
    const rxe = dot(reflect(negate(direction), n), eye)

    if (rxe > 0) {
      // Compute the specular contribution.
      const f = Math.pow(rxe, m.shininess)

      replace(specular, multiply(l.intensity, m.specular * f))
    }

    // Compute the diffuse contribution.
    replace(diffuse, multiply(c, m.diffuse * lxn))
  }

  // Add the three contributions together to get the final shading.
  return add(add(ambient, diffuse), specular)
}
