// F5 - Menu + Admin commandes connectés au backend
(function () {
  const fmt = n => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
  const labels = {
    en_attente: ['wait', 'En attente'],
    en_preparation: ['prep', 'En préparation'],
    pret: ['ready', 'Prêt'],
    livree: ['done', 'Livrée'],
    annulee: ['cancel', 'Annulée']
  };

  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function parseTags(tags) {
    if (Array.isArray(tags)) return tags;
    try { return JSON.parse(tags || '[]'); } catch { return []; }
  }

  const fallbackDishes = [
    { id: 1, nom: 'Thiéboudienne', description: 'Riz au poisson traditionnel, légumes mijotés', categorie: 'Plats', prix: 2500, emoji: '🍛', tags: ['🔥 Best-seller', '🐟 Poisson'], restaurant_id: 1, restaurant_nom: 'Le Baobab' },
    { id: 2, nom: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons', categorie: 'Plats', prix: 2000, emoji: '🍗', tags: ['🍋 Citron'], restaurant_id: 1, restaurant_nom: 'Le Baobab' },
    { id: 4, nom: 'Bissap Frais', description: 'Jus de fleur d’hibiscus naturel', categorie: 'Boissons', prix: 500, emoji: '🥤', tags: ['🌺 Naturel'], restaurant_id: 1, restaurant_nom: 'Le Baobab' },
    { id: 5, nom: 'Thiakry', description: 'Dessert sénégalais au couscous sucré et yaourt', categorie: 'Desserts', prix: 800, emoji: '🍮', tags: ['🍯 Sucré'], restaurant_id: 1, restaurant_nom: 'Le Baobab' }
  ];

  let dishes = fallbackDishes;
  let menuCat = 'tout';

  function updateCount() {
    const count = JSON.parse(localStorage.getItem('panier') || '[]').reduce((s, i) => s + Number(i.quantite || 0), 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count ? `(${count})` : '';
  }

  function updateRestaurantHero(restaurant) {
    if (!restaurant) return;
    const emoji = document.querySelector('.menu-rest-emoji');
    const title = document.querySelector('.menu-hero h1');
    const desc = document.querySelector('.menu-hero p');
    const badge = document.querySelector('.menu-hero .badge');
    if (emoji) emoji.textContent = restaurant.emoji || '🍽️';
    if (title) title.textContent = restaurant.nom || 'Restaurant';
    if (desc) desc.textContent = `${restaurant.description || restaurant.categorie || ''} • ${restaurant.adresse || 'Dakar'}`;
    if (badge) badge.textContent = `⭐ ${restaurant.note || 4.5} • ⏱ ${restaurant.temps_livraison || '25-35 min'}`;
  }

  function renderMenu() {
    const menuList = document.getElementById('menuList');
    if (!menuList) return;
    const filtered = dishes.filter(d => menuCat === 'tout' || normalize(d.categorie) === normalize(menuCat));
    document.getElementById('menuEmpty').hidden = filtered.length > 0;
    menuList.innerHTML = filtered.map(d => {
      const tags = parseTags(d.tags).map(t => `<span>${escapeHtml(t)}</span>`).join('');
      return `<article class="panel dish-card"><div class="dish-emoji">${d.emoji || '🍽️'}</div><div><div class="dish-name">${escapeHtml(d.nom)}</div><p class="dish-desc">${escapeHtml(d.description || '')}</p><div class="dish-tags">${tags}</div></div><div class="dish-side"><div class="price">${fmt(d.prix)}</div><button class="add-btn" data-id="${d.id}">+</button></div></article>`;
    }).join('');
  }

  document.querySelectorAll('.menu-filters .pill').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-filters .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    menuCat = btn.dataset.cat;
    renderMenu();
  }));

  document.getElementById('menuList')?.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    const dish = dishes.find(d => Number(d.id) === Number(btn.dataset.id));
    if (!dish) return;
    const plat = { ...dish, tags: parseTags(dish.tags), restaurant_nom: dish.restaurant_nom || document.querySelector('.menu-hero h1')?.textContent || 'Restaurant' };
    Api.addToPanier(plat, 1);
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = '+', 600);
    updateCount();
  });

  async function loadMenuFromApi() {
    if (!document.getElementById('menuList')) return;
    const restaurantId = new URLSearchParams(window.location.search).get('restaurant') || '1';
    try {
      const restaurant = await Api.getRestaurant(restaurantId);
      updateRestaurantHero(restaurant);
      dishes = (restaurant.plats || []).map(p => ({ ...p, restaurant_nom: restaurant.nom }));
    } catch (e) {
      console.warn('API menu indisponible, menu local utilisé.', e.message);
      updateRestaurantHero({ nom: 'Le Baobab', description: 'Cuisine sénégalaise traditionnelle', adresse: 'Plateau, Dakar', emoji: '🍛', note: 4.9, temps_livraison: '25-35 min' });
      dishes = fallbackDishes;
    }
    renderMenu();
    updateCount();
  }

  renderMenu();
  updateCount();
  loadMenuFromApi();

  // Admin commandes
  let orders = [
    { id: 1, numero: 'CMD-001', client_nom: 'Fatou Sow', restaurant_nom: 'Le Baobab', total: 4700, statut: 'en_attente' },
    { id: 2, numero: 'CMD-002', client_nom: 'Ousmane Ba', restaurant_nom: 'Dakar Burger', total: 7000, statut: 'en_preparation' },
    { id: 3, numero: 'CMD-003', client_nom: 'Aissatou Diop', restaurant_nom: 'Chez Aminata', total: 3500, statut: 'pret' }
  ];
  let statusFilter = 'all';

  function renderAdminOrders() {
    const body = document.getElementById('adminOrdersBody');
    if (!body) return;
    body.innerHTML = orders.filter(o => statusFilter === 'all' || o.statut === statusFilter).map(o => {
      const st = labels[o.statut] || labels.en_attente;
      const opts = Object.keys(labels).map(s => `<option value="${s}" ${s === o.statut ? 'selected' : ''}>${labels[s][1]}</option>`).join('');
      return `<tr><td>#${escapeHtml(o.numero)}</td><td>${escapeHtml(o.client_nom || o.client_email || 'Client')}</td><td>${escapeHtml(o.restaurant_nom || 'Restaurant')}</td><td><strong class="price">${fmt(o.total)}</strong></td><td><span class="status ${st[0]}">${st[1]}</span></td><td><select class="status-select" data-id="${o.id}">${opts}</select></td></tr>`;
    }).join('');
  }

  async function loadAdminOrders() {
    if (!document.getElementById('adminOrdersBody')) return;
    try {
      if (Api.getToken()) orders = await Api.getAdminCommandes();
    } catch (e) {
      console.warn('API admin commandes indisponible, données locales utilisées.', e.message);
    }
    renderAdminOrders();
  }

  document.querySelectorAll('.admin-order-filters .pill').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-order-filters .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    statusFilter = btn.dataset.status;
    renderAdminOrders();
  }));

  document.getElementById('adminOrdersBody')?.addEventListener('change', async e => {
    const select = e.target.closest('.status-select');
    if (!select) return;
    const oldOrders = JSON.parse(JSON.stringify(orders));
    const order = orders.find(o => Number(o.id) === Number(select.dataset.id));
    if (order) order.statut = select.value;
    renderAdminOrders();
    try {
      if (Api.getToken()) await Api.updateStatutCommande(select.dataset.id, select.value);
    } catch (e) {
      alert('Statut modifié seulement sur l’interface. Connectez-vous en admin pour modifier dans la base.');
      orders = oldOrders;
      renderAdminOrders();
    }
  });
  loadAdminOrders();
})();
