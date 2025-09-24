import { config } from "dotenv";

// Load environment variables
config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log("Host:", url.hostname);
  console.log("Port:", url.port);
  console.log("Database:", url.pathname.substring(1));
}