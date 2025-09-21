# Guide d'Installation PostgreSQL Local pour StreamKJI

## 📋 Prérequis

- Windows 10/11
- Node.js installé
- Droits d'administrateur pour l'installation

## 🚀 Installation Étape par Étape

### 1. Installation de PostgreSQL

1. **Téléchargement** :
   - Allez sur : https://www.postgresql.org/download/windows/
   - Téléchargez la version la plus récente (recommandée : PostgreSQL 15 ou 16)

2. **Installation** :
   - Exécutez le fichier `.exe` téléchargé
   - Suivez l'assistant d'installation avec ces paramètres :
     - **Composants** : PostgreSQL Server, pgAdmin 4, Stack Builder
     - **Répertoire** : Laissez par défaut
     - **Répertoire de données** : Laissez par défaut
     - **Mot de passe** : Choisissez un mot de passe fort et **RETENEZ-LE** !
     - **Port** : 5432 (par défaut)
     - **Localisation** : French, France ou Default locale

3. **Vérification** :
   - Ouvrez le menu Démarrer
   - Recherchez "pgAdmin" et ouvrez-le
   - Connectez-vous avec votre mot de passe

### 2. Configuration de la Base de Données

1. **Méthode Automatique (Recommandée)** :
   ```cmd
   # Dans le dossier du projet
   setup-db.bat
   ```

2. **Méthode Manuelle** :
   ```cmd
   # Ouvrir une invite de commandes
   psql -U postgres -h localhost -p 5432
   
   # Dans psql, exécutez :
   CREATE DATABASE streamkji;
   \q
   ```

### 3. Configuration du Projet

1. **Mise à jour du fichier .env** :
   ```env
   DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/streamkji
   ```
   
   Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe choisi lors de l'installation.

2. **Test de connexion** :
   ```cmd
   npm run test-db
   ```

3. **Création des tables** :
   ```cmd
   npm run db:push
   ```

4. **Création de l'utilisateur admin** :
   ```cmd
   npm run create-admin
   ```

5. **Démarrage de l'application** :
   ```cmd
   npm run dev
   ```

## 🔧 Dépannage

### Erreur "ECONNREFUSED"
- Vérifiez que PostgreSQL est démarré :
  - Ouvrez les Services Windows (services.msc)
  - Recherchez "postgresql" et vérifiez qu'il est démarré

### Erreur "authentication failed"
- Vérifiez le mot de passe dans le fichier `.env`
- Assurez-vous que l'utilisateur `postgres` existe

### Erreur "database does not exist"
- Exécutez le script `setup-db.bat`
- Ou créez manuellement la base avec `psql`

### Port déjà utilisé
- Modifiez le port dans `.env` et dans la configuration PostgreSQL
- Ou arrêtez le processus utilisant le port 5432

## 📱 Commandes Utiles

```cmd
# Tester la connexion à la base de données
npm run test-db

# Créer/mettre à jour les tables
npm run db:push

# Créer un utilisateur administrateur
npm run create-admin

# Démarrer l'application en mode développement
npm run dev

# Se connecter directement à PostgreSQL
psql -U postgres -d streamkji -h localhost -p 5432
```

## 🎯 Vérification de l'Installation

Une installation réussie devrait permettre :

1. ✅ Connexion à PostgreSQL sans erreur
2. ✅ Création des tables via Drizzle ORM
3. ✅ Création d'un utilisateur administrateur
4. ✅ Démarrage de l'application
5. ✅ Accès à l'interface d'administration

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs d'erreur dans la console
2. Assurez-vous que PostgreSQL est bien installé et démarré
3. Vérifiez les permissions sur les dossiers
4. Consultez la documentation PostgreSQL officielle

---

**Note** : Ce guide est spécifique à Windows. Pour d'autres systèmes d'exploitation, consultez la documentation PostgreSQL officielle.