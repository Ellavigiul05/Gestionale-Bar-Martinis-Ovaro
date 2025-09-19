import pg from "pg";

import dotenv from "dotenv";

dotenv.config();

export async function database() {
  const { Client } = pg;

  const db = new pg.Client({
    connectionString: process.env.DATABASE_PUBLIC_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  db.connect()
    .then(() => {
      console.log("Connessione al database riuscita!");
    })
    .catch((err) => {
      console.error("Errore nella connessione al database:", err);
    });

  try {
    await db.connect();
    console.log("Connessiono al db riuscita");
    return db;
  } catch (err) {
    console.log("Errore di connessione al database");
    process.exit(1);
  }
}
