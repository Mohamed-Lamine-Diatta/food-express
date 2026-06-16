require('dotenv').config();

const express = require('express');
const { initDb } = require('./db/database');

const authRoutes = require('./routes/auth');
const restaurantsRoutes = require('./routes/restaurants');
const platsRoutes = require('./routes/plats');
const commandesRoutes = require('./routes/commandes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
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

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur Food Express lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Impossible d’initialiser la base:', error);
    process.exit(1);
  });
