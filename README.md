## about

Going through [The Ray Tracer Challenge](https://pragprog.com/titles/jbtracer/the-ray-tracer-challenge/) in pure JS.

![This took three plus days to render](cover.png)

I put this here because none of the JS solutions I have come across on GitHub are cover to cover complete. The ones I found are also OOP based, whereas I am using classes very selectively for defining shapes mostly. I am extending from `Array` when it comes to tuples and matrices to help when querying via the `instanceof` operator for example, but the corresponding math helpers are pure functions.

There are probably easier, less involved ways of implementing a ray tracer, but I enjoyed the test first, language agonstic approach in the book and ray tracing is not exactly famous for being super fast either.

## setup

Source from an import map:

```json
{
  "imports": {
    "@thewhodidthis/rtx": "https://thewhodidthis.github.io/rtx/main.js"
  }
}
```

Then using Deno for example:

```js
// Call with: deno run --import-map=imports.json example.js
import { vector, Tuple } from "@thewhodidthis/rtx"

console.assert(vector() instanceof Tuple)
```

Or, import from GitHub directly, for example:

```js
import { mat4, Matrix } from "https://thewhodidthis.github.io/rtx/matrix.js"

console.assert(mat4() instanceof Matrix)
```

## usage

Rendering the exercise from Chapter 6:

```js
import { color, point, multiply, subtract, normalize } from "./tuple.js"
import { intersect, sphere } from "./sphere.js"
import { WHITE } from "./pattern.js"
import { pointlight } from "./light.js"
import { hit } from "./intersection.js"
import { material, lighting } from "./material.js"
import { ray, position } from "./ray.js"
import { canvas, ppm } from "./canvas.js"

const origin = point(0, 0, -5)
const c = canvas(300, 300)

const wall = 7
const resolution = wall / c.width
const center = wall / 2

const shape = sphere()
const purple = color(1, 0.2, 0.5)

shape.material = material(purple)

const light = pointlight(point(-10, 10, -10), WHITE)

for (let j = 0; j < c.height; j += 1) {
  const y = center - (resolution * j)

  for (let i = 0; i < c.width; i += 1) {
    const x = (resolution * i) - center

    const direction = normalize(subtract(point(x, y, 10), origin))
    const r = ray(origin, direction)

    const k = intersect(shape, r)
    const h = hit(k)

    if (h) {
      const eye = multiply(r.direction, -1)
      const p = position(r, h.t)
      const n = shape.normal(shape, p)

      const shade = lighting(shape.material, shape, light, p, eye, n)

      c.write(i, j, shade)
    }
  }
}

console.log(ppm(c))
```

## see also

- [@ahamez/ray-tracer](https://github.com/ahamez/ray-tracer)
- [@jamis/rtc-ocaml](https://github.com/jamis/rtc-ocaml)
