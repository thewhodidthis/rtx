import { triangle, smoothtriangle } from "./triangle.js"
import { point, vector } from "./tuple.js"
import { group } from "./group.js"

export function obj(body = "") {
  const lines = body.trim().split("\n").map(l => l.trim()).filter(l => l.length)

  const vertices = lines
    .filter(l => l.startsWith("v "))
    .map(l => l.split(" ").slice(1))
    .map(l => l.map(n => Number(n)))
    .filter(l => !l.some(n => Number.isNaN(n)))
    .map(l => point(...l))

  const normals = lines
    .filter(l => l.startsWith("vn "))
    .map(l => l.split(" ").slice(1))
    .map(l => l.map(n => Number(n)))
    .map(a => vector(...a))

  const faces = lines
    .filter(l => l.startsWith("f "))
    .map(l => l.split(" ").slice(1))
    .map((line) => {
      const face = line
        .map(l => l.split("/").map(d => Number(d)))
        .reduce((f, b) => {
          const i = b.shift(0)
          const j = b.pop()

          const v = vertices.at(i - 1)

          f.vertices.push(v)

          const n = normals.at(j - 1)

          f.normals.push(n)

          return f
        }, { vertices: [], normals: [] })

      return triangulator(...face.normals)(...face.vertices)
    })

  const groups = lines
    .filter(l => l.startsWith("g "))
    .map(l => l.split("g ").pop())
    .map(n => group(n))

  const ignored = lines.length - vertices.length - groups.length - faces.length - normals.length

  if (groups.length) {
    groups.forEach((g, i) => {
      g.push(...faces.at(i))
    })
  } else {
    groups.push(group().push(...faces.flat()))
  }

  return { ignored, vertices, normals, groups }
}

export function groupify(model) {
  return group().push(...model.groups)
}

export function triangulator(...normals) {
  const make = normals.length ? smoothtriangle : triangle

  return function run(...vertices) {
    const a = vertices.shift()
    const r = vertices.reduce((p, b, i, o) => {
      const c = o.at(i + 1)

      if (c) {
        return [...p, make(a, b, c, ...normals)]
      }

      return p
    }, [])

    return r
  }
}
