// Exemple d'utilisation de la base de données avec DATABASE_URL et SSL
// Ce fichier montre comment configurer correctement la connexion à la base de données pour Render

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration correcte avec DATABASE_URL et SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // important pour Render
  },
});

// Exemple d'utilisation avec Drizzle ORM (si vous utilisez Drizzle)
/*
import { drizzle } from "drizzle-orm/node-postgres";
const db = drizzle(pool);
*/

// Fonction pour tester la connexion
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  }
}

// Exemple de requête simple
async function getUserCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Nombre d'utilisateurs: ${result.rows[0].count}`);
    return result.rows[0].count;
  } catch (error) {
    console.error('Erreur lors de la requête:', error.message);
  }
}

export { pool, testConnection, getUserCount };