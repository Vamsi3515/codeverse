const path = require('path')
const projectRoot = path.resolve(__dirname)

const plugins = []

function tryRequireFromProject(name) {
  try {
    const resolved = require.resolve(name, { paths: [projectRoot] })
    return require(resolved)
  } catch (e) {
    return null
  }
}

// Prefer the dedicated PostCSS plugin package if available in project
const postcssPlugin = tryRequireFromProject('@tailwindcss/postcss')
if (postcssPlugin) {
  try {
    plugins.push(postcssPlugin())
  } catch (e) {
    // silently ignore initialization failures — fallback to no Tailwind
  }
} else {
  // Fallback: try to load tailwindcss from the project only (avoid global installs)
  const tailwind = tryRequireFromProject('tailwindcss')
  if (tailwind) {
    try {
      // Only use it if it's the project-local package (prevent using global/parent installs)
      const resolvedPath = require.resolve('tailwindcss', { paths: [projectRoot] })
      const nodeModulesPrefix = path.join(projectRoot, 'node_modules')
      if (resolvedPath.startsWith(nodeModulesPrefix)) {
        try { plugins.push(tailwind()) } catch (e) { /* ignore */ }
      } else {
        // Do not warn — silently skip using an external tailwind package to avoid overlay errors.
      }
    } catch (e) {
      // ignore
    }
  } else {
    // tailwind not present locally — proceed without it
  }
}

// Add autoprefixer if present locally
try {
  const ap = tryRequireFromProject('autoprefixer')
  if (ap) plugins.push(ap)
} catch (e) {
  // ignore
}

module.exports = { plugins }
