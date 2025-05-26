class BordereauApp {
  constructor() {
    this.currentUser = null
    this.currentBordereau = null
    this.bordereaux = []

    this.init()
  }

  init() {
    this.bindEvents()
    this.showLoginScreen()
  }

  bindEvents() {
    // Login
    document.getElementById("login-form").addEventListener("submit", (e) => this.handleLogin(e))

    // Logout
    document.getElementById("logout-btn").addEventListener("click", () => this.handleLogout())

    // Tab navigation
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab))
    })

    // Bordereau management
    document.getElementById("new-bordereau-btn").addEventListener("click", () => this.showNewBordereauModal())
    document.getElementById("create-bordereau-btn").addEventListener("click", () => this.showNewBordereauModal())
    document.getElementById("add-cheque-btn").addEventListener("click", () => this.addNewCheque())
    document.getElementById("save-bordereau-btn").addEventListener("click", () => this.saveBordereau())

    // New bordereau form
    document.getElementById("new-bordereau-form").addEventListener("submit", (e) => this.createNewBordereau(e))

    // Search
    document.getElementById("search-input").addEventListener("input", () => this.performSearch())
    document.getElementById("search-type").addEventListener("change", () => this.performSearch())

    // Modal close
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => this.closeModal(e.target.closest(".modal")))
    })

    // Click outside modal to close
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modal)
        }
      })
    })
  }

  async handleLogin(e) {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const errorEl = document.getElementById("login-error")

    try {
      const user = await window.electronAPI.authenticateUser(username, password)

      if (user) {
        this.currentUser = username
        this.showMainScreen()
        errorEl.textContent = ""
      } else {
        errorEl.textContent = "Invalid credentials"
      }
    } catch (error) {
      errorEl.textContent = "Login failed. Please try again."
      console.error("Login error:", error)
    }
  }

  handleLogout() {
    this.currentUser = null
    this.currentBordereau = null
    this.showLoginScreen()

    // Reset forms
    document.getElementById("login-form").reset()
    document.getElementById("login-error").textContent = ""
  }

  showLoginScreen() {
    document.getElementById("login-screen").classList.add("active")
    document.getElementById("main-screen").classList.remove("active")
  }

  showMainScreen() {
    document.getElementById("login-screen").classList.remove("active")
    document.getElementById("main-screen").classList.add("active")
    document.getElementById("current-user").textContent = this.currentUser

    // Load history data
    this.loadBordereaux()
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName)
    })

    // Update tab panes
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.toggle("active", pane.id === `${tabName}-tab`)
    })

    if (tabName === "history") {
      this.loadBordereaux()
    }
  }

  showNewBordereauModal() {
    document.getElementById("new-bordereau-modal").classList.add("active")
  }

  closeModal(modal) {
    modal.classList.remove("active")

    // Reset forms
    const forms = modal.querySelectorAll("form")
    forms.forEach((form) => form.reset())
  }

  async createNewBordereau(e) {
    e.preventDefault()

    const destination = document.getElementById("destination").value
    const sendingDate = document.getElementById("sending-date").value

    if (!destination || !sendingDate) {
      alert("Please fill in all fields")
      return
    }

    const newBordereau = {
      id: `BDR-${Date.now()}`,
      destination,
      sendingDate,
      createdDate: new Date().toISOString().split("T")[0],
      user: this.currentUser,
      cheques: [],
    }

    this.currentBordereau = newBordereau
    this.updateBordereauDisplay()
    this.closeModal(document.getElementById("new-bordereau-modal"))

    this.showNotification("New Bordereau created successfully")
  }

  updateBordereauDisplay() {
    const noBordereau = document.getElementById("no-bordereau")
    const currentBordereau = document.getElementById("current-bordereau")
    const addChequeBtn = document.getElementById("add-cheque-btn")
    const saveBordereauBtn = document.getElementById("save-bordereau-btn")

    if (this.currentBordereau) {
      noBordereau.style.display = "none"
      currentBordereau.style.display = "block"
      addChequeBtn.style.display = "block"
      saveBordereauBtn.style.display = "block"

      // Update bordereau info
      document.getElementById("bordereau-title").textContent = `Bordereau: ${this.currentBordereau.id}`
      document.getElementById("bordereau-meta").textContent =
        `Destination: ${this.currentBordereau.destination} | Date: ${this.currentBordereau.sendingDate}`

      this.updateChequesTable()
    } else {
      noBordereau.style.display = "block"
      currentBordereau.style.display = "none"
      addChequeBtn.style.display = "none"
      saveBordereauBtn.style.display = "none"
    }
  }

  addNewCheque() {
    if (!this.currentBordereau) return

    const newCheque = {
      id: String(this.currentBordereau.cheques.length + 1).padStart(2, "0"),
      codeBanque: "",
      numCheque: "",
      info: "",
      montant: 0,
    }

    this.currentBordereau.cheques.push(newCheque)
    this.updateChequesTable()
  }

  updateChequesTable() {
    const tbody = document.getElementById("cheques-tbody")
    const noCheques = document.getElementById("no-cheques")
    const totalRow = document.getElementById("total-row")
    const totalAmount = document.getElementById("total-amount")

    tbody.innerHTML = ""

    if (this.currentBordereau.cheques.length === 0) {
      noCheques.style.display = "block"
      totalRow.style.display = "none"
    } else {
      noCheques.style.display = "none"
      totalRow.style.display = "block"

      this.currentBordereau.cheques.forEach((cheque, index) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${cheque.id}</td>
                    <td><input type="text" value="${cheque.codeBanque}" onchange="app.updateCheque(${index}, 'codeBanque', this.value)" placeholder="Code Banque"></td>
                    <td><input type="text" value="${cheque.numCheque}" onchange="app.updateCheque(${index}, 'numCheque', this.value)" placeholder="Num Cheque"></td>
                    <td><input type="text" value="${cheque.info}" onchange="app.updateCheque(${index}, 'info', this.value)" placeholder="Info"></td>
                    <td><input type="number" value="${cheque.montant}" onchange="app.updateCheque(${index}, 'montant', parseFloat(this.value) || 0)" placeholder="Montant" step="0.01"></td>
                    <td><button class="btn btn-danger btn-small" onclick="app.deleteCheque(${index})"><i class="fas fa-trash"></i></button></td>
                `
        tbody.appendChild(row)
      })

      const total = this.currentBordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0)
      totalAmount.textContent = total.toFixed(2)
    }
  }

  updateCheque(index, field, value) {
    if (this.currentBordereau && this.currentBordereau.cheques[index]) {
      this.currentBordereau.cheques[index][field] = value

      if (field === "montant") {
        this.updateTotal()
      }
    }
  }

  deleteCheque(index) {
    if (this.currentBordereau) {
      this.currentBordereau.cheques.splice(index, 1)
      this.updateChequesTable()
    }
  }

  updateTotal() {
    const total = this.currentBordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0)
    document.getElementById("total-amount").textContent = total.toFixed(2)
  }

  async saveBordereau() {
    if (!this.currentBordereau) return

    try {
      await window.electronAPI.saveBordereau(this.currentBordereau)
      this.showNotification("Bordereau saved successfully")
      this.currentBordereau = null
      this.updateBordereauDisplay()
      this.loadBordereaux()
    } catch (error) {
      alert("Failed to save Bordereau")
      console.error("Save error:", error)
    }
  }

  async loadBordereaux() {
    try {
      this.bordereaux = await window.electronAPI.getBordereaux()
      this.updateHistoryTable(this.bordereaux)
    } catch (error) {
      console.error("Load error:", error)
    }
  }

  async performSearch() {
    const searchTerm = document.getElementById("search-input").value.trim()
    const searchType = document.getElementById("search-type").value

    try {
      let results
      if (searchTerm) {
        results = await window.electronAPI.searchBordereaux(searchTerm, searchType)
      } else {
        results = this.bordereaux
      }

      this.updateHistoryTable(results)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  updateHistoryTable(bordereaux) {
    const tbody = document.getElementById("history-tbody")
    const noResults = document.getElementById("no-results")
    const resultsCount = document.getElementById("results-count")

    tbody.innerHTML = ""
    resultsCount.textContent = bordereaux.length

    if (bordereaux.length === 0) {
      noResults.style.display = "block"
    } else {
      noResults.style.display = "none"

      bordereaux.forEach((bordereau) => {
        const total = bordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0)

        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${bordereau.id}</td>
                    <td>${bordereau.user}</td>
                    <td>${bordereau.destination}</td>
                    <td>${bordereau.createdDate}</td>
                    <td>${bordereau.sendingDate}</td>
                    <td>${bordereau.cheques.length}</td>
                    <td>${total.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-small btn-outline" onclick="app.viewBordereauDetails('${bordereau.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small btn-outline" onclick="app.exportPDF('${bordereau.id}')">PDF</button>
                        <button class="btn btn-small btn-outline" onclick="app.exportExcel('${bordereau.id}')">XLS</button>
                    </td>
                `
        tbody.appendChild(row)
      })
    }
  }

  viewBordereauDetails(bordereauId) {
    const bordereau = this.bordereaux.find((b) => b.id === bordereauId)
    if (!bordereau) return

    const modal = document.getElementById("bordereau-detail-modal")
    const title = document.getElementById("detail-title")
    const content = document.getElementById("detail-content")

    title.textContent = `Bordereau Details: ${bordereau.id}`

    const total = bordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0)

    content.innerHTML = `
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 14px;">
                    <div><strong>User:</strong> ${bordereau.user}</div>
                    <div><strong>Destination:</strong> ${bordereau.destination}</div>
                    <div><strong>Created:</strong> ${bordereau.createdDate}</div>
                    <div><strong>Sending Date:</strong> ${bordereau.sendingDate}</div>
                </div>
                
                <h4 style="margin-bottom: 16px;">Cheques</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Code Banque</th>
                                <th>Num Cheque</th>
                                <th>Info</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bordereau.cheques
                              .map(
                                (cheque) => `
                                <tr>
                                    <td>${cheque.id}</td>
                                    <td>${cheque.codeBanque}</td>
                                    <td>${cheque.numCheque}</td>
                                    <td>${cheque.info}</td>
                                    <td>${cheque.montant.toFixed(2)}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                    <div class="total-row">
                        <strong>Total: ${total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `

    modal.classList.add("active")
  }

  async exportPDF(bordereauId) {
    const bordereau = this.bordereaux.find((b) => b.id === bordereauId)
    if (!bordereau) return

    try {
      const filePath = await window.electronAPI.exportPDF(bordereau)
      if (filePath) {
        this.showNotification(`PDF export saved to: ${filePath}`)
      }
    } catch (error) {
      alert("PDF export failed")
      console.error("PDF export error:", error)
    }
  }

  async exportExcel(bordereauId) {
    const bordereau = this.bordereaux.find((b) => b.id === bordereauId)
    if (!bordereau) return

    try {
      const filePath = await window.electronAPI.exportExcel(bordereau)
      if (filePath) {
        this.showNotification(`Excel export saved to: ${filePath}`)
      }
    } catch (error) {
      alert("Excel export failed")
      console.error("Excel export error:", error)
    }
  }

  showNotification(message) {
    // Simple notification - you could enhance this with a proper notification system
    const notification = document.createElement("div")
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
        `
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
}

// Initialize the app
const app = new BordereauApp()
