import { Tuple, equal, point, vector } from "./tuple.js"
import * as matrix from "./matrix.js"
import { obj, groupify } from "./parser.js"

// Feature: OBJ File Parser

// Scenario: Ignoring unrecognized lines
//   Given gibberish ← a file containing:
//     """
//     There was a young lady named Bright
//     who traveled much faster than light.
//     She set out one day
//     in a relative way,
//     and came back the previous night.
//     """
//   When parser ← parse_obj_file(gibberish)
//   Then parser should have ignored 5 lines
{
  const result = await obj(`
    There was a young lady named Bright
    who traveled much faster than light.
    She set out one day
    in a relative way,
    and came back the previous night.
  `)

  console.assert(result.ignored === 5)
}

// Scenario: Vertex records
//   Given file ← a file containing:
//     """
//     v -1 1 0
//     v -1.0000 0.5000 0.0000
//     v 1 0 0
//     v 1 1 0
//     """
//   When parser ← parse_obj_file(file)
//   Then parser.vertices[1] = point(-1, 1, 0)
//     And parser.vertices[2] = point(-1, 0.5, 0)
//     And parser.vertices[3] = point(1, 0, 0)
//     And parser.vertices[4] = point(1, 1, 0)
{
  const result = await obj(`
    v -1 1 0
    v -1.0000 0.5000 0.0000
    v 1 0 0
    v 1 1 0
  `)
  const [a = point(), b = point(), c = point(), d = point()] = result.vertices

  console.assert(equal(a, point(-1, 1, 0)))
  console.assert(equal(b, point(-1, 0.5, 0)))
  console.assert(equal(c, point(1, 0, 0)))
  console.assert(equal(d, point(1, 1, 0)))
}

// Scenario: Parsing triangle faces
//   Given file ← a file containing:
//     """
//     v -1 1 0
//     v -1 0 0
//     v 1 0 0
//     v 1 1 0
//
//     f 1 2 3
//     f 1 3 4
//     """
//   When parser ← parse_obj_file(file)
//     And g ← parser.default_group
//     And t1 ← first child of g
//     And t2 ← second child of g
//   Then t1.p1 = parser.vertices[1]
//     And t1.p2 = parser.vertices[2]
//     And t1.p3 = parser.vertices[3]
//     And t2.p1 = parser.vertices[1]
//     And t2.p2 = parser.vertices[3]
//     And t2.p3 = parser.vertices[4]
{
  const result = await obj(`
    v -1 1 0
    v -1 0 0
    v 1 0 0
    v 1 1 0

    f 1 2 3
    f 1 3 4
  `)
  const [a = point(), b = point(), c = point(), d = point()] = result.vertices
  const [g] = result.groups
  const [t1, t2] = g.children

  console.assert(equal(t1.p1, a))
  console.assert(equal(t1.p2, b))
  console.assert(equal(t1.p3, c))
  console.assert(equal(t2.p1, a))
  console.assert(equal(t2.p2, c))
  console.assert(equal(t2.p3, d))
}

// Scenario: Triangulating polygons
//   Given file ← a file containing:
//     """
//     v -1 1 0
//     v -1 0 0
//     v 1 0 0
//     v 1 1 0
//     v 0 2 0
//
//     f 1 2 3 4 5
//     """
//   When parser ← parse_obj_file(file)
//     And g ← parser.default_group
//     And t1 ← first child of g
//     And t2 ← second child of g
//     And t3 ← third child of g
//   Then t1.p1 = parser.vertices[1]
//     And t1.p2 = parser.vertices[2]
//     And t1.p3 = parser.vertices[3]
//     And t2.p1 = parser.vertices[1]
//     And t2.p2 = parser.vertices[3]
//     And t2.p3 = parser.vertices[4]
//     And t3.p1 = parser.vertices[1]
//     And t3.p2 = parser.vertices[4]
//     And t3.p3 = parser.vertices[5]
{
  const result = await obj(`
    v -1 1 0
    v -1 0 0
    v 1 0 0
    v 1 1 0
    v 0 2 0

    f 1 2 3 4 5
  `)
  const [a = point(), b = point(), c = point(), d = point(), e = point()] = result.vertices
  const [g] = result.groups
  const [t1, t2, t3] = g.children

  console.assert(equal(t1.p1, a))
  console.assert(equal(t1.p2, b))
  console.assert(equal(t1.p3, c))
  console.assert(equal(t2.p1, a))
  console.assert(equal(t2.p2, c))
  console.assert(equal(t2.p3, d))
  console.assert(equal(t3.p1, a))
  console.assert(equal(t3.p2, d))
  console.assert(equal(t3.p3, e))
}

