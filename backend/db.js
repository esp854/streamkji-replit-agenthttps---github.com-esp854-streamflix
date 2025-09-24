import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la connexion à la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // important pour Render
  },
});

// Test de la connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
  } else {
    console.log('✅ Connexion à la base de données établie avec succès');
  }
});

export default pool;