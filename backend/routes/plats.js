const express = require('express');
const { all, get, run } = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

function normalizePlat(plat) {
  if (!plat) return null;
  return {
    ...plat,
    tags: safeJson(plat.tags),
    disponible: Boolean(plat.disponible),
    populaire: Boolean(plat.populaire),
  };
}

function safeJson(value) {
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

router.get('/', async (req, res) => {
  try {
    const { restaurantId, categorie, q, disponible, populaire } = req.query;
    const conditions = ['1 = 1'];
    const params = [];

    if (restaurantId) {
      conditions.push('p.restaurant_id = ?');
      params.push(restaurantId);
    }
    if (categorie && categorie !== 'Tout' && categorie !== 'Tous') {
      conditions.push('p.categorie LIKE ?');
      params.push(`%${categorie}%`);
    }
    if (q) {
      conditions.push('(p.nom LIKE ? OR p.description LIKE ? OR r.nom LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (disponible === 'true') conditions.push('p.disponible = 1');
    if (populaire === 'true') conditions.push('p.populaire = 1');

    const rows = await all(
      `SELECT p.*, r.nom AS restaurant_nom, r.categorie AS restaurant_categorie
       FROM plats p
       JOIN restaurants r ON r.id = p.restaurant_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.populaire DESC, p.categorie ASC, p.nom ASC`,
      params
    );

    res.json(rows.map(normalizePlat));
  } catch (error) {
    res.status(500).json({ message: 'Erreur liste plats', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plat = await get(
      `SELECT p.*, r.nom AS restaurant_nom FROM plats p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!plat) return res.status(404).json({ message: 'Plat introuvable' });
    res.json(normalizePlat(plat));
  } catch (error) {
    res.status(500).json({ message: 'Erreur détail plat', error: error.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { restaurant_id, nom, description, categorie, prix, emoji, tags, disponible, populaire } = req.body;
    if (!restaurant_id || !nom || !prix) return res.status(400).json({ message: 'restaurant_id, nom et prix obligatoires' });

    const restaurant = await get('SELECT id FROM restaurants WHERE id = ?', [restaurant_id]);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant introuvable' });

    const result = await run(
      `INSERT INTO plats (restaurant_id, nom, description, categorie, prix, emoji, tags, disponible, populaire)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [restaurant_id, nom, description || null, categorie || 'Plats', prix, emoji || '🍽️', JSON.stringify(tags || []), disponible === 0 ? 0 : 1, populaire ? 1 : 0]
    );

    const plat = await get('SELECT * FROM plats WHERE id = ?', [result.id]);
    res.status(201).json(normalizePlat(plat));
  } catch (error) {
    res.status(500).json({ message: 'Erreur création plat', error: error.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const current = await get('SELECT * FROM plats WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Plat introuvable' });

    const data = { ...current, ...req.body };
    await run(
      `UPDATE plats SET restaurant_id=?, nom=?, description=?, categorie=?, prix=?, emoji=?, tags=?, disponible=?, populaire=? WHERE id=?`,
      [data.restaurant_id, data.nom, data.description, data.categorie, data.prix, data.emoji, JSON.stringify(Array.isArray(data.tags) ? data.tags : safeJson(data.tags)), data.disponible ? 1 : 0, data.populaire ? 1 : 0, req.params.id]
    );

    const plat = await get('SELECT * FROM plats WHERE id = ?', [req.params.id]);
    res.json(normalizePlat(plat));
  } catch (error) {
    res.status(500).json({ message: 'Erreur modification plat', error: error.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await run('DELETE FROM plats WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Plat introuvable' });
    res.json({ message: 'Plat supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression plat', error: error.message });
  }
});

module.exports = router;