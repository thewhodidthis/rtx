import { chunk } from "./helper.js"
import { color } from "./tuple.js"

class Canvas {
  constructor(w = 0, h = 0) {
    this.pixels = Array.from({ length: w * h }, () => color())

    this.width = w
    this.height = h
  }
  indexOf(x, y) {
    return x + (y * this.width)
  }
  read(x, y) {
    const i = this.indexOf(x, y)

    return this.pixels[i]
  }
  write(x, y, c) {
    const i = this.indexOf(x, y)

    this.pixels[i] = c
  }
}

export function canvas(w, h) {
  return new Canvas(w, h)
}

export function ppm({ pixels, width, height } = canvas(), m = 255, f = 70) {
  // Clamp pixel values within range.
  const colors = pixels
    .map(p => p.map(n => Math.max(0, Math.min(m, Math.round(n * m)))).join(" "))
    .join(" ")

  // https://stackoverflow.com/questions/14484787
  const line = new RegExp(`(?![^\\n]{1,${f}}$)([^\\n]{1,${f}})\\s`, "g")
  const body = [...chunk(colors.split(" "), width * 3)]
    .map(r => r.join(" "))
    .map(r => r.replace(line, "$1\n"))
    .join("\n")

  return `P3
${width} ${height}
${m}
${body}
`
}

const extensions = new Map([
  ["image/x-portable-pixmap", "ppm"]
])

export function save(data = canvas(), name = Date.now(), type = "image/x-portable-pixmap") {
  const file = new File([data], name, { type })
  const a = document.createElement("a")

  a.href = self.URL.createObjectURL(file)
  a.download = `${file.name}.${extensions.get(type)}`

  a.click()
  self.URL.revokeObjectURL(a.href)
}

// Helps scale canvas-like objects, but remember to call
// `WebGLRenderingContext.viewport()` post resizing.
// See also: webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
export function resize(c = { width: 0, height: 0 }, x = 1) {
  const { clientWidth: w = c.width, clientHeight: h = c.height } = c

  const xw = Math.trunc(w * x)

  if (c.width !== xw) {
    c.width = xw
  }

  const xh = Math.trunc(h * x)

  if (c.height !== xh) {
    c.height = xh
  }

  return c
}
