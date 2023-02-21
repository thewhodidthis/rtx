import { normalize, subtract, cross, vector } from "./tuple.js"
import { mat4 } from "./matrix.js"

// Simple projection, this helps convert world coordinates to clip space.
export default function(w = 2, h = 2, d = 2) {
  // Note: This matrix flips the Y axis so 0 is at the top.
  return mat4(2 / w, 0, 0, 0, 0, -2 / h, 0, 0, 0, 0, 2 / d, 0, -1, 1, 0, 1)
}

export function lookat(eye = vector(), target = vector(), up = vector(0, 1, 0)) {
  const z = normalize(subtract(eye, target))
  const x = normalize(cross(up, z))
  const y = normalize(cross(z, x))

  return mat4(...x, ...y, ...z, ...eye.slice(0, 3))
}

// The arguments are: left, right, bottom, top, near, far.
// https://en.wikipedia.org/wiki/Orthographic_projection
export function orthographic(l, r, b, t, n, f) {
  return mat4(
    2 / (r - l), 0, 0, 0,
    0, 2 / (t - b), 0, 0,
    0, 0, 2 / (n - f), 0,
    (l + r) / (l - r), (b + t) / (b - t), (n + f) / (n - f), 1,
  )
}

// Expects field of view in radians.
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#perspective_projection_matrix
export function perspective(fov, aspect, near, far) {
  // Inverse range.
  const s = 1 / (near - far)
  const f = 1 / Math.tan(fov * 0.5)

  return mat4(
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, s * (near + far), -1,
    0, 0, s * 2 * near * far, 0,
  )
}