// Scenario: Triangles in groups
//   Given file ← the file "triangles.obj"
//   When parser ← parse_obj_file(file)
//     And g1 ← "FirstGroup" from parser
//     And g2 ← "SecondGroup" from parser
//     And t1 ← first child of g1
//     And t2 ← first child of g2
//   Then t1.p1 = parser.vertices[1]
//     And t1.p2 = parser.vertices[2]
//     And t1.p3 = parser.vertices[3]
//     And t2.p1 = parser.vertices[1]
//     And t2.p2 = parser.vertices[3]
//     And t2.p3 = parser.vertices[4]
{
  const result = await obj(`
    v -1 1 0
    v -1 0 0
    v 1 0 0
    v 1 1 0

    g FirstGroup
    f 1 2 3
    g SecondGroup
    f 1 3 4
  `)

  const [a = point(), b = point(), c = point(), d = point()] = result.vertices
  const g1 = result.groups.find(g => g.name === "FirstGroup")
  const g2 = result.groups.find(g => g.name === "SecondGroup")

  const t1 = g1.children.at(0)
  const t2 = g2.children.at(0)

  console.assert(equal(t1.p1, a))
  console.assert(equal(t1.p2, b))
  console.assert(equal(t1.p3, c))
  console.assert(equal(t2.p1, a))
  console.assert(equal(t2.p2, c))
  console.assert(equal(t2.p3, d))
}

// Scenario: Converting an OBJ file to a group
//   Given file ← the file "triangles.obj"
//     And parser ← parse_obj_file(file)
//   When g ← obj_to_group(parser)
//   Then g includes "FirstGroup" from parser
//     And g includes "SecondGroup" from parser
{
  const result = await obj(`
    v -1 1 0
    v -1 0 0
    v 1 0 0
    v 1 1 0

    g FirstGroup
    f 1 2 3
    g SecondGroup
    f 1 3 4
  `)

  const g1 = result.groups.find(g => g.name === "FirstGroup")
  const g2 = result.groups.find(g => g.name === "SecondGroup")
  const g3 = groupify(result)

  console.assert(g3.children.includes(g1))
  console.assert(g3.children.includes(g2))
}

// Scenario: Vertex normal records
//   Given file ← a file containing:
//     """
//     vn 0 0 1
//     vn 0.707 0 -0.707
//     vn 1 2 3
//     """
//   When parser ← parse_obj_file(file)
//   Then parser.normals[1] = vector(0, 0, 1)
//     And parser.normals[2] = vector(0.707, 0, -0.707)
//     And parser.normals[3] = vector(1, 2, 3)
{
  const result = await obj(`
    vn 0 0 1
    vn 0.707 0 -0.707
    vn 1 2 3
  `)
  const [a = vector(), b = vector(), c = vector()] = result.normals

  console.assert(equal(a, vector(0, 0, 1)))
  console.assert(equal(b, vector(0.707, 0, -0.707)))
  console.assert(equal(c, vector(1, 2, 3)))
}

// Scenario: Faces with normals
//   Given file ← a file containing:
//     """
//     v 0 1 0
//     v -1 0 0
//     v 1 0 0
//
//     vn -1 0 0
//     vn 1 0 0
//     vn 0 1 0
//
//     f 1//3 2//1 3//2
//     f 1/0/3 2/102/1 3/14/2
//     """
//   When parser ← parse_obj_file(file)
//     And g ← parser.default_group
//     And t1 ← first child of g
//     And t2 ← second child of g
//   Then t1.p1 = parser.vertices[1]
//     And t1.p2 = parser.vertices[2]
//     And t1.p3 = parser.vertices[3]
//     And t1.n1 = parser.normals[3]
//     And t1.n2 = parser.normals[1]
//     And t1.n3 = parser.normals[2]
//     And t2 = t1
{
  const result = await obj(`
    v 0 1 0
    v -1 0 0
    v 1 0 0

    vn -1 0 0
    vn 1 0 0
    vn 0 1 0

    f 1//3 2//1 3//2
    f 1/0/3 2/102/1 3/14/2
  `)
  const [g] = result.groups
  const [a, b] = g.children

  console.assert(equal(a.p1, result.vertices.at(0)))
  console.assert(equal(a.p2, result.vertices.at(1)))
  console.assert(equal(a.p3, result.vertices.at(2)))

  console.assert(equal(a.n1, result.normals.at(2)))
  console.assert(equal(a.n2, result.normals.at(0)))
  console.assert(equal(a.n3, result.normals.at(1)))

  for (const [k, v] of Object.entries(a)) {
    const n = b[k]

    if (v instanceof matrix.Matrix) {
      console.assert(matrix.equal(v, n), k)
    } else if (v instanceof Tuple) {
      console.assert(equal(v, n), k)
    } else if (k === "material") {
      Object.entries(v).forEach(([q, p]) => {
        if (p instanceof Tuple) {
          console.assert(equal(p, n[q], q))
        } else {
          console.assert(Object.is(p, n[q]), q)
        }
      })
    } else {
      console.assert(Object.is(v, b[k]), k)
    }
  }
}
