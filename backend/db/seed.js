require('dotenv').config();

const bcrypt = require('bcryptjs');
const { initDb, run, get } = require('./database');

async function insertRestaurant(data) {
  const result = await run(
    `INSERT INTO restaurants (nom, description, categorie, adresse, telephone, emoji, note, temps_livraison, frais_livraison, image_bg, actif)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [data.nom, data.description, data.categorie, data.adresse, data.telephone, data.emoji, data.note, data.temps_livraison, data.frais_livraison, data.image_bg]
  );
  return result.id;
}

async function insertPlat(data) {
  await run(
    `INSERT INTO plats (restaurant_id, nom, description, categorie, prix, emoji, tags, disponible, populaire)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.restaurant_id, data.nom, data.description, data.categorie, data.prix, data.emoji, JSON.stringify(data.tags || []), data.disponible === false ? 0 : 1, data.populaire ? 1 : 0]
  );
}

async function seed() {
  await initDb();

  console.log('Nettoyage des anciennes données...');
  await run('DELETE FROM commande_items');
  await run('DELETE FROM commandes');
  await run('DELETE FROM plats');
  await run('DELETE FROM restaurants');
  await run('DELETE FROM users');
  await run("DELETE FROM sqlite_sequence WHERE name IN ('users','restaurants','plats','commandes','commande_items')");

  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  await run(
    `INSERT INTO users (nom, email, password, role, telephone, adresse) VALUES
     (?, ?, ?, 'admin', ?, ?),
     (?, ?, ?, 'client', ?, ?)`,
    [
      'Administrateur', 'admin@foodexpress.sn', adminPassword, '770000000', 'Dakar Plateau',
      'Fatou Sow', 'fatou@email.com', clientPassword, '771112233', 'Point E, Dakar',
    ]
  );

  const baobabId = await insertRestaurant({
    nom: 'Le Baobab',
    description: 'Cuisine sénégalaise traditionnelle',
    categorie: 'Traditionnel',
    adresse: 'Plateau, Dakar',
    telephone: '338001001',
    emoji: '🍛',
    note: 4.9,
    temps_livraison: '25-35 min',
    frais_livraison: 1000,
    image_bg: 'linear-gradient(135deg,#2A1500,#1A0800)',
  });

  const burgerId = await insertRestaurant({
    nom: 'Dakar Burger',
    description: 'Fast-food • Burgers & Frites',
    categorie: 'Fast-food',
    adresse: 'Mermoz, Dakar',
    telephone: '338002002',
    emoji: '🍔',
    note: 4.5,
    temps_livraison: '15-25 min',
    frais_livraison: 800,
    image_bg: 'linear-gradient(135deg,#2A0000,#1A0000)',
  });

  const aminataId = await insertRestaurant({
    nom: 'Chez Aminata',
    description: 'Spécialités poisson grillé et fruits de mer',
    categorie: 'Poisson',
    adresse: 'Yoff, Dakar',
    telephone: '338003003',
    emoji: '🐟',
    note: 4.7,
    temps_livraison: '30-40 min',
    frais_livraison: 1200,
    image_bg: 'linear-gradient(135deg,#001A2A,#000A1A)',
  });

  const pizzaId = await insertRestaurant({
    nom: 'Pizza Teranga',
    description: 'Pizzas maison et boissons fraîches',
    categorie: 'Pizza',
    adresse: 'Almadies, Dakar',
    telephone: '338004004',
    emoji: '🍕',
    note: 4.3,
    temps_livraison: '20-30 min',
    frais_livraison: 900,
    image_bg: 'linear-gradient(135deg,#002A00,#001A00)',
  });

  await insertPlat({ restaurant_id: baobabId, nom: 'Thiéboudienne', description: 'Riz au poisson traditionnel, légumes mijotés', categorie: 'Plats', prix: 2500, emoji: '🍛', tags: ['🔥 Best-seller', '🐟 Poisson'], populaire: true });
  await insertPlat({ restaurant_id: baobabId, nom: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons', categorie: 'Plats', prix: 2000, emoji: '🍗', tags: ['🍋 Citron'], populaire: true });
  await insertPlat({ restaurant_id: baobabId, nom: 'Mafé', description: 'Sauce arachide avec viande et riz blanc', categorie: 'Plats', prix: 2200, emoji: '🥘', tags: ['🥜 Arachide'] });
  await insertPlat({ restaurant_id: baobabId, nom: 'Bissap Frais', description: 'Jus de fleur d’hibiscus naturel', categorie: 'Boissons', prix: 500, emoji: '🥤', tags: ['🌺 Naturel'], populaire: true });
  await insertPlat({ restaurant_id: baobabId, nom: 'Thiakry', description: 'Dessert sénégalais au couscous sucré et yaourt', categorie: 'Desserts', prix: 800, emoji: '🍮', tags: ['🍯 Sucré'] });

  await insertPlat({ restaurant_id: burgerId, nom: 'Smash Burger', description: 'Double steak, cheddar, sauce maison', categorie: 'Plats', prix: 3000, emoji: '🍔', tags: ['🔥 Best-seller'], populaire: true });
  await insertPlat({ restaurant_id: burgerId, nom: 'Frites Maison', description: 'Frites croustillantes', categorie: 'Entrées', prix: 1000, emoji: '🍟', tags: ['🥔 Maison'] });
  await insertPlat({ restaurant_id: burgerId, nom: 'Soda', description: 'Boisson gazeuse fraîche', categorie: 'Boissons', prix: 700, emoji: '🥤', tags: [] });

  await insertPlat({ restaurant_id: aminataId, nom: 'Poisson Braisé', description: 'Poisson frais grillé avec marinade', categorie: 'Plats', prix: 3500, emoji: '🐟', tags: ['🔥 Grillé'], populaire: true });
  await insertPlat({ restaurant_id: aminataId, nom: 'Crevettes sautées', description: 'Crevettes à l’ail et légumes', categorie: 'Plats', prix: 4500, emoji: '🍤', tags: ['🧄 Ail'] });

  await insertPlat({ restaurant_id: pizzaId, nom: 'Pizza Teranga', description: 'Pizza viande hachée, fromage et sauce tomate', categorie: 'Plats', prix: 4000, emoji: '🍕', tags: ['🧀 Fromage'], populaire: true });
  await insertPlat({ restaurant_id: pizzaId, nom: 'Pizza Végétarienne', description: 'Légumes frais, fromage, olives', categorie: 'Plats', prix: 3500, emoji: '🥗', tags: ['🌱 Veggie'] });

  const client = await get("SELECT id FROM users WHERE email = 'fatou@email.com'");
  const numero = 'CMD-001';
  const sousTotal = 2500 + 1000;
  const fraisService = 200;
  const fraisLivraison = 1000;
  const total = sousTotal + fraisService + fraisLivraison;
  const order = await run(
    `INSERT INTO commandes (numero, user_id, restaurant_id, statut, sous_total, frais_service, frais_livraison, total, adresse_livraison, telephone)
     VALUES (?, ?, ?, 'pret', ?, ?, ?, ?, ?, ?)`,
    [numero, client.id, baobabId, sousTotal, fraisService, fraisLivraison, total, 'Point E, Dakar', '771112233']
  );
  await run(`INSERT INTO commande_items (commande_id, plat_id, nom_plat, prix_unitaire, quantite, total) VALUES (?, 1, 'Thiéboudienne', 2500, 1, 2500)`, [order.id]);
  await run(`INSERT INTO commande_items (commande_id, plat_id, nom_plat, prix_unitaire, quantite, total) VALUES (?, 4, 'Bissap Frais', 500, 2, 1000)`, [order.id]);

  console.log('Seed terminé ✅');
  console.log('Admin  : admin@foodexpress.sn / admin123');
  console.log('Client : fatou@email.com / client123');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur seed:', error);
    process.exit(1);
  });


