export const EPSILON = Number.EPSILON * 50 * 4

// Helps decide if two numbers are practically equal.
export function almostequal(a, b, m = 1) {
  return Math.abs(a - b) < Number.EPSILON * m
}

// Helps break arrays into smaller parts.
export function* chunk(a, n) {
  for (let i = 0; i < a.length; i += n) {
    yield a.slice(i, i + n)
  }
}

// Helps read specific lines from input.
export function lines(input, start = 1, end = start) {
  return input.trimStart().split("\n").slice(start - 1, end).join("\n")
}
