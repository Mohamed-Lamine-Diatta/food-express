const express=require("express");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const router=express.Router();
/**
 * INSCRIPTION
 */
router.post("/register", async (req, res)=>{
    try{
        const { nom, email, password }= req.body;
        const userExists = await User.findOne({email});
        if (userExists){
            return res.status(400).json({
                message: "Email déja utilisé"
            });
        }
        const hashedPassword =await bcrypt.hash(password);
        const User=await User.create({
            nom,
            email,
            password: hashedPassword,
            role: "client"
        });
        res.status(200).json({
            message:"Utilisation Crée",user
        });
    }
catch(error) {
    res.status(500).json({
        message: error.message
    });
}
});
/**
 * CONNEXION
 */
router.post("/login", async (req, res)=>{
    try{
        const{email, password }=req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({
                message:"Utilisateur introuvable"
            });
        }
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if(!isMatch) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
            const token=jwt.sign(
                {
                    id:user._id,
                    role: user.role
                },
                process.env.jwt_SECRET,
                {
                    expiresIn:"7d"
                }
            );
            res.json({
                token,
                user: {
                    id:user._id,
                    nom:user.nom,
                    email:user.email,
                    role:user.role,
                }
        
}
catch (error) {
    res.status(500).json({
        message: error.message
    });
     }
});
module.exports=router;