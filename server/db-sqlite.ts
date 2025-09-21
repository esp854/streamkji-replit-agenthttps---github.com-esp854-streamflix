import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

// SQLite database configuration
const sqlite = new Database("./database.db");
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

console.log("SQLite database connected successfully!");