import { pointlight } from "./light.js"
import { hit, schlick, prepare } from "./intersection.js"
import { sphere } from "./sphere.js"
import { ray } from "./ray.js"
import { point, dot, add, color, subtract, multiply, normalize, magnitude } from "./tuple.js"
import { scaling } from "./matrix.js"
import { lighting, material } from "./material.js"

export class World {
  constructor(light, ...objects) {
    this.lights = []
    this.light = light
    this.objects = objects
  }
  get light() {
    return this.lights.at(0)
  }
  set light(l) {
    this.lights.splice(0, 1, l)
  }
}

export function defaultworld() {
  const light = pointlight(point(-10, 10, -10), color(1, 1, 1))
  const a = sphere(material(color(0.8, 1, 0.6)))

  a.material.specular = 0.2
  a.material.diffuse = 0.7

  const b = sphere()

  b.transform = scaling(0.5, 0.5, 0.5)

  return world(light, a, b)
}

export function intersect(w = world(), r = ray()) {
  return w.objects.map(s => s.intersect(s, r)).flat().sort((a, b) => a.t - b.t)
}

export function world(...contents) {
  return new World(...contents)
}

export function shade(w = world(), o = prepare(), runs = 0) {
  const { material } = o.object
  const result = w.lights.reduce((total, light) => {
    const surface = lighting(
      material,
      o.object,
      light,
      o.overpoint,
      o.eye,
      o.normal,
      shadowed(w, o.overpoint, light)
    )

    const reflected = reflect(w, o, runs)
    const refracted = refract(w, o, runs)

    if (material.reflective > 0 && material.transparency > 0) {
      const reflectance = schlick(o)

      return add(surface, add(multiply(reflected, reflectance), multiply(refracted, 1 - reflectance)))
    }

    return add(total, add(surface, add(reflected, refracted)))
  }, color())

  return result
}

export function colorat(w = world(), r = ray(), runs) {
  const intersections = intersect(w, r)
  const h = hit(intersections)

  if (h) {
    return shade(w, prepare(h, r, intersections), runs)
  }

  return color()
}

export function refract(w = world(), o = prepare(), runs = 5) {
  if (runs <= 0 || o.object.material.transparency === 0) {
    return color()
  }

  const ratio = o.n1 / o.n2
  const cosI = dot(o.eye, o.normal)
  const sin2T = ratio ** 2 * (1 - cosI ** 2)

  if (sin2T > 1) {
    return color()
  }

  const cosT = Math.sqrt(1 - sin2T)
  const direction = subtract(multiply(o.normal, ratio * cosI - cosT), multiply(o.eye, ratio))
  const r = ray(o.underpoint, direction)
  const c = colorat(w, r, runs - 1)

  return multiply(c, o.object.material.transparency)
}

export function reflect(w = world(), o = prepare(), runs = 5) {
  if (runs <= 0 || o.object.material.reflective === 0) {
    return color()
  }

  const r = ray(o.overpoint, o.reflect)
  const c = colorat(w, r, runs - 1)

  return multiply(c, o.object.material.reflective)
}

export function shadowed(w = world(), p = point(), l = w.light) {
  const v = subtract(l.position, p)

  const direction = normalize(v)
  const distance = magnitude(v)

  const r = ray(p, direction)
  const intersections = intersect(w, r)
  const h = hit(intersections)

  if (h) {
    return h.t < distance
  }

  return false
}
