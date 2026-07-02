// F1 - Accueil + Restaurants connectés au backend
(function () {
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  const fallbackRestaurants = [
    { id: 1, nom: 'Le Baobab', description: 'Cuisine sénégalaise traditionnelle', categorie: 'Traditionnel', emoji: '🍛', note: 4.9, temps_livraison: '25-35 min', image_bg: 'linear-gradient(135deg,#2A1500,#1A0800)' },
    { id: 2, nom: 'Dakar Burger', description: 'Fast-food • Burgers & Frites', categorie: 'Fast-food', emoji: '🍔', note: 4.5, temps_livraison: '15-25 min', image_bg: 'linear-gradient(135deg,#2A0000,#1A0000)' },
    { id: 3, nom: 'Chez Aminata', description: 'Poisson grillé • Yoff', categorie: 'Poisson', emoji: '🐟', note: 4.7, temps_livraison: '30-40 min', image_bg: 'linear-gradient(135deg,#001A2A,#000A1A)' },
    { id: 4, nom: 'Pizza Teranga', description: 'Pizzas maison • Almadies', categorie: 'Pizza', emoji: '🍕', note: 4.3, temps_livraison: '20-30 min', image_bg: 'linear-gradient(135deg,#002A00,#001A00)' }
  ];

  let restaurants = fallbackRestaurants;
  let homeCat = 'tous';
  let currentCat = 'tous';

  function restaurantCard(r) {
    const cat = normalize(r.categorie);
    const name = normalize(`${r.nom} ${r.description} ${r.categorie}`);
    const bg = r.image_bg || 'linear-gradient(135deg,#2A1500,#1A0800)';
    return `
      <article class="food-card restaurant-card" data-cat="${cat}" data-name="${name}">
        <div class="food-img" style="background:${bg}">${r.emoji || '🍽️'}<span class="rating">⭐ ${r.note || '4.5'}</span></div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(r.nom)}</h3>
          <p class="card-text">${escapeHtml(r.description || r.categorie || '')}</p>
          <div class="card-foot"><span>⏱ ${escapeHtml(r.temps_livraison || '25-35 min')}</span><a class="btn-fill" href="menu.html?restaurant=${r.id}">Voir</a></div>
        </div>
      </article>`;
  }

  function filterCards(cards, cat, search, emptyEl) {
    let visible = 0;
    cards.forEach(card => {
      const cardCat = normalize(card.dataset.cat);
      const cardName = normalize(card.dataset.name + ' ' + card.textContent);
      const okCat = cat === 'tous' || cardCat.includes(cat);
      const okSearch = !search || cardName.includes(search);
      card.style.display = okCat && okSearch ? '' : 'none';
      if (okCat && okSearch) visible++;
    });
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  function renderHome() {
    const popularList = document.getElementById('popularList');
    if (!popularList) return;
    popularList.innerHTML = restaurants.slice(0, 2).map(restaurantCard).join('');
    refreshHome();
  }

  function renderRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;
    grid.innerHTML = restaurants.map(restaurantCard).join('');
    refreshRestaurants();
  }

  function refreshHome() {
    const cards = document.querySelectorAll('#popularList .restaurant-card');
    const homeSearch = document.getElementById('homeSearch');
    filterCards(cards, homeCat, normalize(homeSearch?.value), null);
  }

  function refreshRestaurants() {
    const cards = document.querySelectorAll('#restaurantsGrid .restaurant-card');
    const restaurantSearch = document.getElementById('restaurantSearch');
    const restaurantsEmpty = document.getElementById('restaurantsEmpty');
    filterCards(cards, currentCat, normalize(restaurantSearch?.value), restaurantsEmpty);
  }

  document.querySelectorAll('.home-cats .cat-card').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.home-cats .cat-card').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    homeCat = normalize(btn.dataset.cat);
    refreshHome();
  }));

  document.getElementById('homeSearch')?.addEventListener('input', refreshHome);
  document.getElementById('homeSearchBtn')?.addEventListener('click', () => {
    const q = encodeURIComponent(document.getElementById('homeSearch').value.trim());
    window.location.href = q ? `restaurants.html?q=${q}` : 'restaurants.html';
  });

  document.querySelectorAll('#restaurantFilters .pill').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#restaurantFilters .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = normalize(btn.dataset.cat);
    refreshRestaurants();
  }));

  const restaurantSearch = document.getElementById('restaurantSearch');
  const urlQ = new URLSearchParams(window.location.search).get('q');
  if (restaurantSearch && urlQ) restaurantSearch.value = urlQ;
  restaurantSearch?.addEventListener('input', refreshRestaurants);

  async function loadRestaurantsFromApi() {
    try {
      if (window.Api?.getRestaurants) {
        restaurants = await Api.getRestaurants();
      }
    } catch (e) {
      console.warn('API restaurants indisponible, données locales utilisées.', e.message);
      restaurants = fallbackRestaurants;
    }
    renderHome();
    renderRestaurants();
  }

  renderHome();
  renderRestaurants();
  loadRestaurantsFromApi();
})();
