import { config } from "dotenv";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Charger les variables d'environnement
config();

// Use the DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/streamkji?sslmode=disable';

// Configure SSL based on environment
const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
const sslConfig = isRender ? {
  rejectUnauthorized: false // nécessaire sur Render
} : false;

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: sslConfig
});
export const db = drizzle(pool, { schema });