// F2 - Connexion + Panier connectés au backend
(function () {
  const fmt = n => ${Number(n || 0).toLocaleString('fr-FR')} FCFA;
  const params = new URLSearchParams(window.location.search);
  const nextPage = params.get('next');

  // Connexion / inscription
  const tabs = document.querySelectorAll('.auth-tabs button');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    loginForm?.classList.toggle('hidden', !isLogin);
    registerForm?.classList.toggle('hidden', isLogin);
  }));

  function showMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.className = form-msg ${ok ? 'ok' : 'err'};
  }

  function redirectAfterLogin(user) {
    if (nextPage) return nextPage;
    if (user?.role === 'admin') return 'admin-dashboard.html';
    return 'restaurants.html';
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('loginMsg');
    const fd = new FormData(loginForm);
    try {
      if (!window.Api) throw new Error('API indisponible');
      const data = await Api.login(fd.get('email'), fd.get('password'));
      showMsg(msg, 'Connexion réussie, redirection...', true);
      setTimeout(() => window.location.href = redirectAfterLogin(data.user), 700);
    } catch (err) {
      showMsg(msg, err.message || 'Connexion impossible', false);
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('registerMsg');
    const fd = new FormData(registerForm);
    try {
      const data = await Api.register(fd.get('nom'), fd.get('email'), fd.get('password'), fd.get('telephone'), fd.get('adresse'));
      showMsg(msg, 'Compte créé, redirection...', true);
      setTimeout(() => window.location.href = redirectAfterLogin(data.user), 700);
    } catch (err) {
      showMsg(msg, err.message || 'Inscription impossible', false);
    }
  });

  // Panier
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  function getCart() {
    if (window.Api?.getPanier) return Api.getPanier();
    return JSON.parse(localStorage.getItem('panier') || '[]');
  }

  function saveCart(cart) {
    localStorage.setItem('panier', JSON.stringify(cart));
  }

  function renderCart() {
    const cart = getCart();
    const empty = document.getElementById('cartEmpty');
    cartItems.innerHTML = '';
    empty.hidden = cart.length > 0;

    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = <div class="cart-emoji">${item.emoji || '🍽️'}</div><div><div class="cart-name">${item.nom}</div><div class="cart-price">${fmt(item.prix)} x ${item.quantite}</div></div><div class="qty"><button data-id="${item.id}" data-action="minus">−</button><strong>${item.quantite}</strong><button data-id="${item.id}" data-action="plus">+</button></div>;
      cartItems.appendChild(div);
    });

    const subtotal = cart.reduce((s, i) => s + Number(i.prix) * Number(i.quantite), 0);
    const service = cart.length ? 200 : 0;
    document.getElementById('subtotal').textContent = fmt(subtotal);
    document.getElementById('serviceFee').textContent = fmt(service);
    document.getElementById('cartTotal').textContent = fmt(subtotal + service);
  }

  cartItems.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const cart = getCart();
    const id = Number(btn.dataset.id);
    const found = cart.find(i => Number(i.id) === id);
    if (!found) return;
    found.quantite += btn.dataset.action === 'plus' ? 1 : -1;
    saveCart(cart.filter(i => i.quantite > 0));
    renderCart();
  });

  document.getElementById('confirmOrder')?.addEventListener('click', async () => {
    const msg = document.getElementById('cartMsg');
    const cart = getCart();
    if (!cart.length) return showMsg(msg, 'Votre panier est vide.', false);

    if (!window.Api?.getToken?.()) {
      showMsg(msg, 'Connectez-vous avant de confirmer la commande.', false);
      setTimeout(() => window.location.href = 'connexion.html?next=panier.html', 900);
      return;
    }

    const infos = {
      adresse_livraison: document.getElementById('deliveryAddress').value,
      telephone: document.getElementById('deliveryPhone').value
    };

    try {
      const data = await Api.createCommande(infos);
      localStorage.setItem('lastOrder', JSON.stringify(data.commande || data));
      window.location.href = 'confirmation.html';
    } catch (err) {
      showMsg(msg, ${err.message || 'Commande impossible'}. Vérifiez votre connexion., false);
    }
  });

  renderCart();
})();