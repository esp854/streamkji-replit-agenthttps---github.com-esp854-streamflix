-- Configuration de la base de données StreamKJI
-- Ce script crée la base de données et configure les permissions nécessaires

-- Créer la base de données StreamKJI
CREATE DATABASE streamkji;

-- Se connecter à la base de données
\c streamkji;

-- Créer un utilisateur pour l'application (optionnel, vous pouvez utiliser l'utilisateur postgres)
-- CREATE USER streamkji_user WITH PASSWORD 'votre_mot_de_passe_app';
-- GRANT ALL PRIVILEGES ON DATABASE streamkji TO streamkji_user;

-- Afficher les informations de connexion
\echo 'Base de données StreamKJI créée avec succès !'
\echo 'Vous pouvez maintenant exécuter : npm run db:push pour créer les tables'
\echo 'Puis : npm run create-admin pour créer un utilisateur administrateur'