import pg from "pg";

import dotenv from "dotenv";

dotenv.config("./.env");

export async function database() {
  const { Client } = pg;

  const db = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try{
    await db.connect();
    console.log("Connessiono al db riuscita");
    return db;
  } catch(err){
    console.log("Errore di connessione al database");
    process.exit(1);
  }
}
