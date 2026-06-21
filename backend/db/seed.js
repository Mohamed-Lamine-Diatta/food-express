require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connexion MongoDB réussie');

    await User.deleteMany();
    await Restaurant.deleteMany();
    await Product.deleteMany();

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@foodapp.com',
      password: 'admin123',
      role: 'admin'
    });

    const restaurant = await Restaurant.create({
      name: 'Fast Food Dakar',
      address: 'Dakar Centre',
      phone: '+221770000000'
    });

    await Product.insertMany([
      {
        name: 'Burger',
        price: 3500,
        description: 'Burger maison',
        restaurant: restaurant._id
      },
      {
        name: 'Pizza',
        price: 5000,
        description: 'Pizza fromage',
        restaurant: restaurant._id
      },
      {
        name: 'Tacos',
        price: 4000,
        description: 'Tacos poulet',
        restaurant: restaurant._id
      }
    ]);

    console.log('Base de données initialisée');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();