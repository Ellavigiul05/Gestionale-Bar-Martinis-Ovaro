import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export async function database() {
  const { Client } = pg;

  const db = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL, // la stringa completa di Railway
    ssl: {
      rejectUnauthorized: false, // necessario per Railway
    },
  });

  try {
    await db.connect(); // connettiti solo una volta
    console.log("Connessione al database riuscita!");
    return db;
  } catch (err) {
    console.error("Errore nella connessione al database:", err);
    process.exit(1);
  }
}

