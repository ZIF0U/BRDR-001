const { contextBridge, ipcRenderer } = require("electron")

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
})
