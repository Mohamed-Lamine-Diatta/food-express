const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

/**
 * Dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    res.status(200).json({
      users,
      products,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Liste des utilisateurs
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Supprimer un utilisateur
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: 'Utilisateur supprimé'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Tous les produits
 */
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Création produit
 */
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;