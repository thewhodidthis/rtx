import { id4, multiply } from "./matrix.js"

export function group(...options) {
  return new Group(...options)
}

export class Group {
  constructor(...options) {
    const transform = options.find(o => Array.isArray(o)) ?? id4()
    const name = options.find(o => typeof o === "string") ?? ""

    this.transform = transform
    this.name = name
    this.children = []
  }
  intersect(r) {
    return this.children.map(s => s.intersect(s, r)).flat().sort((a, b) => a.t - b.t)
  }
  push(...children) {
    children.forEach((c) => {
      c.transform = multiply(this.transform, c.transform)
      c.parent = this
    })

    this.children.push(...children)

    return this
  }
  get size() {
    return this.children.length
  }
  get empty() {
    return this.children.length === 0
  }
}
