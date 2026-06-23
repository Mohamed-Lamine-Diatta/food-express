const express = require("express");
const router = express.Router();
const { all, get, run } = require("../database"); 
const { auth, adminOnly } = require("../middlewares/auth"); 

router.get("/restaurants/voir", async (req, res) => {
    try {
        const restaurants = await all("SELECT * FROM restaurants");
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ success: false, error: "Aucun restaurant trouvé" });
    }
});

router.post("/restaurants/ajouter", auth, adminOnly, async (req, res) => {
    try {
       
        const { nom, adresse, contact } = req.body; 

        if (!nom || !adresse) {
            return res.status(400).json({ success: false, error: "Veuillez renseigner (nom, adresse)" });
        }
        await run("INSERT INTO restaurants (nom, adresse, contact) VALUES (?, ?, ?)", [nom, adresse, contact || null]);
        res.status(200).json({ success: true, message: "Restaurant ajouté" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erreur lors de l'ajout du restaurant" });
    }
});

router.put("/restaurants/modifier/:id", auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, adresse, contact } = req.body;

        if (!id || !nom || !adresse) {
            return res.status(400).json({ success: false, error: "id, nom et adresse sont obligatoires" });
        }
        await run("UPDATE restaurants SET nom = ?, adresse = ?, contact = ? WHERE id = ?", [nom, adresse, contact || null, id]);
        res.json({ success: true, message: "Restaurant modifié avec succes" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erreur lors de la modification du restaurant" });
    }
});

router.delete("/restaurants/supprimer/:id", auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, error: "Renseigner l'identifiant du restaurant" });
        }

        await run("DELETE FROM restaurants WHERE id = ?", [id]);

        res.json({ success: true, message: "Restaurant supprimé" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erreur lors de la suppression du restaurant" });
    }
});

module.exports = router;

