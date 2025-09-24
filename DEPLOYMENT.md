# Déploiement de StreamFlix

## Options de déploiement

StreamFlix peut être déployé de plusieurs façons :

1. **Render** (recommandé pour les débutants)
2. **Docker** (pour les déploiements personnalisés)
3. **Heroku** (alternative à Render)
4. **VPS personnalisé** (pour les déploiements avancés)

## Déploiement sur Render

### Prérequis

1. Un compte Render (https://render.com/)
2. Un compte GitHub
3. Une base de données PostgreSQL (Render PostgreSQL ou autre fournisseur)
4. Un compte email pour l'envoi d'emails (Gmail recommandé)

### Étapes de déploiement

1. **Forker le dépôt**
   - Forkez ce dépôt sur votre compte GitHub

2. **Créer un service web sur Render**
   - Connectez-vous à Render
   - Cliquez sur "New" puis "Web Service"
   - Connectez votre dépôt GitHub
   - Choisissez la branche principale

3. **Configurer les paramètres du service**
   - **Name**: streamflix (ou un nom de votre choix)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
   - **Branch**: main (ou la branche que vous utilisez)
   - **Root Directory**: Laissez vide
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Configurer les variables d'environnement**
   Dans la section "Advanced" de la configuration du service, ajoutez les variables suivantes :

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_postgresql_database_url
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   JWT_SECRET=your_random_jwt_secret
   SESSION_SECRET=your_random_session_secret
   PAYDUNYA_MASTER_KEY=your_paydunya_master_key
   PAYDUNYA_PRIVATE_KEY=your_paydunya_private_key
   PAYDUNYA_TOKEN=your_paydunya_token
   PAYDUNYA_MODE=test (ou live)
   ```

5. **Créer une base de données PostgreSQL**
   - Sur Render, cliquez sur "New" puis "PostgreSQL"
   - Choisissez un nom pour votre base de données
   - Sélectionnez la même région que votre service web
   - Copiez l'URL de connexion et utilisez-la comme valeur pour DATABASE_URL

6. **Déployer**
   - Cliquez sur "Create Web Service"
   - Render commencera automatiquement le déploiement
   - Attendez que le déploiement soit terminé (cela peut prendre quelques minutes)

7. **Initialiser la base de données**
   Après le premier déploiement, vous devrez initialiser la base de données :
   - Allez dans l'onglet "Shell" de votre service web sur Render
   - Exécutez la commande : `npm run db:push`

8. **Créer un utilisateur administrateur**
   - Toujours dans l'onglet "Shell", exécutez :
   - `npm run create-admin -- "admin_username" "admin_email" "admin_password"`

## Déploiement avec Docker

### Prérequis

1. Docker installé sur votre machine
2. Une base de données PostgreSQL
3. Les variables d'environnement nécessaires

### Étapes

1. **Construire l'image Docker**
   ```bash
   docker build -t streamflix .
   ```

2. **Exécuter le conteneur**
   ```bash
   docker run -d \
     --name streamflix \
     -p 10000:10000 \
     -e DATABASE_URL=your_database_url \
     -e EMAIL_USER=your_email \
     -e EMAIL_PASS=your_password \
     -e JWT_SECRET=your_jwt_secret \
     -e SESSION_SECRET=your_session_secret \
     -e PAYDUNYA_MASTER_KEY=your_paydunya_master_key \
     -e PAYDUNYA_PRIVATE_KEY=your_paydunya_private_key \
     -e PAYDUNYA_TOKEN=your_paydunya_token \
     -e PAYDUNYA_MODE=test \
     streamflix
   ```

3. **Initialiser la base de données**
   ```bash
   docker exec -it streamflix npm run db:push
   ```

4. **Créer un utilisateur administrateur**
   ```bash
   docker exec -it streamflix npm run create-admin -- "admin_username" "admin_email" "admin_password"
   ```

## Configuration des variables d'environnement

### Variables obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion à la base de données PostgreSQL | `postgresql://user:password@host:port/database` |
| `EMAIL_USER` | Adresse email pour l'envoi d'emails | `your_email@gmail.com` |
| `EMAIL_PASS` | Mot de passe de l'adresse email | `your_app_password` |
| `JWT_SECRET` | Secret pour les tokens JWT | `random_string_here` |
| `SESSION_SECRET` | Secret pour les sessions | `random_string_here` |

### Variables PayDunya (optionnelles si vous n'utilisez pas PayDunya)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PAYDUNYA_MASTER_KEY` | Clé maîtresse PayDunya | `your_master_key` |
| `PAYDUNYA_PRIVATE_KEY` | Clé privée PayDunya | `your_private_key` |
| `PAYDUNYA_TOKEN` | Token PayDunya | `your_token` |
| `PAYDUNYA_MODE` | Mode PayDunya (test ou live) | `test` ou `live` |

## Configuration de l'email

Pour que les emails fonctionnent correctement, vous devez configurer un compte Gmail avec un mot de passe d'application :

1. Activez l'authentification à deux facteurs sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nommez-le StreamFlix)"
   - Copiez le mot de passe généré
3. Utilisez ce mot de passe comme valeur pour `EMAIL_PASS`

## Dépannage

### Problèmes courants

1. **Les emails ne sont pas envoyés**
   - Vérifiez que `EMAIL_USER` et `EMAIL_PASS` sont correctement configurés
   - Assurez-vous d'utiliser un mot de passe d'application Gmail
   - Testez la configuration avec `npm run test-email` dans le shell Render

2. **La base de données ne se connecte pas**
   - Vérifiez que `DATABASE_URL` est correct
   - Assurez-vous que la base de données est accessible depuis Render
   - Vérifiez les paramètres de pare-feu si vous utilisez une base de données externe

3. **Les vidéos ne se chargent pas**
   - Vérifiez que les URLs de contenu sont correctement configurées
   - Assurez-vous que les services externes (YouTube, Vimeo, etc.) sont accessibles

4. **Les paiements ne fonctionnent pas**
   - Vérifiez les clés API PayDunya
   - Assurez-vous que le mode (`test` ou `live`) est correctement configuré

### Journaux et surveillance

- Sur Render, vous pouvez consulter les journaux dans l'onglet "Logs"
- Pour les erreurs de base de données, vérifiez les journaux du service de base de données
- Pour les erreurs d'application, consultez les journaux du service web

## Mises à jour

Pour mettre à jour votre application :

1. Poussez vos modifications vers votre dépôt GitHub
2. Sur Render, le déploiement automatique commencera
3. Ou déclenchez manuellement un déploiement depuis l'interface Render

## Sauvegardes

### Base de données

- Render crée automatiquement des sauvegardes quotidiennes de vos bases de données
- Vous pouvez restaurer à partir de ces sauvegardes dans l'interface Render
- Pour des sauvegardes supplémentaires, configurez des scripts de sauvegarde personnalisés

### Contenu

- Les contenus (films, séries) sont stockés dans la base de données
- Assurez-vous de sauvegarder régulièrement votre base de données
- Pour les contenus hébergés en externe (YouTube, Vimeo), assurez-vous que les URLs restent valides

## Sécurité

### Bonnes pratiques

1. Utilisez des secrets forts pour `JWT_SECRET` et `SESSION_SECRET`
2. Ne commitez jamais de secrets dans le dépôt
3. Utilisez HTTPS en production
4. Mettez régulièrement à jour les dépendances
5. Limitez les accès aux variables d'environnement sensibles

### Mises à jour de sécurité

- Surveillez les alertes de sécurité GitHub
- Mettez à jour les dépendances régulièrement avec `npm audit fix`
- Consultez les CVE pour les dépendances critiques