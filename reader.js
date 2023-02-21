// Helps read in files as text, useful when loading shaders.
export async function text(target = "") {
  try {
    return await fetch(target).then(r => r.text())
  } catch (e) {
    throw e
  }
}
