//   Confirmation
(function () {
  const fmt = n => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
  const details = document.getElementById('confirmDetails');
  
  if (details) {
    const order = JSON.parse(localStorage.getItem('lastOrder') || 'null');
    
    details.innerHTML = order 
      ? `<div class="detail-row">
          <span>Numéro</span>
          <strong>#${order.numero || order.id || 'CMD-DEMO'}</strong>
         </div>
         <div class="detail-row">
          <span>Total</span>
          <strong>${fmt(order.total)}</strong>
         </div>
         <div class="detail-row">
          <span>Statut</span>
          <strong>En attente</strong>
         </div>` 
      : `<div class="detail-row">
          <span>Commande</span>
          <strong>Enregistrée</strong>
         </div>`;
  }
})();





// F3 - Historique
(function () {
  const fmt = n => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
  const statusMap = {
    en_attente: ['wait', '⏳ En attente'],
    en_preparation: ['prep', '🔄 En préparation'],
    pret: ['ready', '✅ Prêt'],
    livree: ['done', '✅ Livrée'],
    annulee: ['cancel', '❌ Annulée']
  };

  const fallbackOrders = [
    { numero: 'CMD-001', statut: 'pret', created_at: '2026-05-19 12:30', restaurant_nom: 'Le Baobab', total: 4700, items: [{ nom_plat: 'Thiéboudienne', quantite: 1 }, { nom_plat: 'Bissap Frais', quantite: 2 }] },
    { numero: 'CMD-002', statut: 'en_preparation', created_at: '2026-05-18 19:15', restaurant_nom: 'Dakar Burger', total: 7000, items: [{ nom_plat: 'Smash Burger', quantite: 2 }, { nom_plat: 'Frites', quantite: 1 }] },
    { numero: 'CMD-003', statut: 'en_attente', created_at: '2026-05-17 13:00', restaurant_nom: 'Le Baobab', total: 4200, items: [{ nom_plat: 'Yassa Poulet', quantite: 1 }, { nom_plat: 'Mafé', quantite: 1 }] }
  ];

  const list = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  let orders = [];
  let filter = 'all';

  function renderOrders() {
    if (!list) return;
    list.innerHTML = '';
    const filtered = orders.filter(o => filter === 'all' || o.statut === filter);
    empty.hidden = filtered.length > 0;
    filtered.forEach(order => {
      const st = statusMap[order.statut] || statusMap.en_attente;
      const items = (order.items || []).map(i => `<span class="order-item">🍽️ ${i.nom_plat || i.nom || 'Plat'} x${i.quantite || 1}</span>`).join('');
      const card = document.createElement('article');
      card.className = 'panel order-card';
      card.innerHTML = `<div class="order-top"><div><div class="order-num">#${order.numero || order.id}</div><div class="order-date">${order.created_at || 'Aujourd’hui'}</div></div><span class="status ${st[0]}">${st[1]}</span></div><div class="order-items">${items}</div><div class="order-foot"><span class="order-resto">🏪 ${order.restaurant_nom || 'Restaurant'}</span><strong class="order-total">${fmt(order.total)}</strong><a class="btn-soft" href="restaurants.html">Recommander</a></div>`;
      list.appendChild(card);
    });
  }

  async function loadOrders() {
    if (!list) return;
    try {
      orders = window.Api?.getToken?.() ? await Api.getMesCommandes() : fallbackOrders;
    } catch (e) { orders = fallbackOrders; }
    renderOrders();
  }

  document.querySelectorAll('.hist-filters .pill').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.hist-filters .pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.status;
    renderOrders();
  }));
  loadOrders();
})();