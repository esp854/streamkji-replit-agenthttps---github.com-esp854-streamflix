# Guide de déploiement sur Render

## Étapes de déploiement

### 1. Préparation

1. **Forker le dépôt**
   - Forkez ce dépôt sur votre compte GitHub

2. **Créer un compte Render**
   - Rendez-vous sur https://render.com/
   - Inscrivez-vous ou connectez-vous

### 2. Créer la base de données PostgreSQL

1. Sur Render, cliquez sur "New" puis "PostgreSQL"
2. Configurez les paramètres :
   - **Name**: streamflix-db (ou un nom de votre choix)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
3. Cliquez sur "Create Database"
4. Une fois créée, copiez l'URL de connexion (DATABASE_URL) dans l'onglet "Info"

### 3. Créer le service web

1. Sur Render, cliquez sur "New" puis "Web Service"
2. Connectez votre dépôt GitHub
3. Configurez les paramètres :
   - **Name**: streamflix (ou un nom de votre choix)
   - **Region**: Même région que votre base de données
   - **Branch**: main
   - **Root Directory**: Laissez vide
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 4. Configurer les variables d'environnement

Dans la section "Advanced" de la configuration du service, ajoutez les variables suivantes :

```
NODE_ENV=production
PORT=10000
DATABASE_URL=valeur_copiée_depuis_l'étape_2
EMAIL_USER=votre_adresse_email_pour_les_notifications
EMAIL_PASS=mot_de_passe_de_votre_adresse_email
JWT_SECRET=une_chaîne_aléatoire_pour_les_tokens_JWT
SESSION_SECRET=une_autre_chaîne_aléatoire_pour_les_sessions
```

### 5. Déployer

1. Cliquez sur "Create Web Service"
2. Render commencera automatiquement le déploiement
3. Attendez que le déploiement soit terminé (cela peut prendre quelques minutes)

### 6. Initialiser la base de données

**Option A : Via le script automatique (recommandé)**
1. Le script de post-déploiement s'exécute automatiquement après chaque déploiement
2. Vérifiez les logs de déploiement pour voir si tout s'est bien passé
3. Si le script échoue, utilisez l'option manuelle ci-dessous

**Option B : Via le shell Render (si nécessaire)**
1. Une fois le déploiement terminé, allez dans l'onglet "Shell" de votre service web
2. Vérifiez l'état de la base de données : `npm run check-render-db`
3. Créez les tables : `npm run db:push`
4. Créez un utilisateur administrateur : `npm run create-admin`

## Configuration des emails

Pour que les emails fonctionnent correctement, vous devez configurer un compte Gmail avec un mot de passe d'application :

1. Activez l'authentification à deux facteurs sur votre compte Google
2. Générez un mot de passe d'application :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nommez-le StreamFlix)"
   - Copiez le mot de passe généré
3. Utilisez ce mot de passe comme valeur pour `EMAIL_PASS`

## Surveillance

Render fournit une surveillance automatique de votre application :

- **Health Check**: Render vérifie automatiquement `/health` toutes les minutes
- **Logs**: Vous pouvez consulter les journaux dans l'onglet "Logs"
- **Metrics**: Render affiche les métriques de performance dans l'onglet "Metrics"

## Mises à jour

Pour mettre à jour votre application :

1. Poussez vos modifications vers votre dépôt GitHub
2. Render détectera automatiquement les changements et commencera un nouveau déploiement
3. Vous pouvez aussi déclencher manuellement un déploiement depuis l'interface Render

## Dépannage

### Problèmes courants

1. **Les emails ne sont pas envoyés**
   - Vérifiez que `EMAIL_USER` et `EMAIL_PASS` sont correctement configurés
   - Assurez-vous d'utiliser un mot de passe d'application Gmail

2. **La base de données ne se connecte pas**
   - Vérifiez que `DATABASE_URL` est correct
   - Assurez-vous que la base de données est accessible

3. **L'application ne démarre pas**
   - Consultez les journaux dans l'onglet "Logs"
   - Vérifiez que toutes les variables d'environnement requises sont définies

### Problèmes de connexion admin

Si vous ne pouvez pas vous connecter en tant qu'admin :

1. **Vérifiez que l'utilisateur admin existe** :
   ```bash
   npm run check-render-db
   ```

2. **Créez l'utilisateur admin manuellement** :
   ```bash
   npm run create-admin
   ```

3. **Informations de connexion par défaut** :
   - Email : `admin@streamkji.com`
   - Mot de passe : `admin123`
   - ⚠️ Changez ce mot de passe après la première connexion !

### Erreurs 500 sur les API

Si vous obtenez des erreurs 500 :

1. **Vérifiez la connexion à la base de données** :
   ```bash
   npm run check-render-db
   ```

2. **Créez les tables si manquantes** :
   ```bash
   npm run db:push
   ```

3. **Redémarrez le service** : Forcez un redéploiement depuis Render

### Support

Si vous rencontrez des problèmes avec le déploiement :

1. Consultez les journaux de déploiement
2. Vérifiez que toutes les étapes de ce guide ont été suivies
3. Utilisez les commandes de diagnostic : `npm run check-render-db`
4. Contactez le support Render si le problème persiste