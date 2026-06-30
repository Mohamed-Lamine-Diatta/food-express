Food Express est une application web de commande de repas en ligne. Le but du projet est de permettre à un utilisateur de consulter des restaurants, voir leurs menus, ajouter des plats au panier et passer une commande.

Le projet contient aussi une partie administrateur pour gérer les restaurants, les plats et les commandes.

## Objectif du projet

L’objectif est de créer une petite plateforme de commande de nourriture, un peu comme une version simple de Jumia Food ou Uber Eats, adaptée au contexte local.

L’utilisateur peut :

- voir les restaurants disponibles ;
- filtrer les restaurants par catégorie ;
- consulter les plats d’un restaurant ;
- ajouter des plats au panier ;
- passer une commande ;
- consulter l’historique de ses commandes.

L’administrateur peut :

- consulter un tableau de bord ;
- voir les commandes ;
- changer le statut d’une commande ;
- gérer les restaurants ;
- gérer les plats ;
- voir les utilisateurs inscrits.

## Pages prévues

Côté client :

- page d’accueil ;
- page connexion / inscription ;
- page restaurants ;
- page menu d’un restaurant ;
- page panier ;
- page historique des commandes ;
- page confirmation.

Côté administrateur :

- dashboard admin ;
- gestion des commandes ;
- gestion des plats.

## Technologies utilisées

Frontend :

- HTML ;
- CSS ;
- JavaScript.

Backend :

- Node.js ;
- Express.js ;
- SQLite ;
- JWT pour l’authentification.

## Structure du projet

```txt
food-express/
├── frontend/
│   ├── index.html
│   ├── restaurants.html
│   ├── menu.html
│   ├── panier.html
│   ├── historique.html
│   ├── connexion.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── server.js
│   ├── db/
│   ├── middleware/
│   └── routes/
│
├── GUIDE_EXECUTION.md
├── GUIDE_POSTMAN.md
├── GUIDE_POSTMAN.html
└── README.md
```

## Fonctionnalités principales

### Client

- inscription et connexion ;
- affichage des restaurants ;
- recherche et filtrage ;
- affichage des plats ;
- panier ;
- création de commande ;
- suivi des commandes.

### Administrateur

- tableau de bord ;
- liste des commandes ;
- modification du statut des commandes ;
- ajout, modification et suppression des restaurants ;
- ajout, modification et suppression des plats ;
- consultation des utilisateurs.

## Installation et lancement

### 1. Lancer le backend

Aller dans le dossier backend :

```bash
cd backend
```

Installer les dépendances :

```bash
npm install
```

Créer le fichier `.env` :

```bash
cp .env.example .env
```

Créer la base de données avec des données de test :

```bash
npm run seed
```

Lancer le serveur :

```bash
npm run dev
```

Si `npm run dev` ne marche pas, utiliser :

```bash
npm start
```

Le backend tourne sur :

```txt
http://localhost:3000
```

### 2. Lancer le frontend

Le frontend est en HTML/CSS/JS simple. On peut ouvrir directement :

```txt
frontend/index.html
```

Ou utiliser un serveur local :

```bash
cd frontend
npx serve .
```

## Comptes de test

Compte administrateur :

```txt
Email : admin@foodexpress.sn
Mot de passe : admin123
```

Compte client :

```txt
Email : fatou@email.com
Mot de passe : client123
```

## API

Le backend expose plusieurs routes pour gérer :

- l’authentification ;
- les restaurants ;
- les plats ;
- les commandes ;
- l’administration.