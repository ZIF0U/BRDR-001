const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Authentication
  authenticateUser: (username, password) => ipcRenderer.invoke("authenticate-user", username, password),

  // Bordereau operations
  saveBordereau: (bordereau) => ipcRenderer.invoke("save-bordereau", bordereau),

  getBordereaux: () => ipcRenderer.invoke("get-bordereaux"),

  searchBordereaux: (searchTerm, searchType) => ipcRenderer.invoke("search-bordereaux", searchTerm, searchType),

  // Export operations
  exportPDF: (bordereau) => ipcRenderer.invoke("export-pdf", bordereau),

  exportExcel: (bordereau) => ipcRenderer.invoke("export-excel", bordereau),

  // System info
  platform: process.platform,

  // App info
  getVersion: () => ipcRenderer.invoke("get-version"),
})

// DOM ready
window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron app loaded successfully")
})
