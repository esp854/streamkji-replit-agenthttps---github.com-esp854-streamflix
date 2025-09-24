// Exemple d'utilisation de Drizzle ORM avec DATABASE_URL et SSL
// Ce fichier montre comment configurer Drizzle ORM pour Render

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';

dotenv.config();

// Configuration correcte avec DATABASE_URL et SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // important pour Render
  },
});

// Initialisation de Drizzle ORM
const db = drizzle(pool);

// Exemple d'utilisation
async function testDrizzleConnection() {
  try {
    // Exemple de requête avec Drizzle
    // const users = await db.select().from(usersTable);
    console.log('✅ Drizzle ORM configuré avec succès');
    return db;
  } catch (error) {
    console.error('❌ Erreur avec Drizzle ORM:', error.message);
  }
}

export { db, pool, testDrizzleConnection };