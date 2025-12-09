# Toodoz Backend

Serveur Node.js/Express securise pour l'application To-Do list collaborative.

## Prerequis

- Node.js 20+
- MySQL 8+
- Base de donnees `toodoz` creee (`CREATE DATABASE toodoz;`)

## Installation

```bash
cd server
npm install
```

## Configuration

Copiez `.env.example` vers `.env`, puis ajustez les valeurs :

```
DB_HOST=localhost
DB_USER=root
DB_PASS=secret
DB_NAME=toodoz
DB_PORT=3306
FRONT_ORIGIN=http://localhost:5173
SESSION_DAYS=7
NODE_ENV=development
PORT=4000
```

## Lancement

```bash
npm run dev
```

Le serveur ecoute par defaut sur `http://localhost:4000`. La connexion MySQL est verifiee et `sequelize.sync()` cree/ajuste les tables.

## Flux CSRF

1. Appeler `GET /auth/csrf-token` pour recuperer `csrfToken` (et stocker les cookies de session).
2. Inclure `X-CSRF-Token: <valeur>` dans toutes les requetes **POST/PATCH/DELETE**.
3. Toujours envoyer les cookies (`withCredentials` / `curl -b -c`), car la session est stockee en base et liee au cookie `sid`.

Chaque reponse de `register`, `login` et `logout` renvoie un token CSRF rafraichi : utilisez-le pour la requete suivante.

## Exemple rapide via cURL

```bash
# 1) Recuperer un token CSRF (cookies dans cookies.txt)
curl -c cookies.txt http://localhost:4000/auth/csrf-token

# 2) Inscription
curl -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrfToken etape 1>" \
  -d '{"email":"alice@example.com","password":"SuperSecret1!","name":"Alice"}' \
  http://localhost:4000/auth/register

# 3) Connexion
curl -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <nouveau csrfToken>" \
  -d '{"email":"alice@example.com","password":"SuperSecret1!"}' \
  http://localhost:4000/auth/login

# 4) Creation d'une liste
curl -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <dernier csrfToken>" \
  -d '{"name":"Projet Web","type":"work"}' \
  http://localhost:4000/lists

# 5) Creation d'une tache
curl -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <dernier csrfToken>" \
  -d '{"listId":1,"title":"Preparer la demo","status":"todo","priority":"med"}' \
  http://localhost:4000/tasks
```

## Scripts utiles

- `npm run dev` : nodemon + rechargement auto.
- `npm start` : execution directe en Node sans rechargement.
- `npm run lint` : verifie le style ESLint sur `src/**/*.js`.

## Architecture

- `src/index.js` : bootstrap Express, configuration securite (Helmet, CSRF, CORS) et routes.
- `src/db.js` : configuration Sequelize + connexion MySQL.
- `src/models/` : definitions User, Session, List, Task, Tag et tables de jointure.
- `src/middlewares/` : auth session + validation Zod.
- `src/routes/` : endpoints JSON pour auth, listes, taches, membres, tags.

Toutes les routes (hors `GET /auth/csrf-token` et `GET /health`) exigent une session valide et un token CSRF. Les mots de passe sont hashes avec bcrypt (12 rounds) et la connexion a `/auth/login` est protege par un rate-limit (10 tentatives / 15 minutes).
