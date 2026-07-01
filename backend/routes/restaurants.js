const express = require('express');
const { all, get, run } = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, categorie, populaire } = req.query;
    const conditions = ['actif = 1'];
    const params = [];

    if (q) {
      conditions.push('(nom LIKE ? OR description LIKE ? OR categorie LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (categorie && categorie !== 'Tous') {
      conditions.push('categorie LIKE ?');
      params.push(`%${categorie}%`);
    }

    let sql = `SELECT * FROM restaurants WHERE ${conditions.join(' AND ')} ORDER BY note DESC, nom ASC`;
    if (populaire === 'true') sql += ' LIMIT 4';

    const restaurants = await all(sql, params);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Erreur liste restaurants', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const restaurant = await get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant introuvable' });

    const plats = await all(
      'SELECT * FROM plats WHERE restaurant_id = ? AND disponible = 1 ORDER BY categorie, nom',
      [req.params.id]
    );

    res.json({ ...restaurant, plats });
  } catch (error) {
    res.status(500).json({ message: 'Erreur détail restaurant', error: error.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { nom, description, categorie, adresse, telephone, emoji, note, temps_livraison, frais_livraison, image_bg, actif } = req.body;
    if (!nom || !categorie) return res.status(400).json({ message: 'Nom et catégorie obligatoires' });

    const result = await run(
      `INSERT INTO restaurants (nom, description, categorie, adresse, telephone, emoji, note, temps_livraison, frais_livraison, image_bg, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, description || null, categorie, adresse || null, telephone || null, emoji || '🍽️', note || 4.5, temps_livraison || '25-35 min', frais_livraison || 1000, image_bg || null, actif === 0 ? 0 : 1]
    );

    const restaurant = await get('SELECT * FROM restaurants WHERE id = ?', [result.id]);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création restaurant', error: error.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const current = await get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Restaurant introuvable' });

    const data = { ...current, ...req.body };
    await run(
      `UPDATE restaurants SET nom=?, description=?, categorie=?, adresse=?, telephone=?, emoji=?, note=?, temps_livraison=?, frais_livraison=?, image_bg=?, actif=? WHERE id=?`,
      [data.nom, data.description, data.categorie, data.adresse, data.telephone, data.emoji, data.note, data.temps_livraison, data.frais_livraison, data.image_bg, data.actif, req.params.id]
    );

    const restaurant = await get('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Erreur modification restaurant', error: error.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const result = await run('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Restaurant introuvable' });
    res.json({ message: 'Restaurant supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression restaurant', error: error.message });
  }
});

module.exports = router;