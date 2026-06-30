require('dotenv').config();

const path = require('path');
const express = require('express');
const { initDb } = require('./db/database');

const authRoutes = require('./routes/auth');
const restaurantsRoutes = require('./routes/restaurants');
const platsRoutes = require('./routes/plats');
const commandesRoutes = require('./routes/commandes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '../frontend');

// CORS simple, sans package externe.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.get('/api', (req, res) => {
  res.json({
    message: 'API Food Express OK',
    routes: ['/api/auth', '/api/restaurants', '/api/plats', '/api/commandes', '/api/admin'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/plats', platsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/admin', adminRoutes);

// Frontend servi par Express pour le déploiement Render.
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Si une route API n'existe pas, on renvoie une erreur JSON.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route API introuvable' });
});

// Pour les autres routes inconnues, on renvoie la page d'accueil.
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur Food Express lancé sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Impossible d’initialiser la base:', error);
    process.exit(1);
  });
