const express = require('express');
const bcrypt = require('bcryptjs');
const { run, get } = require('../db/database');
const { auth, signToken } = require('../middleware/auth');

const router = express.Router();

function cleanUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, telephone, adresse } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe obligatoires' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    const exists = await get('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (exists) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await run(
      `INSERT INTO users (nom, email, password, role, telephone, adresse)
       VALUES (?, ?, ?, 'client', ?, ?)`,
      [nom, String(email).toLowerCase(), hashed, telephone || null, adresse || null]
    );

    const user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
    const token = signToken(user);

    res.status(201).json({ message: 'Compte créé', token, user: cleanUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur inscription', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe obligatoires' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = signToken(user);
    res.json({ message: 'Connexion réussie', token, user: cleanUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur connexion', error: error.message });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
