const sqlite3 = require("sqlite3").verbose()
const path = require("path")

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, "bordereau.db"))
    this.init()
  }

  init() {
    // Create tables if they don't exist
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Bordereaux table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS bordereaux (
          id TEXT PRIMARY KEY,
          user_id INTEGER,
          destination TEXT NOT NULL,
          sending_date DATE NOT NULL,
          created_date DATE NOT NULL,
          total_amount REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `)

      // Cheques table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS cheques (
          id TEXT NOT NULL,
          bordereau_id TEXT NOT NULL,
          emetteur TEXT,
          code_banque TEXT NOT NULL,
          num_cheque TEXT NOT NULL,
          montant REAL NOT NULL,
          num_facture TEXT,
          client TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id, bordereau_id),
          FOREIGN KEY (bordereau_id) REFERENCES bordereaux (id)
        )
      `)

      // Insert default admin user
      this.db.run(`
        INSERT OR IGNORE INTO users (username, password) 
        VALUES ('admin', 'admin')
      `)
    })
  }

  // User methods
  authenticateUser(username, password, callback) {
    this.db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], callback)
  }

  // Bordereau methods
  saveBordereau(bordereau, isUpdate = false, callback) {
    this.db.serialize(() => {
      this.db.run("BEGIN TRANSACTION")

      if (isUpdate) {
        // First, delete existing cheques for this bordereau
        this.db.run("DELETE FROM cheques WHERE bordereau_id = ?", [bordereau.id])
        
        // Update the bordereau
        this.db.run(
          `
          UPDATE bordereaux 
          SET destination = ?, 
              sending_date = ?, 
              total_amount = ?
          WHERE id = ?
        `,
          [
            bordereau.destination,
            bordereau.sendingDate,
            bordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0),
            bordereau.id,
          ],
        )
      } else {
        // Insert new bordereau
        this.db.run(
          `
          INSERT INTO bordereaux (id, user_id, destination, sending_date, created_date, total_amount)
          VALUES (?, (SELECT id FROM users WHERE username = ?), ?, ?, ?, ?)
        `,
          [
            bordereau.id,
            bordereau.user,
            bordereau.destination,
            bordereau.sendingDate,
            bordereau.createdDate,
            bordereau.cheques.reduce((sum, cheque) => sum + cheque.montant, 0),
          ],
        )
      }

      // Insert cheques (for both new and updated bordereaux)
      const stmt = this.db.prepare(`
        INSERT INTO cheques (id, bordereau_id, emetteur, code_banque, num_cheque, montant, num_facture, client)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      bordereau.cheques.forEach((cheque) => {
        stmt.run([
          cheque.id, 
          bordereau.id, 
          cheque.emetteur, 
          cheque.codeBanque, 
          cheque.numCheque, 
          cheque.montant, 
          cheque.numFacture, 
          cheque.client
        ])
      })

      stmt.finalize()
      this.db.run("COMMIT", callback)
    })
  }
  
  // Get a specific bordereau by ID
  getBordereau(id, callback) {
    this.db.get(
      `
      SELECT b.*, u.username,
             GROUP_CONCAT(
               c.id || '|' || c.emetteur || '|' || c.code_banque || '|' || c.num_cheque || '|' || 
               c.montant || '|' || c.num_facture || '|' || c.client, ';'
             ) as cheques_data
      FROM bordereaux b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN cheques c ON b.id = c.bordereau_id
      WHERE b.id = ?
      GROUP BY b.id
    `,
      [id],
      (err, row) => {
        if (err) {
          callback(err, null)
          return
        }
        
        if (!row) {
          callback(null, null)
          return
        }

        const bordereau = {
          id: row.id,
          user: row.username,
          destination: row.destination,
          sendingDate: row.sending_date,
          createdDate: row.created_date,
          cheques: row.cheques_data
            ? row.cheques_data.split(";").map((chequeStr) => {
                const [id, emetteur, codeBanque, numCheque, montant, numFacture, client] = chequeStr.split("|")
                return {
                  id,
                  emetteur,
                  codeBanque,
                  numCheque,
                  montant: Number.parseFloat(montant),
                  numFacture,
                  client
                }
              })
            : [],
        }

        callback(null, bordereau)
      }
    )
  }

  getBordereaux(callback) {
    this.db.all(
      `
      SELECT b.*, u.username,
             GROUP_CONCAT(
               c.id || '|' || c.emetteur || '|' || c.code_banque || '|' || c.num_cheque || '|' || 
               c.montant || '|' || c.num_facture || '|' || c.client, ';'
             ) as cheques_data
      FROM bordereaux b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN cheques c ON b.id = c.bordereau_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `,
      (err, rows) => {
        if (err) {
          callback(err, null)
          return
        }

        const bordereaux = rows.map((row) => ({
          id: row.id,
          user: row.username,
          destination: row.destination,
          sendingDate: row.sending_date,
          createdDate: row.created_date,
          cheques: row.cheques_data
            ? row.cheques_data.split(";").map((chequeStr) => {
                const [id, emetteur, codeBanque, numCheque, montant, numFacture, client] = chequeStr.split("|")
                return {
                  id,
                  emetteur,
                  codeBanque,
                  numCheque,
                  montant: Number.parseFloat(montant),
                  numFacture,
                  client
                }
              })
            : [],
        }))

        callback(null, bordereaux)
      },
    )
  }

  searchBordereaux(searchTerm, searchType, callback) {
    let query = `
      SELECT DISTINCT b.*, u.username,
             GROUP_CONCAT(
               c.id || '|' || c.emetteur || '|' || c.code_banque || '|' || c.num_cheque || '|' || 
               c.montant || '|' || c.num_facture || '|' || c.client, ';'
             ) as cheques_data
      FROM bordereaux b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN cheques c ON b.id = c.bordereau_id
    `

    let params = []

    if (searchType === "bordereau") {
      query += ` WHERE (b.id LIKE ? OR u.username LIKE ? OR b.destination LIKE ? 
                 OR b.created_date LIKE ? OR b.sending_date LIKE ?)`
      params = Array(5).fill(`%${searchTerm}%`)
    } else {
      query += ` WHERE (c.emetteur LIKE ? OR c.code_banque LIKE ? OR c.num_cheque LIKE ? 
                 OR c.montant LIKE ? OR c.num_facture LIKE ? OR c.client LIKE ?)`
      params = Array(6).fill(`%${searchTerm}%`)
    }

    query += ` GROUP BY b.id ORDER BY b.created_at DESC`

    this.db.all(query, params, (err, rows) => {
      if (err) {
        callback(err, null)
        return
      }

      const bordereaux = rows.map((row) => ({
        id: row.id,
        user: row.username,
        destination: row.destination,
        sendingDate: row.sending_date,
        createdDate: row.created_date,
        cheques: row.cheques_data
          ? row.cheques_data.split(";").map((chequeStr) => {
              const [id, emetteur, codeBanque, numCheque, montant, numFacture, client] = chequeStr.split("|")
              return {
                id,
                emetteur,
                codeBanque,
                numCheque,
                montant: Number.parseFloat(montant),
                numFacture,
                client
              }
            })
          : [],
      }))

      callback(null, bordereaux)
    })
  }

  close() {
    this.db.close()
  }
}

module.exports = Database
