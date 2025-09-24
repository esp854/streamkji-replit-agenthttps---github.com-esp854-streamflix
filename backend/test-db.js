#!/usr/bin/env node

// Script de test pour vérifier la connexion à la base de données
import pool from './db.js';

console.log('🔍 Test de la connexion à la base de données...');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connexion réussie!');
    console.log('⏰ Heure actuelle de la base de données:', res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});