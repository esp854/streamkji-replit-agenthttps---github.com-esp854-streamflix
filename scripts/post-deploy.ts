#!/usr/bin/env node

/**
 * Script de post-déploiement pour Render
 * Ce script s'exécute automatiquement après chaque déploiement
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

console.log('🚀 Démarrage du script de post-déploiement...');

async function postDeploy() {
  try {
    // Étape 1: Vérifier la connexion à la base de données
    console.log('📊 Vérification de la base de données...');
    execSync('npm run check-render-db', { stdio: 'inherit' });

    // Étape 2: Créer les tables si elles n'existent pas
    console.log('🏗️ Création des tables de base de données...');
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Tables créées avec succès');
    } catch (error) {
      console.log('⚠️ Les tables existent déjà ou erreur lors de la création');
    }

    // Étape 3: Créer l'utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...');
    try {
      execSync('npm run create-admin', { stdio: 'inherit' });
      console.log('✅ Utilisateur admin créé avec succès');
    } catch (error) {
      console.log('⚠️ L\'utilisateur admin existe déjà ou erreur lors de la création');
    }

    // Étape 4: Vérification finale
    console.log('🔍 Vérification finale...');
    execSync('npm run check-render-db', { stdio: 'inherit' });

    console.log('🎉 Post-déploiement terminé avec succès !');
    console.log('📝 Informations de connexion admin :');
    console.log('   Email: admin@streamkji.com');
    console.log('   Mot de passe: admin123');
    console.log('⚠️  Changez ce mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors du post-déploiement:', error.message);
    console.log('💡 Vérifiez les variables d\'environnement et la configuration de la base de données');
    process.exit(1);
  }
}

postDeploy().catch(console.error);