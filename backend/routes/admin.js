const express = require('express');
const { all, get, run } = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(auth, adminOnly);

router.get('/dashboard', async (req, res) => {
  try {
    const [commandes, users, restaurants, plats, ca, recentes] = await Promise.all([
      get('SELECT COUNT(*) AS total FROM commandes'),
      get('SELECT COUNT(*) AS total FROM users'),
      get('SELECT COUNT(*) AS total FROM restaurants WHERE actif = 1'),
      get('SELECT COUNT(*) AS total FROM plats'),
      get("SELECT COALESCE(SUM(total), 0) AS total FROM commandes WHERE statut != 'annulee'"),
      all(
        `SELECT c.*, u.nom AS client_nom, r.nom AS restaurant_nom
         FROM commandes c
         JOIN users u ON u.id = c.user_id
         JOIN restaurants r ON r.id = c.restaurant_id
         ORDER BY c.created_at DESC
         LIMIT 5`
      ),
    ]);

    res.json({
      stats: {
        commandes: commandes.total,
        utilisateurs: users.total,
        restaurants: restaurants.total,
        plats: plats.total,
        chiffre_affaires: ca.total,
      },
      commandes_recentes: recentes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur dashboard', error: error.message });
  }
});

router.get('/commandes', async (req, res) => {
  try {
    const { statut } = req.query;
    const params = [];
    let where = '';
    if (statut) {
      where = 'WHERE c.statut = ?';
      params.push(statut);
    }

    const commandes = await all(
      `SELECT c.*, u.nom AS client_nom, u.email AS client_email, r.nom AS restaurant_nom
       FROM commandes c
       JOIN users u ON u.id = c.user_id
       JOIN restaurants r ON r.id = c.restaurant_id
       ${where}
       ORDER BY c.created_at DESC`,
      params
    );

    for (const commande of commandes) {
      commande.items = await all('SELECT * FROM commande_items WHERE commande_id = ?', [commande.id]);
    }

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur commandes admin', error: error.message });
  }
});

router.patch('/commandes/:id/statut', async (req, res) => {
  try {
    const statuts = ['en_attente', 'en_preparation', 'pret', 'livree', 'annulee'];
    const { statut } = req.body;
    if (!statuts.includes(statut)) {
      return res.status(400).json({ message: `Statut invalide. Utiliser: ${statuts.join(', ')}` });
    }

    const result = await run('UPDATE commandes SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [statut, req.params.id]);
    if (!result.changes) return res.status(404).json({ message: 'Commande introuvable' });

    const commande = await get('SELECT * FROM commandes WHERE id = ?', [req.params.id]);
    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur modification statut', error: error.message });
  }
});

router.get('/utilisateurs', async (req, res) => {
  try {
    const users = await all('SELECT id, nom, email, role, telephone, adresse, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur utilisateurs', error: error.message });
  }
});

module.exports = router;
