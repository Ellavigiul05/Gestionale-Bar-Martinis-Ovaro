import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  keepAlive: true,
});

export async function database() {
  try {
    const client = await pool.connect();
    console.log("Connessione al database riuscita!");
    return client;
  } catch (err) {
    console.error("Errore nella connessione al database:", err);
    process.exit(1);
  }
}


export default pool;


