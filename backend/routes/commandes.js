const express=require("express");
const router=express.Router();
const commande=require("../models/commande");
const auth=require("../middleware/auth");
/**
 * CREER UNE COMMANDE
 */
router.post("/", auth, async (req, res)=>{
    try{
        const{
            produits,
            montantTotal,
            adresseLivraison,
        }=req.body;
        const commande=await commande.create({
            utilisateur:req.user.id,
            produits,
            montantTotal,
            adresseLivraison,
            statut: "En attente"
        });
        res.status(201).json({
            message:error.message
        });
    }
});
/**
 * LISTE DES COMMANDES DU CLIENT
 */
router.get("/",auth, async (req,res)=>
try{
    const commandes=await commande.find({
        utilisateur:req.user.id
    })
    .populate("utilisateur")
    .populate("produits.produit");
    res.json(commande);
    }catch(error) {
        res.status(500).json({
            message:error.message
        });
    }
});
/**
 * DETAIL D'UNE COMMANDE
 */
router.get("/:id",auth,async(req,res)=>{
    try{
        const commande=await commande.findById(req.params.id)
        .populate("utilisateur")
        .populate("produits.produit");
        if(!commande){
            return res.status(404).json({
                message:"commande introuvable"
            });
        }
        res.json(commande);

    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }

});
/**
 * MODIFIER LE STATUS
 * réservé a l'admin
 */
router.put("/:id/status",auth,async(req,res)=>{
    try{
        if (req.user.role!=="admin"){
            return res.status(403).json({
                message:"Accés interdit"
            });
        }
        const{status}=req.body;
        const commande=await commande.findByIdAndl
        req.params.id,
        {statut},
        {new:true};
        if(!commande){
            return res.status(404).json({
                message:"commande introuvable"
            });
        }
        res.json({
            message:"statut mis a jour",commande
        });
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
});
module.exportes=router;