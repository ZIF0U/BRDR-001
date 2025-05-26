const { app, BrowserWindow, protocol } = require("electron")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"
const fs = require('fs')

function createWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, "assets/icon.png"), // Add your app icon
    titleBarStyle: "default",
    show: false,
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "out", "index.html"))
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    app.quit()
  })
}

// Register protocol handler for file loading
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
