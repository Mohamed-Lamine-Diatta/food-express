// Petit fichier pour parler avec le backend Node/Express
// Backend attendu sur http://localhost:3000

// En local avec Live Server/file, utiliser localhost.
// En ligne sur Render, utiliser le même domaine que le site.
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : `${window.location.origin}/api`;

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Erreur serveur');
  }

  return data;
}

// ---------------- AUTH ----------------

async function register(nom, email, password, telephone = '', adresse = '') {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nom, email, password, telephone, adresse })
  });

  setToken(data.token);
  setUser(data.user);
  return data;
}

async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setToken(data.token);
  setUser(data.user);
  return data;
}

function logout() {
  removeToken();
  window.location.href = 'connexion.html';
}

async function me() {
  return request('/auth/me');
}

// ---------------- RESTAURANTS ----------------

async function getRestaurants(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/restaurants${query ? '?' + query : ''}`);
}

async function getRestaurant(id) {
  return request(`/restaurants/${id}`);
}

async function createRestaurant(restaurant) {
  return request('/restaurants', {
    method: 'POST',
    body: JSON.stringify(restaurant)
  });
}

async function updateRestaurant(id, restaurant) {
  return request(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(restaurant)
  });
}

async function deleteRestaurant(id) {
  return request(`/restaurants/${id}`, {
    method: 'DELETE'
  });
}

// ---------------- PLATS ----------------

async function getPlats(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/plats${query ? '?' + query : ''}`);
}

async function getPlat(id) {
  return request(`/plats/${id}`);
}

async function createPlat(plat) {
  return request('/plats', {
    method: 'POST',
    body: JSON.stringify(plat)
  });
}

async function updatePlat(id, plat) {
  return request(`/plats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plat)
  });
}

async function deletePlat(id) {
  return request(`/plats/${id}`, {
    method: 'DELETE'
  });
}

// ---------------- PANIER ----------------

function getPanier() {
  const panier = localStorage.getItem('panier');
  return panier ? JSON.parse(panier) : [];
}

function savePanier(panier) {
  localStorage.setItem('panier', JSON.stringify(panier));
}

function addToPanier(plat, quantite = 1) {
  const panier = getPanier();
  const found = panier.find(item => item.id === plat.id);

  if (found) {
    found.quantite += quantite;
  } else {
    panier.push({
      id: plat.id,
      nom: plat.nom,
      prix: plat.prix,
      emoji: plat.emoji,
      restaurant_id: plat.restaurant_id,
      restaurant_nom: plat.restaurant_nom,
      quantite
    });
  }

  savePanier(panier);
  return panier;
}

function updateQuantite(platId, quantite) {
  let panier = getPanier();

  if (quantite <= 0) {
    panier = panier.filter(item => item.id !== platId);
  } else {
    panier = panier.map(item => {
      if (item.id === platId) item.quantite = quantite;
      return item;
    });
  }

  savePanier(panier);
  return panier;
}

function clearPanier() {
  localStorage.removeItem('panier');
}

function getTotalPanier() {
  return getPanier().reduce((total, item) => total + item.prix * item.quantite, 0);
}

// ---------------- COMMANDES ----------------

async function createCommande(infos = {}) {
  const panier = getPanier();

  const items = panier.map(item => ({
    platId: item.id,
    quantite: item.quantite
  }));

  const data = await request('/commandes', {
    method: 'POST',
    body: JSON.stringify({
      items,
      adresse_livraison: infos.adresse_livraison || infos.adresse || '',
      telephone: infos.telephone || '',
      notes: infos.notes || ''
    })
  });

  clearPanier();
  return data;
}

async function getMesCommandes() {
  return request('/commandes/mes-commandes');
}

async function getCommande(id) {
  return request(`/commandes/${id}`);
}

// ---------------- ADMIN ----------------

async function getDashboard() {
  return request('/admin/dashboard');
}

async function getAdminCommandes(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/commandes${query ? '?' + query : ''}`);
}

async function updateStatutCommande(id, statut) {
  return request(`/admin/commandes/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut })
  });
}

async function getUtilisateurs() {
  return request('/admin/utilisateurs');
}

// On expose tout dans window pour pouvoir l'utiliser facilement dans les pages HTML
window.Api = {
  login,
  register,
  logout,
  me,
  getUser,
  getToken,

  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,

  getPlats,
  getPlat,
  createPlat,
  updatePlat,
  deletePlat,

  getPanier,
  addToPanier,
  updateQuantite,
  clearPanier,
  getTotalPanier,

  createCommande,
  getMesCommandes,
  getCommande,

  getDashboard,
  getAdminCommandes,
  updateStatutCommande,
  getUtilisateurs
};
