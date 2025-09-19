//I import express to create a server
import express from "express";
//I import path to use it to find the paths in the project
import path from "path";
//I import express-session to use the session for user_id
import session from "express-session";
//I import dotenv to hidden some password
import dotenv from "dotenv";

import cors from "cors";


dotenv.config();

import { fileURLToPath } from "url";
//I import db
import { database } from "./src/config/db.js";

import { requireAuth } from "./src/routes/function.js";

//I import the login api
import apiLoginRouter from "./src/routes/apiLogin.js";
//I import the employe api
import apiEmploye from "./src/routes/employesApi.js";

import apiManager from "./src/routes/managerApi.js";

//I create the express instance called app
const app = express();

//I define a port for the server
const port = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_PASSWORD,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
      httpOnly: true,
      secure: false,
    },
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/pdf", express.static(path.join(__dirname, "public/pdf")));


app.use(cors());


const db = await database();

app.use("/api", apiLoginRouter);

app.use("/api", apiEmploye);

app.use("/api", apiManager);

app.get("/", (req, res) => {
  res.render("login.ejs", {
    cssFile: "/style/loginStyle.css",
    jsFile: "/js/login.js",
    Titolo: "Login",
    apiURL: process.env.APP_API_URL,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Errore durante il logout:", err);
      return res.status(500).send("Logout fallito");
    }

    res.clearCookie("connect.sid"); 
    res.redirect("/");
  });
});


app.get("/benessere", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("employe/benessere.ejs", {
      cssFile: "/style/employestyle/benessereStyle.css",
      jsFile: "/js/employe/benessere.js",
      Titolo: "Benessere",
      username: username,
      apiURL: process.env.APP_API_URL,
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/turni", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;

    res.render("employe/turni.ejs", {
      cssFile: "/style/employestyle/turniStyle.css",
      jsFile: "/js/employe/turni.js",
      Titolo: "Turni",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/listaSpesa", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("employe/listaspesaE.ejs", {
      cssFile: "/style/employestyle/listaspesaEStyle.css",
      jsFile: "/js/employe/listaspesaE.js",
      Titolo: "Lista",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/comunicazioni", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("employe/comunicazioniE.ejs", {
      cssFile: "/style/employestyle/comunicazioniEStyle.css",
      jsFile: "/js/employe/comunicazioniE.js",
      Titolo: "Comunicazioni",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/orarioE", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("employe/orarioE.ejs", {
      cssFile: "style/employestyle/orarioEStyle.css",
      jsFile: "js/employe/orarioE.js",
      Titolo: "Orario Dipendenti",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/richiesteE", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("employe/richiesteE.ejs", {
      cssFile: "style/employestyle/richiesteEStyle.css",
      jsFile: "js/employe/richiesteE.js",
      Titolo: "Richieste",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/moduliE", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;

    res.render("employe/moduliE.ejs", {
      cssFile: "/style/employestyle/moduliEStyle.css",
      jsFile: "/js/employe/moduliE.js",
      Titolo: "Turni",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});








app.get("/personale", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/personale.ejs", {
      cssFile: "/style/managerstyle/personaleMStyle.css",
      jsFile: "/js/management/personaleM.js",
      Titolo: "Gestione personale",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/listaSpesaM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/listaSpesaM.ejs", {
      cssFile: "style/managerstyle/listaspesaMStyle.css",
      jsFile: "js/management/listaSpesaM.js",
      Titolo: "Lista spesa",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/comunicazioniM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/comunicazioniM.ejs", {
      cssFile: "style/managerstyle/comunicazioniMStyle.css",
      jsFile: "js/management/comunicazioniM.js",
      Titolo: "Comunicazioni",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/cambioPassword", (req, res) => {
  res.render("management/cambioPassword.ejs");
});

app.get("/turniM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/turniM.ejs", {
      cssFile: "style/managerstyle/turniMStyle.css",
      jsFile: "js/management/turniM.js",
      Titolo: "Turni",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/orarioM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/orarioM.ejs", {
      cssFile: "style/managerstyle/orarioMStyle.css",
      jsFile: "js/management/orarioM.js",
      Titolo: "Compilazione e invio orari",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/richiesteM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/richiesteM.ejs", {
      cssFile: "/style/managerstyle/richiesteMStyle.css",
      jsFile: "js/management/richiesteM.js",
      Titolo: "Richieste",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/inserirePDF", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/inserirePDF.ejs", {
      cssFile: "style/managerstyle/inserirePDFStyle.css",
      jsFile: "js/management/inserirePDF.js",
      Titolo: "Inserimento PDF",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});

app.get("/moduliM", requireAuth, async (req, res) => {
  let id = req.session.userId;
  try {
    let query = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [id]
    );
    let username = query.rows[0].username;
    res.render("management/moduliM.ejs", {
      cssFile: "style/managerstyle/moduliMStyle.css",
      jsFile: "js/management/moduliM.js",
      Titolo: "Visione moduli",
      username: username,
      apiURL: process.env.APP_API_URL
    });
  } catch (err) {
    console.log("Errore nel recupero username", err);
    res.status(500).send("Errore interno");
  }
});



app.get("/menu", (req, res) => {
  res.render("menu.ejs", { pdfUrl: "/pdf/menu.pdf" });
});

//I use the function listen to try the server
app.listen(port, () => {
  console.log(`The server is listening on port ${port}`);
});
