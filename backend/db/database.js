const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'food_express.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur connexion SQLite:', err.message);
  } else {
    console.log(`Base SQLite connectée: ${DB_PATH}`);
  }
});

db.run('PRAGMA foreign_keys = ON');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'admin')),
      telephone TEXT,
      adresse TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      description TEXT,
      categorie TEXT NOT NULL,
      adresse TEXT,
      telephone TEXT,
      emoji TEXT DEFAULT '🍽️',
      note REAL DEFAULT 4.5,
      temps_livraison TEXT DEFAULT '25-35 min',
      frais_livraison INTEGER DEFAULT 1000,
      image_bg TEXT,
      actif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS plats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      nom TEXT NOT NULL,
      description TEXT,
      categorie TEXT NOT NULL DEFAULT 'Plats',
      prix INTEGER NOT NULL,
      emoji TEXT DEFAULT '🍽️',
      tags TEXT DEFAULT '[]',
      disponible INTEGER DEFAULT 1,
      populaire INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS commandes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      restaurant_id INTEGER NOT NULL,
      statut TEXT NOT NULL DEFAULT 'en_attente'
        CHECK(statut IN ('en_attente', 'en_preparation', 'pret', 'livree', 'annulee')),
      sous_total INTEGER NOT NULL,
      frais_service INTEGER NOT NULL DEFAULT 200,
      frais_livraison INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      adresse_livraison TEXT,
      telephone TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS commande_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commande_id INTEGER NOT NULL,
      plat_id INTEGER NOT NULL,
      nom_plat TEXT NOT NULL,
      prix_unitaire INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      total INTEGER NOT NULL,
      FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
      FOREIGN KEY (plat_id) REFERENCES plats(id)
    )
  `);
}

module.exports = { db, run, get, all, initDb };
