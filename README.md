# StreamFlix - Plateforme de Streaming

StreamFlix est une plateforme de streaming de films et séries avec système d'abonnement, gestion de contenu et interface utilisateur moderne.

## Fonctionnalités

- 🔐 Authentification utilisateur (inscription/connexion)
- 🎬 Catalogue de films et séries
- ❤️ Système de favoris
- 📺 Historique de visionnage
- 💰 Système d'abonnement avec PayPal
- 📱 Interface responsive
- 🔍 Recherche et filtrage de contenu
- 🛡️ Sécurité avancée (CSRF, rate limiting, etc.)

## Configuration requise

- Node.js 16+
- PostgreSQL
- Compte PayPal pour les paiements (sandbox/production)
- Compte Gmail pour l'envoi d'emails

## Installation

1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Configurer la base de données PostgreSQL
4. Configurer les variables d'environnement (voir `.env.example`)
5. Exécuter les migrations Drizzle :
   ```bash
   npx drizzle-kit push
   ```

## Configuration Email

Pour que les utilisateurs reçoivent des emails de bienvenue lors de l'inscription :

1. Configurer EMAIL_USER et EMAIL_PASS dans le fichier `.env`
2. Suivre les instructions détaillées dans `EMAIL_CONFIGURATION.md`
3. Suivre le guide détaillé dans `GMAIL_SETUP_GUIDE.md` pour configurer Gmail
4. Si vous rencontrez des problèmes d'authentification, consulter `server/TROUBLESHOOTING_CHECKLIST.md`
5. Tester la configuration avec `npx tsx server/test-email.ts`

### Outils de diagnostic

- `npx tsx server/verify-gmail-setup.ts` - Vérifie la configuration des variables d'environnement
- `npx tsx server/test-smtp-connection.ts` - Teste la connexion SMTP directement
- `npx tsx server/test-email.ts` - Envoie un email de test complet
- `npx tsx server/advanced-diagnostics.ts` - Tests approfondis de diagnostic
- `npx tsx server/final-diagnostic.ts` - Diagnostic final avec logs détaillés

## Déploiement

### Déploiement sur Render

1. Forkez ce dépôt sur votre compte GitHub
2. Créez un compte sur [Render](https://render.com/)
3. Connectez votre compte GitHub à Render
4. Créez un nouveau service web :
   - Choisissez "Web Service"
   - Connectez votre dépôt
   - Configurez les variables d'environnement :
     - `DATABASE_URL` - URL de votre base de données PostgreSQL
     - `EMAIL_USER` - Adresse email pour l'envoi d'emails
     - `EMAIL_PASS` - Mot de passe de l'adresse email
     - `JWT_SECRET` - Secret pour les tokens JWT
     - `SESSION_SECRET` - Secret pour les sessions
     - `PAYDUNYA_MASTER_KEY` - Clé maîtresse PayDunya
     - `PAYDUNYA_PRIVATE_KEY` - Clé privée PayDunya
     - `PAYDUNYA_TOKEN` - Token PayDunya
     - `PAYDUNYA_MODE` - Mode PayDunya (test ou live)
5. Déployez le service

Pour des instructions détaillées, consultez [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)

### Déploiement avec Docker

1. Construisez l'image Docker :
   ```bash
   docker build -t streamflix .
   ```
2. Exécutez le conteneur :
   ```bash
   docker run -p 10000:10000 \
     -e DATABASE_URL=your_database_url \
     -e EMAIL_USER=your_email \
     -e EMAIL_PASS=your_password \
     -e JWT_SECRET=your_jwt_secret \
     -e SESSION_SECRET=your_session_secret \
     streamflix
   ```

Pour des instructions détaillées, consultez [DEPLOYMENT.md](DEPLOYMENT.md)

## Démarrage

```bash
# Démarrer le serveur backend
npm run dev:server

# Démarrer le client (dans un autre terminal)
npm run dev:client
```

## Structure du projet

- `client/` - Application frontend React
- `server/` - Serveur Express avec API
- `shared/` - Schémas partagés entre client et serveur
- `drizzle/` - Migrations de base de données

## Technologies utilisées

- Frontend : React, TypeScript, Tailwind CSS, TanStack Query
- Backend : Express.js, TypeScript
- Base de données : PostgreSQL avec Drizzle ORM
- Authentification : JWT
- Paiements : PayPal REST API
- Emails : Nodemailer avec Gmail

## Documentation

- `ADMIN_DASHBOARD_README.md` - Documentation du tableau de bord admin
- `IMPROVED_ADMIN_DASHBOARD_README.md` - Documentation du tableau de bord admin amélioré
- `INSTALLATION_POSTGRESQL.md` - Guide d'installation PostgreSQL
- `LYGOS_INTEGRATION_SUMMARY.md` - Documentation de l'intégration Lygos
- `EMAIL_CONFIGURATION.md` - Guide de configuration des emails
- `GMAIL_SETUP_GUIDE.md` - Guide détaillé de configuration Gmail
- `server/TROUBLESHOOTING_CHECKLIST.md` - Liste de vérification pour le dépannage des emails
- `RENDER_DEPLOYMENT_GUIDE.md` - Guide de déploiement sur Render
- `DEPLOYMENT.md` - Guide de déploiement détaillé