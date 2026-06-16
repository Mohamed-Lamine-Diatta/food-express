const pills = document.querySelectorAll('.pill');
const restCards = document.querySelectorAll('.rest-card');

pills.forEach(pill => {
    pill.addEventListener('click', function() {
        
        pills.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        
        const categorie = this.textContent.trim();
        
        restCards.forEach(card => {
            const type = card.querySelector('p').textContent.toLowerCase();
            const cat = categorie.toLowerCase();
            
            if (cat.includes('tous')) {
                card.style.display = 'block';
            } else if (cat.includes('fast') && type.includes('fast')) {
                card.style.display = 'block';
            } else if (cat.includes('poisson') && type.includes('poisson')) {
                card.style.display = 'block';
            } else if (cat.includes('pizza') && type.includes('pizza')) {
                card.style.display = 'block';
            } else if (cat.includes('traditionnel') && (type.includes('sénégal') || type.includes('traditionnel'))) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
// FILTRAGE INDEX
const cats = document.querySelectorAll('.cat');
const cards = document.querySelectorAll('.card');

cats.forEach(cat => {
    cat.addEventListener('click', function() {
        
        cats.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        const categorie = this.textContent.trim().toLowerCase();
        
        cards.forEach(card => {
            const type = card.querySelector('p').textContent.toLowerCase();
            
            if (categorie.includes('tous')) {
                card.style.display = 'block';
            } else if (categorie.includes('burger') && type.includes('fast')) {
                card.style.display = 'block';
            } else if (categorie.includes('poisson') && type.includes('poisson')) {
                card.style.display = 'block';
            } else if (categorie.includes('pizza') && type.includes('pizza')) {
                card.style.display = 'block';
            } else if (categorie.includes('trad') && type.includes('sénégal')) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});