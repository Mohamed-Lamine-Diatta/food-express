// F3 - Confirmation
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