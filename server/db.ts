import { config } from "dotenv";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Charger les variables d'environnement
config();

// Use the DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// If no DATABASE_URL is provided, throw an error instead of defaulting to localhost
if (!databaseUrl) {
  throw new Error("❌ DATABASE_URL environment variable is not set");
}

// Configure SSL for Render deployment
const sslConfig = {
  rejectUnauthorized: false // nécessaire sur Render
};

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: sslConfig
});
export const db = drizzle(pool, { schema });