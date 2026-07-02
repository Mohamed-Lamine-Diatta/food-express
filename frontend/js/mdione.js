// F4 - Admin Dashboard + Admin Plats connectés au backend
(function () {
  const fmt = n => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  const sampleOrders = [
    { numero: 'CMD-001', client_nom: 'Fatou Sow', total: 7200 },
    { numero: 'CMD-002', client_nom: 'Ousmane Ba', total: 4500 },
    { numero: 'CMD-003', client_nom: 'Aissatou', total: 2500 }
  ];

  async function loadDashboard() {
    const recent = document.getElementById('recentOrders');
    if (!recent) return;
    let data = null;
    try {
      if (window.Api?.getToken?.()) data = await Api.getDashboard();
    } catch (e) {
      console.warn('Dashboard API indisponible.', e.message);
    }
    if (data?.stats) {
      document.getElementById('statOrders').textContent = data.stats.commandes;
      document.getElementById('statUsers').textContent = data.stats.utilisateurs;
      document.getElementById('statRestaurants').textContent = data.stats.restaurants;
      document.getElementById('statRevenue').textContent = Math.round(data.stats.chiffre_affaires / 1000) + 'K';
    }
    const orders = data?.commandes_recentes?.length ? data.commandes_recentes : sampleOrders;
    recent.innerHTML = orders.map(o => `<div class="recent-item"><div><strong>#${escapeHtml(o.numero)}</strong><small>${escapeHtml(o.client_nom || 'Client')}</small></div><span class="price">${fmt(o.total)}</span></div>`).join('');
  }
  loadDashboard();

  let dishes = [
    { id: 1, nom: 'Thiéboudienne', prix: 2500, categorie: 'Plats', restaurant_nom: 'Le Baobab', restaurant_id: 1, emoji: '🍛', disponible: true },
    { id: 2, nom: 'Yassa Poulet', prix: 2000, categorie: 'Plats', restaurant_nom: 'Le Baobab', restaurant_id: 1, emoji: '🍗', disponible: true },
    { id: 3, nom: 'Smash Burger', prix: 3000, categorie: 'Plats', restaurant_nom: 'Dakar Burger', restaurant_id: 2, emoji: '🍔', disponible: true },
    { id: 4, nom: 'Bissap Frais', prix: 500, categorie: 'Boissons', restaurant_nom: 'Le Baobab', restaurant_id: 1, emoji: '🥤', disponible: false },
    { id: 5, nom: 'Thiakry', prix: 800, categorie: 'Desserts', restaurant_nom: 'Le Baobab', restaurant_id: 1, emoji: '🍮', disponible: true }
  ];

  const body = document.getElementById('dishesBody');
  let cat = 'tous';

  function renderDishes() {
    if (!body) return;
    const q = normalize(document.getElementById('dishSearch')?.value);
    body.innerHTML = dishes
      .filter(d => (cat === 'tous' || normalize(d.categorie) === cat) && (!q || normalize(d.nom).includes(q)))
      .map(d => `<tr><td><div class="dish-cell"><span>${d.emoji || '🍽️'}</span><strong>${escapeHtml(d.nom)}</strong></div></td><td><strong class="price">${fmt(d.prix)}</strong></td><td>${escapeHtml(d.categorie)}</td><td>${escapeHtml(d.restaurant_nom || 'Restaurant')}</td><td><span class="status ${d.disponible ? 'done' : 'cancel'}">${d.disponible ? 'Dispo' : 'Non dispo'}</span></td><td><button class="action-btn" data-toggle="${d.id}" title="Changer disponibilité">✏️</button><button class="action-btn delete" data-delete="${d.id}" title="Supprimer">🗑</button></td></tr>`)
      .join('');
  }

  async function loadDishesFromApi() {
    if (!body) return;
    try {
      const apiDishes = await Api.getPlats();
      dishes = apiDishes.map(d => ({ ...d, disponible: Boolean(d.disponible) }));
    } catch (e) {
      console.warn('API plats indisponible, données locales utilisées.', e.message);
    }
    renderDishes();
  }

  document.getElementById('showDishForm')?.addEventListener('click', () => {
    const form = document.getElementById('dishForm');
    form.hidden = !form.hidden;
  });

  document.getElementById('dishForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newDish = {
      restaurant_id: 1,
      nom: fd.get('nom'),
      prix: Number(fd.get('prix')),
      categorie: fd.get('categorie'),
      description: fd.get('description') || '',
      emoji: fd.get('emoji') || '🍽️',
      tags: [],
      disponible: 1,
      populaire: 0
    };
    try {
      if (Api.getToken()) {
        const created = await Api.createPlat(newDish);
        dishes.push({ ...created, restaurant_nom: created.restaurant_nom || 'Le Baobab' });
      } else {
        alert('Plat ajouté seulement sur l’interface. Connectez-vous en admin pour enregistrer dans la base.');
        dishes.push({ id: Date.now(), ...newDish, restaurant_nom: 'Le Baobab', disponible: true });
      }
    } catch (err) {
      alert(err.message || 'Erreur ajout plat');
      return;
    }
    e.target.reset();
    e.target.hidden = true;
    renderDishes();
  });

  document.getElementById('dishSearch')?.addEventListener('input', renderDishes);
  document.querySelectorAll('.dish-filters .pill').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.dish-filters .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cat = normalize(btn.dataset.cat);
    renderDishes();
  }));

  body?.addEventListener('click', async e => {
    const del = e.target.closest('[data-delete]');
    const tog = e.target.closest('[data-toggle]');
    if (del) {
      const id = Number(del.dataset.delete);
      if (!confirm('Supprimer ce plat ?')) return;
      const before = [...dishes];
      dishes = dishes.filter(d => Number(d.id) !== id);
      renderDishes();
      try { if (Api.getToken()) await Api.deletePlat(id); }
      catch (err) { dishes = before; renderDishes(); alert(err.message || 'Suppression impossible'); }
    }
    if (tog) {
      const id = Number(tog.dataset.toggle);
      const d = dishes.find(x => Number(x.id) === id);
      if (!d) return;
      const old = d.disponible;
      d.disponible = !d.disponible;
      renderDishes();
      try {
        if (Api.getToken()) await Api.updatePlat(id, { ...d, disponible: d.disponible ? 1 : 0 });
      } catch (err) {
        d.disponible = old;
        renderDishes();
        alert(err.message || 'Modification impossible');
      }
    }
  });

  loadDishesFromApi();
})();
