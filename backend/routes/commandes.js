const express = require('express');
const { all, get, run } = require('../db/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const STATUTS = ['en_attente', 'en_preparation', 'pret', 'livree', 'annulee'];

async function getCommandeComplete(id) {
  const commande = await get(
    `SELECT c.*, u.nom AS client_nom, u.email AS client_email, r.nom AS restaurant_nom, r.emoji AS restaurant_emoji
     FROM commandes c
     JOIN users u ON u.id = c.user_id
     JOIN restaurants r ON r.id = c.restaurant_id
     WHERE c.id = ?`,
    [id]
  );
  if (!commande) return null;
  commande.items = await all('SELECT * FROM commande_items WHERE commande_id = ?', [id]);
  return commande;
}

router.post('/', auth, async (req, res) => {
  try {
    const { items, adresse_livraison, adresse, telephone, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    const ids = items.map((item) => Number(item.platId || item.plat_id)).filter(Boolean);
    if (ids.length !== items.length) {
      return res.status(400).json({ message: 'Chaque item doit contenir platId' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const plats = await all(
      `SELECT p.*, r.frais_livraison FROM plats p JOIN restaurants r ON r.id = p.restaurant_id WHERE p.id IN (${placeholders}) AND p.disponible = 1`,
      ids
    );

    if (plats.length !== ids.length) {
      return res.status(400).json({ message: 'Un ou plusieurs plats sont indisponibles' });
    }

    const restaurantId = plats[0].restaurant_id;
    if (plats.some((plat) => plat.restaurant_id !== restaurantId)) {
      return res.status(400).json({ message: 'Une commande doit venir du même restaurant' });
    }

    const byId = new Map(plats.map((plat) => [plat.id, plat]));
    const orderItems = items.map((item) => {
      const platId = Number(item.platId || item.plat_id);
      const quantite = Math.max(1, Number(item.quantite || item.quantity || 1));
      const plat = byId.get(platId);
      return {
        plat_id: plat.id,
        nom_plat: plat.nom,
        prix_unitaire: plat.prix,
        quantite,
        total: plat.prix * quantite,
      };
    });

    const sousTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const fraisService = 200;
    const fraisLivraison = Number(plats[0].frais_livraison || 0);
    const total = sousTotal + fraisService + fraisLivraison;
    const numero = `CMD-${Date.now().toString().slice(-6)}`;

    await run('BEGIN TRANSACTION');
    try {
      const result = await run(
        `INSERT INTO commandes (numero, user_id, restaurant_id, sous_total, frais_service, frais_livraison, total, adresse_livraison, telephone, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [numero, req.user.id, restaurantId, sousTotal, fraisService, fraisLivraison, total, adresse_livraison || adresse || req.user.adresse || null, telephone || req.user.telephone || null, notes || null]
      );

      for (const item of orderItems) {
        await run(
          `INSERT INTO commande_items (commande_id, plat_id, nom_plat, prix_unitaire, quantite, total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [result.id, item.plat_id, item.nom_plat, item.prix_unitaire, item.quantite, item.total]
        );
      }

      await run('COMMIT');
      const commande = await getCommandeComplete(result.id);
      res.status(201).json({ message: 'Commande créée', commande });
    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur création commande', error: error.message });
  }
});

router.get('/mes-commandes', auth, async (req, res) => {
  try {
    const commandes = await all(
      `SELECT c.*, r.nom AS restaurant_nom, r.emoji AS restaurant_emoji
       FROM commandes c
       JOIN restaurants r ON r.id = c.restaurant_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    for (const commande of commandes) {
      commande.items = await all('SELECT * FROM commande_items WHERE commande_id = ?', [commande.id]);
    }

    res.json(commandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur historique commandes', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const commande = await getCommandeComplete(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable' });

    if (req.user.role !== 'admin' && commande.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    res.json(commande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur détail commande', error: error.message });
  }
});

router.patch('/:id/statut', auth, adminOnly, async (req, res) => {
  try {
    const { statut } = req.body;
    if (!STATUTS.includes(statut)) {
      return res.status(400).json({ message: `Statut invalide. Utiliser: ${STATUTS.join(', ')}` });
    }

    const result = await run(
      `UPDATE commandes SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [statut, req.params.id]
    );
    if (!result.changes) return res.status(404).json({ message: 'Commande introuvable' });

    res.json(await getCommandeComplete(req.params.id));
  } catch (error) {
    res.status(500).json({ message: 'Erreur changement statut', error: error.message });
  }
});

module.exports = router;
