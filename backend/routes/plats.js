const express = require("express");
const router = express.Router();
const { all, get, run } = require("./database");
const { auth, adminOnly } = require("./middlewares/auth");

router.get("/plats/voir", async (req, res) => {
    try { 
        const plats = await all("SELECT * FROM plats");
        res.json(plats); 
    } catch (error) { 
        res.status(500).json({ success: false, error: "Aucun plats trouvés" });
    }
});
     
router.post("/plats/ajouter", auth, adminOnly, async (req, res) => {
    try { 
        const { nom, prix } = req.body;
        if (!nom || !prix) { 
            return res.status(400).json({ success: false, error: "Champs obligatoires (nom, prix)" }); 
        } 
        await run("INSERT INTO plats (nom, prix) VALUES (?, ?)", [nom, prix]);
        res.status(200).json({ success: true, message: "Un plat a été ajouté" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Une erreur s'est produite lors de l'ajout du plat" });
    }
});

router.put("/plats/modifier/:id", auth, adminOnly, async (req, res) => { 
    try {
        const { id } = req.params; 
        const { nom, prix } = req.body; 
        if (!id || !nom || !prix) { 
            return res.status(400).json({ success: false, error: "Les champs (id, nom, prix) sont obligatoires" });
        } 
        await run("UPDATE plats SET nom = ?, prix = ? WHERE id = ?", [nom, prix, id]); 
        res.json({ success: true, message: "Plat modifié" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Une erreur s'est produite lors de la modification du plat" }); 
    }
});

router.delete("/plats/supprimer/:id", auth, adminOnly, async (req, res) => {
    try { 
        const { id } = req.params; 
        if (!id) { 
            return res.status(400).json({ success: false, error: "Veuiller renseigner l'identifiant du plat" }); 
        } 
        await run("DELETE FROM plats WHERE id = ?", [id]);
        res.json({ success: true, message: "Plat supprimé" }); 
    } catch (error) { 
        res.status(500).json({ success: false, error: "Une erreur s'est produite lors de la suppression du plat" });
    }
});


 
module.exports = router;
