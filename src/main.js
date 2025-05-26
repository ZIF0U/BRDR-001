const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const Database = require("./database")

let mainWindow
let db

const isDev = process.argv.includes("--dev")

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "default",
  })

  // Initialize database
  db = new Database()

  // Load the app
  mainWindow.loadFile("renderer/index.html")

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
    if (db) {
      db.close()
    }
  })
}

// App event handlers
app.whenReady().then(createWindow)

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

// IPC handlers
ipcMain.handle("authenticate-user", async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.authenticateUser(username, password, (err, user) => {
      if (err) reject(err)
      else resolve(user)
    })
  })
})

ipcMain.handle("save-bordereau", async (event, bordereau) => {
  return new Promise((resolve, reject) => {
    db.saveBordereau(bordereau, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })
})

ipcMain.handle("get-bordereaux", async () => {
  return new Promise((resolve, reject) => {
    db.getBordereaux((err, bordereaux) => {
      if (err) reject(err)
      else resolve(bordereaux)
    })
  })
})

ipcMain.handle("search-bordereaux", async (event, searchTerm, searchType) => {
  return new Promise((resolve, reject) => {
    db.searchBordereaux(searchTerm, searchType, (err, bordereaux) => {
      if (err) reject(err)
      else resolve(bordereaux)
    })
  })
})

ipcMain.handle("export-pdf", async (event, bordereau) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `${bordereau.id}.pdf`,
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
  })

  if (filePath) {
    // PDF export would be implemented here
    return filePath
  }
  return null
})

ipcMain.handle("export-excel", async (event, bordereau) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `${bordereau.id}.xlsx`,
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
  })

  if (filePath) {
    // Excel export would be implemented here
    return filePath
  }
  return null
})

app.on("before-quit", () => {
  if (db) {
    db.close()
  }
})
