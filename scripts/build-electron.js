const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("Building Electron app...")

try {
  // Build Next.js app
  console.log("Building Next.js app...")
  execSync("npm run build", { stdio: "inherit" })

  // Copy Electron files to out directory
  console.log("Copying Electron files...")
  const electronFiles = ["electron.js", "preload.js", "database.js"]

  electronFiles.forEach((file) => {
    const src = path.join("public", file)
    const dest = path.join("out", file)

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`Copied ${file}`)
    }
  })

  // Build Electron app
  console.log("Building Electron executable...")
  execSync("electron-builder", { stdio: "inherit" })

  console.log("Build completed successfully!")
} catch (error) {
  console.error("Build failed:", error.message)
  process.exit(1)
}
