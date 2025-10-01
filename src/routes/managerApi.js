//I import express
import express from "express";
//I import hashPassword as function from my file /function.js to create an hashpassword
import { hashPassword } from "./function.js";
//I import the database to do the querys
import { database } from "../config/db.js";
//I import the differenzaOre's function from my file /function.js to made a subtraction between to time data
import { differenzaOre } from "./function.js";
//I import exceljs as npm packge to write and read excel files
import exceljs from "exceljs";
//I import multer to handling files
import multer from "multer";

import QRCode from "qrcode";

import dotenv from "dotenv";

dotenv.config("./.env");

import nodemailer from "nodemailer";

import mailjetTransport from "nodemailer-mailjet-transport";

//I create a folder for the excel's working hours
const upload = multer({ dest: "uploads/" });

const pdfCartel = multer({ dest: "pdfFolder/" });
//I configured a Router link to express
const Router = express.Router();
//I create the db instance
const db = await database();
//I create a new excel page
const workbook = new exceljs.Workbook();

import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

import fs, { appendFile } from "fs";

const transporter = nodemailer.createTransport(
  mailjetTransport({
    auth: {
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_API_SECRET,
    },
  })
);

function sendMailAsync(options) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) return reject(error);
      resolve(info);
    });
  });
}

//Create the route for create accounts by administration
Router.post("/inserimentoPersonale", async (req, res) => {
  //Request the username and the password which will be send to the employe
  const { username, password, email, telefono } = req.body;
  //I check if the administrator has insert both field
  if (!username || !password) {
    return res.status(400).json({ message: "Inserire tutti i campi del form" });
  }
  try {
    //I take every username in db
    let checkUsernames = await db.query("SELECT username FROM dati_accesso");
    //I check if the username is already in the db
    for (let i = 0; i < checkUsernames.rows.length; i++) {
      if (username == checkUsernames.rows[i].username) {
        return res.status(400).json({ message: "Username già in uso" });
      }
    }
    //I hash the password with the function "hashPassoword"
    let securePassword = await hashPassword(password);

    //When i check if the username doesn't exist and the when i hash the password i will create the account
    let query = await db.query(
      "INSERT INTO dati_accesso(username, password, email, telefono) VALUES($1, $2, $3, $4)",
      [username, securePassword, email, telefono]
    );

    let querySaluto = await db.query(
      "SELECT username, email FROM dati_accesso WHERE username = $1",
      [username]
    );

    res.status(200).json({
      success: true,
      message: "Utente creato ed email inviata con successo",
    });

    const nuovoLavoratore = querySaluto.rows[0];

    const workerBenvenutoHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      

      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 24px;">Benvenuto/a nel team Bar Martinis!</h1>
      </div>
      

      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${username},</h2>
        <p style="line-height: 1.6;">
          Siamo felici di averti con noi al <strong>Bar Martinis di Ovaro</strong>!<br><br>
          Le tue credenziali sono state registrate correttamente e sei ufficialmente parte del nostro team.<br>
          Le credenziali ti verranno comunicate direttamente da Ugo Valle o da una persona del team.
        </p>

        <div style="background-color: #D8D2C2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; line-height: 1.5;">
            <strong>Per problemi con le credenziali:</strong><br>
            Ugo Valle – <a href="tel:+393400065906" style="color:#4A4947; text-decoration:none;">+39 340 006 5906</a><br><br>
            <strong>Per problemi tecnici:</strong><br>
            Luigi Valle – <a href="tel:+393473623849" style="color:#4A4947; text-decoration:none;">+39 347 362 3849</a>
          </p>
        </div>

        <p style="line-height: 1.6;">
          Grazie ancora per aver scelto di lavorare con noi. Ti auguriamo un ottimo inizio e tante soddisfazioni!  
        </p>

        <!-- Call to action (facoltativa) -->
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.barmartinis.com/" style="background-color: #B17457; color: #FAF7F0; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
            Inizia con noi
          </a>
        </div>
      </div>
      

      <div style="background-color: #FAF7F0; padding: 15px; text-align: center; font-size: 12px; color: #4A4947;">
        © ${new Date().getFullYear()} Bar Martinis · Ovaro
      </div>
    </div>
  </div>
`;

    const workerMailOptions = {
      from: process.env.EMAIL_USER,
      to: nuovoLavoratore.email,
      subject: `Grazie per esserti unito/a al nostro team`,
      html: workerBenvenutoHtml,
    };

    transporter.verify((error, success) => {
      if (error) console.log("Transporter non funziona:", error);
      else console.log("Transporter pronto per inviare mail");
    });

    transporter.sendMail(workerMailOptions, (error, info) => {
      if (error) {
        console.error(
          "Errore nell'invio della mail al nuovo lavoratore",
          error
        );
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al nuovo lavoratore" });
      }

      console.log("Email inviata al lavoratore", info.response);
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problema nell'inserimento dei dati utente", err });
    console.log("Problema di inserimento dei dati utente", err);
  }
});

//I create this route to delete a worker from the database
Router.post("/eliminazioneLavoratore", async (req, res) => {
  //I take the id of the worker
  const { idLavoratore } = req.body;
  //I check if there is the worker
  if (!idLavoratore) {
    return res.status(400).json({ message: "Seleziona un lavoratore" });
  }

  try {
    //I made a query to the db where i delete all worker's datas
    let query = await db.query(
      "DELETE FROM dati_accesso WHERE id = $1 RETURNING *",
      [idLavoratore]
    );

    res
      .status(200)
      .json({ message: "lavoratore eliminato con successo", data: query.rows });
    console.log(query.rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problemi nell'eliminazione del lavoratore" });
    console.log("Errore nell'eliminazione di un lavoratore", err);
  }
});

//I create a route to show the employees
Router.get("/mostraDipendenti", async (req, res) => {
  //So i made a query where i select every column from the table where there are the employees
  try {
    let query = await db.query("SELECT * FROM dati_accesso");

    res
      .status(200)
      .json({ message: "Dati arrivati correttamente", data: query.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Impossibile mostrare i dati dipendenti", err });
    console.log("Errore nella lettura dati dipendenti", err);
  }
});

//I create a route to delete every item from table's categories
Router.post("/eliminazioneProdottiTotale", async (req, res) => {
  //I select the category
  const { categoria } = req.body;
  //I check if there is the category
  if (!categoria) {
    res
      .status(400)
      .json({ message: "nessuna tabella da eliminare selezionata" });
  }
  try {
    //I made a query where i delete every item that contain the category choose
    let query = await db.query(
      "DELETE FROM lista_spesa WHERE tipologia = $1 RETURNING *",
      [categoria]
    );

    res
      .status(200)
      .json({ message: "Lista della spesa svuotata", data: query.rows });
    console.log(query.rows);
  } catch (err) {
    res.status(500).json({
      message: "Impossibile eliminare i prodotti di quella tabella",
      err,
    });
    console.log("Errore nella cancellazione dei prodotti dalla tabella", err);
  }
});

//I made a route where
Router.post("/setLavoratore", (req, res) => {
  //I take the worker id
  const { idLavoratore } = req.body;
  //i check if there is
  if (!idLavoratore) {
    return res.status(400).json({ message: "Nessun id fornito" });
  }
  //Then i save the id in session
  req.session.idLavoratore = idLavoratore;
  res.status(200).json({ message: "Id lavoratore salvato in sessione" });
});

//I create a route to check if the answer is correct
Router.post("/verificaRisposta", async (req, res) => {
  //I take the answer
  const { risposta } = req.body;
  //I check if there is the answer
  if (!risposta) {
    return res.status(400).json({ message: "Inserire risposta" });
  }
  //I select the correct answer from the .env file to hidden it
  const rispostaCorretta =
    process.env.RISPOSTA_PASSWORD.trim().toLocaleLowerCase();
  //I made a comparison between the answer and the correct answer
  if (risposta == rispostaCorretta) {
    res.status(200).json({ message: "Risposta corretta" });
  } else {
    res.status(401).json({ message: "Risposta errata" });
  }
});

//I made a route where i can change the passwords of the employees
Router.post("/cambioPassword", async (req, res) => {
  //I take the password
  const { password } = req.body;
  //And i take the worker id
  const idLavoratore = req.session.idLavoratore;

  //I check if there is the worker id
  if (!idLavoratore) {
    return res.status(400).json({
      message: "Nessun lavoratore a cui cambiare la password trovato",
    });
  }
  //I check if there is the password
  if (!password) {
    return res.status(400).json({ message: "compilare il campo" });
  }
  //Then i hash the new password
  let nuovaPassword = await hashPassword(password);

  try {
    //At the end i update the hashpassword where there is the worker id
    let query = await db.query(
      "UPDATE dati_accesso SET password = $1 WHERE id = $2 RETURNING*",
      [nuovaPassword, idLavoratore]
    );

    let queryNuovaPasswordGmail = await db.query(
      "SELECT username, email FROM dati_accesso WHERE id = $1",
      [idLavoratore]
    );

    res.status(200).json({
      success: true,
      message: "Password cambiata ed email inviata con successo",
    });

    let lavoratore = queryNuovaPasswordGmail.rows[0];

    let nuovaPasswordhtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Password Cambiata con Successo</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${
          lavoratore.username
        },</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Ti comunichiamo che la tua password è stata cambiata con successo. 
          La nuova password ti verrà consegnata direttamente dal direttore o da un membro dello staff.
        </p>

        <div style="background-color: #D8D2C2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; line-height: 1.5; font-size: 14px;">
            Per eventuali problemi tecnici contatta Luigi Valle: <strong>+39 347 362 3849</strong>
          </p>
        </div>
      </div>
      
      <div style="background-color: #FAF7F0; padding: 15px; text-align: center; font-size: 12px; color: #4A4947;">
        © ${new Date().getFullYear()} Bar Martinis · Ovaro<br>
        Questo messaggio è generato automaticamente, non rispondere a questa email.
      </div>
    </div>
  </div>
`;

    const workerMailChangePassword = {
      from: process.env.EMAIL_USER,
      to: lavoratore.email,
      subject: `Cambio della password`,
      html: nuovaPasswordhtml,
    };

    transporter.sendMail(workerMailChangePassword, (error, info) => {
      if (error) {
        console.error("Errore nell'invio della mail al lavoratore", error);
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al lavoratore" });
      }

      console.log("Email inviata al lavoratore", info.response);
    });

    res
      .status(200)
      .json({ message: "Password cambiata con successo", data: query.rows });
    console.log(query.rows);
  } catch (err) {
    res.status(500).json({ message: "errore nel cambio password", err });
    console.log("Errore nel cambio password", err);
  }
});

//I create a route to select the workers
Router.get("/seeWorkers", async (req, res) => {
  try {
    //I select id and username of the employees
    let query = await db.query("SELECT id, username FROM dati_accesso");

    res
      .status(200)
      .json({ message: "Dati recuperati con successo", data: query.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Impossibile recuperare i dati dei lavoratori", err });
    console.log("Impossibile recupoerare i dati dei lavoratori", err);
  }
});

//I create a route to see every work time of employees
Router.get("/guardaTurni", async (req, res) => {
  //I take the id worker
  const { idLavoratore } = req.query;
  //I check if there is
  if (!idLavoratore) {
    res.status(400).json({ message: "Selezionare lavoratore" });
  }
  //I take the year
  const annoCorrente = new Date().getFullYear();

  try {
    //I made a query where i select the rows of turni where there are the userid hours of this year
    let query = await db.query(
      "SELECT * FROM turni WHERE lavoratore_id = $1 AND EXTRACT(YEAR FROM giorno) = $2",
      [idLavoratore, annoCorrente]
    );

    res
      .status(200)
      .json({ message: "Arrivo dei dati corretto", data: query.rows });
  } catch (err) {
    res.status(500).json({
      message: "Problemi nell'arrivo dei dati dei turni del lavoratore",
    });
    console.log("Problemi nell'arrivo dei dati dei turni del lavoratore", err);
  }
});

//I create the route to create a excel format fot he shifts
Router.get("/creazioneFile", async (req, res) => {
  //I take the userId and the month
  const { idLavoratore, mese } = req.query;
  //I check if there are
  if (!idLavoratore || !mese) {
    return res.status(400).json({ message: "Selezionare mese e lavoratore" });
  }

  try {
    //I select the rows with the parameters of the id
    let query = await db.query("SELECT * FROM turni WHERE lavoratore_id = $1", [
      idLavoratore,
    ]);
    //i take the name of the worker
    let nome = await db.query(
      "SELECT username FROM dati_accesso WHERE id = $1",
      [idLavoratore]
    );

    let nomeLavoratore = nome.rows[0].username;
    //I create a sheet of excel called "turni"
    const sheet = workbook.addWorksheet("Turni");
    // I set sheet columns of the table
    sheet.columns = [
      { header: "Giorno", key: "giorno" },
      { header: "Ora Inizio", key: "ora_inizio" },
      { header: "Ora Fine", key: "ora_fine" },
      { header: "Ore Totali", key: "ore_tot" },
    ];

    // First i insert the title, so i take the first row of the sheet called "turni del mese di nameEmployee and month"
    const titolo = sheet.insertRow(1, [
      `Turni del mese di ${nomeLavoratore} - ${mese}`,
    ]);
    //I fill the width of the table for the title
    sheet.mergeCells(1, 1, 1, 4);
    //I set some style to the title
    titolo.font = { size: 10, bold: true, color: { argb: "B17457" } };
    titolo.alignment = { horizontal: "center", vertical: "middle" };
    //I create a space between the title and the table
    sheet.insertRow(2, []);
    //Then i take the third row
    const headerRow = sheet.getRow(3);
    //I set some style to every cell of the third row, so the row where there are the th of the table
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "B17457" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // //I map the months
    const mesi = {
      gennaio: "01",
      febbraio: "02",
      marzo: "03",
      aprile: "04",
      maggio: "05",
      giugno: "06",
      luglio: "07",
      agosto: "08",
      settembre: "09",
      ottobre: "10",
      novembre: "11",
      dicembre: "12",
    };

    //I take the month select by user and i
    const meseSelezionato = mesi[mese];

    //I insert in each row the data
    query.rows.forEach((row) => {
      //I take the month of the day of the row
      const meseTurno = new Date(row.giorno).getMonth() + 1;
      //I convert the month into a string
      const meseStr = meseTurno.toString().padStart(2, "0");
      //I check if selected month are equal to the month of the data
      if (meseStr !== meseSelezionato) return;
      //Then i add rows to the sheet so for each row i add the day, the start's hours, the finish's hours, the total hours in the shift
      sheet.addRow({
        giorno: row.giorno,
        ora_inizio: row.ora_inizio,
        ora_fine: row.ora_fine,
        ore_tot: differenzaOre(row.ora_inizio, row.ora_fine),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=turni.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res
      .status(500)
      .json({ message: "problemi per l'invio dei dati al file excel" });
  }
});

//I map the hours just to have something if the owner doesn't insert nothing
let orariTurni = {
  turno1: "6:00-13:00",
  turno2: "9:00-15:00",
  turno3: "14:30-chiusura",
  turno4: "17:30-chiusura",
};

//I create a route to insert the work hours
Router.post("/inserimentoOrari", async (req, res) => {
  try {
    //I take in input the 4 shifts of the day
    const { turno1, turno2, turno3, turno4 } = req.body;
    //I create an object with the shifts
    orariTurni = {
      turno1: turno1 || orariTurni.turno1,
      turno2: turno2 || orariTurni.turno2,
      turno3: turno3 || orariTurni.turno3,
      turno4: turno4 || orariTurni.turno4,
    };

    res.status(200).json({ message: "Nuovi orari salvati correttamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nel salvataggio degli orari" });
  }
});

//I create a route to create an excel format fot months shifts
Router.get("/creaFormato", async (req, res) => {
  //I request the month
  const { mese } = req.query;
  try {
    //I take the current year
    let anno = new Date().getFullYear();

    const meseCorrente = new Date().getMonth() + 1;
    //I use an array for the months to find the index
    const mesi = [
      "gennaio",
      "febbraio",
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre",
    ];
    //I take the index month
    const meseIndex = mesi.indexOf(mese.toLowerCase());
    //I check if the month exist
    if (meseIndex === -1) {
      return res.status(400).json({ message: "Mese non valido" });
    }
    //I create an array with the week days
    const giorniSettimana = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ];

    //I create the name of the month with the the first letter upper case
    const nomeMese =
      mesi[meseIndex].charAt(0).toUpperCase() + mesi[meseIndex].slice(1);

    if (meseCorrente === 12 && nomeMese === "Gennaio") {
      anno += 1;
    }
    //I take the days of the month in that year
    const numeroGiorni = new Date(anno, meseIndex + 1, 0).getDate();
    //I create a new excel file
    const workbook = new exceljs.Workbook();
    //I create a new sheet called "turni mese di "nome del mese corrente"
    const foglio = workbook.addWorksheet(`Turni mese di ${nomeMese}`);
    //I create the headers of the table
    foglio.columns = [
      { header: "Giorno", key: "giorno", width: 15 },
      { header: orariTurni.turno1, key: "turno1", width: 15 },
      { header: orariTurni.turno2, key: "turno2", width: 15 },
      { header: orariTurni.turno3, key: "turno3", width: 15 },
      { header: orariTurni.turno4, key: "turno 4", width: 15 },
    ];

    // I create the first row of the sheet where i will insert the title of the sheet called "Programmazione turni mese di "mese" "
    const title = foglio.insertRow(1, [
      `Programmazione turni mese di ${nomeMese}`,
    ]);
    //I fill the width of the table for the title
    foglio.mergeCells(1, 1, 1, 4);
    //I add some style to the title
    title.font = { size: 14, bold: true, color: { argb: "B17457" } };
    title.alignment = { horizontal: "center", vertical: "middle" };

    // I add an empty row to create space
    foglio.insertRow(2, []);

    //I take the employee's names
    let nomiDipendenti = await db.query("SELECT username FROM dati_accesso");

    // I take some different colours to give to each employee a different background color cell
    const coloriDipendenti = ["FFFF99", "99CCFF", "FF9999", "CCFF99"];
    //I take the the usernames
    const dipendenti = nomiDipendenti.rows.map((row) => row.username);

    //I add in the third row the employee's usernames cells
    const rigaDipendenti = foglio.insertRow(3, dipendenti);

    //Then for each cell of the third row i add a different colour background
    rigaDipendenti.eachCell((cell, colNumber) => {
      const colore =
        coloriDipendenti[(colNumber - 1) % coloriDipendenti.length];
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colore },
      };
      cell.font = { bold: true, color: { argb: "000000" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    //I add another space
    foglio.insertRow(4, []);
    //I take the first free row in the sheet
    const headerRow = foglio.lastRow;
    //In each cell of that row i add some style
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "B17457" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    //I iterate to each day of the selected month to add every row where will be the shifts
    for (let day = 1; day <= numeroGiorni; day++) {
      const data = new Date(anno, meseIndex, day);
      const giornoNome = giorniSettimana[data.getDay()];
      const row = foglio.addRow({
        giorno: `${giornoNome} ${day} ${nomeMese} ${anno}`,
        turno1: "",
        turno2: "",
        turno3: "",
      });
      const cellGiorno = row.getCell(1);
      cellGiorno.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "B17457" },
      };
      cellGiorno.font = { bold: true, color: { argb: "FAF7F0" }, size: 10 };
      cellGiorno.alignment = { horizontal: "center", vertical: "middle" };
      cellGiorno.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=turni_${nomeMese}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nella creazione del file Excel" });
  }
});

//I create a route to read the file insert by the manager
Router.post("/letturaFile", upload.single("file"), async (req, res) => {
  try {
    //I check if there is the file
    if (!req.file) {
      return res.status(400).json({ message: "Nessun file caricato" });
    }
    //I create a new excel file
    const workbookRead = new exceljs.Workbook();
    //I use the method to read the file insert by the manager
    await workbookRead.xlsx.readFile(req.file.path);
    //I select the first sheet of the excel
    const foglio = workbookRead.worksheets[0];
    const inserted = [];

    //I start to iterate by the line 6, so the first line where the shifts start
    for (let rowNumber = 6; rowNumber <= foglio.rowCount; rowNumber++) {
      //I take the row where i will take the data
      const row = foglio.getRow(rowNumber);
      //I obtain each value of the day, turno1, turno2, turno3, turno4
      const giorno = row.getCell(1).value ?? "";
      const turno1 = row.getCell(2).value ?? "";
      const turno2 = row.getCell(3).value ?? "";
      const turno3 = row.getCell(4).value ?? "";
      const turno4 = row.getCell(5).value ?? "";


      //I insert into the shift's table and i insert everything in the array
      const result = await db.query(
        `INSERT INTO orario (giorno, turno_1, turno_2, turno_3, turno_4)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (giorno) DO UPDATE
         SET turno_1 = EXCLUDED.turno_1,
         turno_2 = EXCLUDED.turno_2,
         turno_3 = EXCLUDED.turno_3,
         turno_4 = EXCLUDED.turno_4
         RETURNING *`,
        [giorno, turno1, turno2, turno3, turno4]
      );

      inserted.push(result.rows[0]);
    }

    let queryLavoratori = await db.query(
      "SELECT username, email FROM dati_accesso"
    );

    res.status(200).json({
      success: true,
      message: "Turni inseriti correttamente ed email inviate con successo",
    });
    const emailPromises = queryLavoratori.rows
      .filter((lavoratore) => lavoratore.email)
      .map((lavoratore) => {
        const emailOrariHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Nuovi turni di lavoro disponibili</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${
          lavoratore.username
        },</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Ti informiamo che sono stati pubblicati i <strong>nuovi turni di lavoro del prossimo mese</strong>.
          Ti invitiamo a consultarli direttamente dalla nostra piattaforma.
        </p>

        <div style="background-color: #D8D2C2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; line-height: 1.5; font-size: 14px;">
            Ti ricordiamo che eventuali cambi di turno devono essere comunicati
            alla direzione .
          </p>
        </div>


        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.barmartinis.com/" 
             style="background-color: #B17457; color: #FAF7F0; text-decoration: none; 
                    padding: 14px 28px; border-radius: 8px; font-weight: bold; 
                    display: inline-block; font-size: 15px;">
            Consulta i tuoi turni
          </a>
        </div>
      </div>
      
      <div style="background-color: #FAF7F0; padding: 15px; text-align: center; font-size: 12px; color: #4A4947;">
        © ${new Date().getFullYear()} Bar Martinis · Ovaro<br>
        Questo messaggio è generato automaticamente, non rispondere a questa email.
      </div>
    </div>
  </div>
`;

        const workerMailOrarioOptions = {
          from: process.env.EMAIL_USER,
          to: lavoratore.email,
          subject: `Usciti i turni di lavoro del prossimo mese`,
          html: emailOrariHtml,
        };

        return sendMailAsync(workerMailOrarioOptions);
      });

    await Promise.all(emailPromises);
  } catch (err) {
    console.error("Errore backend:", err);
    res
      .status(500)
      .json({ message: "Errore nella lettura/inserimento del file Excel" });
  }
});

//I create a route to see the day's home request
Router.get("/visioneRichiesteGiorni", async (req, res) => {
  try {
    //I made a join between the tables to see the username
    let query = await db.query(
      `SELECT 
      g.id, 
      g.giorno, 
      g.status, 
      g.giorno_richiesta, 
      u.username
      FROM giorni_riposo g
      JOIN dati_accesso u ON g.lavoratore_id = u.id
      ORDER BY g.id DESC LIMIT 16`
    );

    res
      .status(200)
      .json({ message: "Dati arrivati con successo", dati: query.rows });
  } catch (err) {
    res.status(500).json({
      message: "Problemi nell'arrivo dei dati delle richieste giorni",
      err,
    });
    console.log("Problema nell'arrivo dei dati delle richieste giorni", err);
  }
});

//I made a route to give an answer to the worker by the manager
Router.post("/invioStatusGiorno", async (req, res) => {
  //I take the answer and the id of the request
  const { valoreStatusGiorni, idRichiestaGiorno } = req.body;
  //I check if there are those
  if (!valoreStatusGiorni || !idRichiestaGiorno) {
    return res
      .status(400)
      .json({ message: "Approvare o disapprovare richiesta" });
  }

  try {
    //I update the table with the answer by the owner where there is that id
    let query = await db.query(
      "UPDATE giorni_riposo SET status = $1 WHERE id = $2 RETURNING *",
      [valoreStatusGiorni, idRichiestaGiorno]
    );

    let queryEmailRispostaGiorni = await db.query(
      "SELECT g.status, g.giorno, u.username, u.email FROM giorni_riposo g JOIN dati_accesso u ON g.lavoratore_id = u.id WHERE g.id = $1",
      [idRichiestaGiorno]
    );

    res.status(200).json({
      success: true,
      message: "Risposta inviata con successo",
    });

    let lavoratore = queryEmailRispostaGiorni.rows[0];

    let RispostaGiornoHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Aggiornamento richiesta giorno libero</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${
          lavoratore.username
        },</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          La tua richiesta per il giorno <strong>${new Date(
            lavoratore.giorno
          ).toLocaleDateString()}</strong> ha avuto esito:
        </p>
        
        <div style="background-color: #D8D2C2; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 16px; font-weight: bold; color: ${
            lavoratore.status === "approvato" ? "#2e7d32" : "#c62828"
          };">
            ${lavoratore.status.toUpperCase()}
          </span>
        </div>
        
        <p style="line-height: 1.6; font-size: 14px;">
          Per eventuali problemi o chiarimenti contatta la direzione al numero: <br>
          <strong>+39 340 006 5906</strong>
        </p>
      </div>
      
      <div style="background-color: #FAF7F0; padding: 15px; text-align: center; font-size: 12px; color: #4A4947;">
        © ${new Date().getFullYear()} Bar Martinis · Ovaro<br>
        Questo messaggio è generato automaticamente, non rispondere a questa email.
      </div>
    </div>
  </div>
`;

    let emailRispostaGiorno = {
      from: process.env.EMAIL_USER,
      to: lavoratore.email,
      subject: "Risposta alla richiesta di giorno libero",
      html: RispostaGiornoHtml,
    };

    transporter.sendMail(emailRispostaGiorno, (error, info) => {
      if (error) {
        console.error("Errore nell'invio della mail al lavoratore", error);
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al lavoratore" });
      }

      console.log("Email inviata al lavoratore", info.response);
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Impossibile inviare risposte ai dipendenti", err });
    console.log("Impossibile inviare le risposte ai dipendenti", err);
  }
});

//I create a route to see the request of the holidays
Router.get("/visioneVacanze", async (req, res) => {
  try {
    //I made a join query to the tables to take the username
    let query = await db.query(
      `SELECT
      v.id, 
      v.giorno_inizio, 
      v.giorno_fine,
      v.status,
      u.username
      FROM vacanze v
      JOIN dati_accesso u ON v.lavoratore_id = u.id
      ORDER BY v.id DESC LIMIT 16`
    );

    res
      .status(200)
      .json({ message: "Dati ricevuti con successo", dati: query.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Impossibile l'arrivo delle richeiste vacanze", err });
    console.log("Impossibile l'arrivo delle richeiste delle vacanze", err);
  }
});

//I made a route to send the answer to the worker
Router.post("/invioStatusVacanze", async (req, res) => {
  //I take the asnwer and the id of the request
  const { valoreStatusVacanze, idRichiestaVacanza } = req.body;
  //I check if there are those
  if (!valoreStatusVacanze || !idRichiestaVacanza) {
    return res.status(400).json({ message: "Inserire i valori" });
  }

  try {
    //I send the answer to the employee
    let query = await db.query(
      "UPDATE vacanze SET status = $1 WHERE id = $2 RETURNING *",
      [valoreStatusVacanze, idRichiestaVacanza]
    );

    let queryEmailRisposta = await db.query(
      "SELECT v.status, v.giorno_inizio, v.giorno_fine, u.username, u.email FROM vacanze v JOIN dati_accesso u ON v.lavoratore_id = u.id WHERE v.id = $1",
      [idRichiestaVacanza]
    );

    res.status(200).json({
      success: true,
      message: "Risposta inviata con successo",
    });

    const lavoratore = queryEmailRisposta.rows[0];

    let emailRispostaVacanzeHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Aggiornamento richiesta ferie</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${
          lavoratore.username
        },</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          La tua richiesta di ferie dal <strong>${new Date(
            lavoratore.giorno_inizio
          ).toLocaleDateString()}</strong> 
          al <strong>${new Date(
            lavoratore.giorno_fine
          ).toLocaleDateString()}</strong> ha avuto esito:
        </p>
        
        <div style="background-color: #D8D2C2; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 16px; font-weight: bold; color: ${
            lavoratore.status === "approvato" ? "#2e7d32" : "#c62828"
          };">
            ${lavoratore.status.toUpperCase()}
          </span>
        </div>
        
        <p style="line-height: 1.6; font-size: 14px;">
          Per eventuali problemi o chiarimenti contatta la direzione al numero: <br>
          <strong>+39 340 006 5906</strong>
        </p>
      </div>
      
      <div style="background-color: #FAF7F0; padding: 15px; text-align: center; font-size: 12px; color: #4A4947;">
        © ${new Date().getFullYear()} Bar Martinis · Ovaro<br>
        Questo messaggio è generato automaticamente, non rispondere a questa email.
      </div>
    </div>
  </div>
`;

    let emailRispostavacanze = {
      from: process.env.EMAIL_USER,
      to: lavoratore.email,
      subject: "Risposta alla richiesta periodo vacanze",
      html: emailRispostaVacanzeHtml,
    };

    transporter.sendMail(emailRispostavacanze, (error, info) => {
      if (error) {
        console.error("Errore nell'invio della mail al lavoratore", error);
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al lavoratore" });
      }

      console.log("Email inviata al lavoratore", info.response);
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "problema di aggiornamento dati vacanze", err });
    console.log("Problema di aggiornamento dati vacanze", err);
  }
});

//I create a route to see the every positive days answers
Router.get("/visioneApprovatiGiorni", async (req, res) => {
  try {
    // I declare a variable to see where is written
    let approvato = "approvato";
    //I made a query to select the rows where there is the status "approvato"
    let query = await db.query(
      `SELECT 
      g.id, 
      g.giorno, 
      g.status, 
      g.giorno_richiesta, 
      u.username
      FROM giorni_riposo g
      JOIN dati_accesso u ON g.lavoratore_id = u.id
      WHERE g.status = $1
      ORDER BY g.id DESC
      LIMIT 16;
      `,
      [approvato]
    );

    res
      .status(200)
      .json({ message: "Dati in arrivo correttamente", dati: query.rows });
  } catch (err) {
    res.status(500).json({
      message:
        "Errore nella ricezione delle righe con status approvato dei giorni",
    });
    console.log(
      "Errore nella ricezione delle righe con status approvato dei giorni",
      err
    );
  }
});

//I create a route to see the the rows of the holidays where the status is positive
Router.get("/visioneApprovatiVacanze", async (req, res) => {
  try {
    let approvato = "approvato";
    //I made a query to take the rows where the status is positive
    let query = await db.query(
      `SELECT
      v.id, 
      v.giorno_inizio, 
      v.giorno_fine,
      v.status,
      u.username
      FROM vacanze v
      JOIN dati_accesso u ON v.lavoratore_id = u.id
      WHERE v.status = $1
      ORDER BY v.id DESC LIMIT 16`,
      [approvato]
    );

    res
      .status(200)
      .json({ message: "Dati arrivati correttamente", dati: query.rows });
  } catch (err) {
    res.status(500).json({
      message: "Dati non arrivati delle righe con status positivo vacanze",
      err,
    });
    console.log(
      "Dati non arrivati delle righe con status positivo vacanze",
      err
    );
  }
});

//I create a route to send the pdf
Router.post("/invioPDF", pdfCartel.single("file"), async (req, res) => {
  //I check if there is the file
  if (!req.file) {
    return res.status(400).json({ message: "File non inserito" });
  }

  try {
    //Them i select the path where i want to see the pdf
    const uploadPath = path.resolve("public/pdf/menu.pdf");

    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    //i send the pdf to the correct path
    fs.renameSync(req.file.path, uploadPath);

    res.status(200).json({ message: "File caricato correttamente" });
  } catch (err) {
    console.error("Errore durante il salvataggio PDF:", err);
    res.status(500).json({ message: "Errore nel salvataggio file", err });
  }
});

//I create a route to download the image of the qr code
Router.get("/qrcode/download", async (req, res) => {
  try {
    const url = "https://www.barmartinis.com/menu";
    const qrBuffer = await QRCode.toBuffer(url);

    res.setHeader("Content-Disposition", "attachment; filename=menu-qr.png");
    res.setHeader("Content-Type", "image/png");
    res.send(qrBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore generazione QR");
  }
});

Router.get("/visualizzaDatiTrasporto", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  let anno = new Date().getFullYear();

  const meseNum = parseInt(mese, 10);

  try {
    let query = await db.query(
      "SELECT t.id, t.nome_fornitore, t.nome_prodotto, t.condizione_trasporto, t.integrita_confezioni, t.etichettatura, t.infestanti, t.temperatura, t.giorno, u.username FROM trasporto t JOIN dati_accesso u ON t.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM t.giorno) = $1 AND EXTRACT(YEAR FROM t.giorno) = $2 ORDER BY t.giorno DESC",
      [meseNum, anno]
    );

    res
      .status(200)
      .json({ message: "Dati di mese e anno ottenuti", dati: query.rows });
  } catch (err) {
    res.status(500).json({ message: "Impossibile prende i dati trasporto" });
  }
});

Router.get("/visualizzaDatiIgiene", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  let anno = new Date().getFullYear();

  const meseNum = parseInt(mese, 10);

  try {
    let query = await db.query(
      "SELECT i.id, i.giorno, i.controllo, i.locale, i.attrezzature, i.personale,  u.username FROM igiene i JOIN dati_accesso u ON i.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM i.giorno) = $1 AND EXTRACT(YEAR FROM i.giorno) = $2 ORDER BY i.giorno DESC",
      [meseNum, anno]
    );

    res
      .status(200)
      .json({ message: "Dati di mese e anno ottenuti", dati: query.rows });
  } catch (err) {
    res.status(500).json({ message: "Impossibile prende i dati igiene" });
  }
});

Router.get("/visualizzaDatiTemperature", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  let anno = new Date().getFullYear();

  const meseNum = parseInt(mese, 10);

  try {
    let query = await db.query(
      "SELECT t.id, t.giorno, t.parte_giornata, t.n1, t.n2, t.n3, t.bar, t.gelati, t.vini, t.bibite, u.username FROM temperature t JOIN dati_accesso u ON t.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM t.giorno) = $1 AND EXTRACT(YEAR FROM t.giorno) = $2 ORDER BY t.giorno DESC",
      [meseNum, anno]
    );

    res
      .status(200)
      .json({ message: "Dati di mese e anno ottenuti", dati: query.rows });
  } catch (err) {
    res.status(500).json({ message: "Impossibile prende i dati temperature" });
  }
});

Router.get("/excelTrasporti", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  const meseNum = parseInt(mese, 10);
  const anno = new Date().getFullYear();

  const workBookTrasporti = new exceljs.Workbook();
  const sheetTrasporti = workBookTrasporti.addWorksheet(
    "Scheda controlli trasporti"
  );

  sheetTrasporti.columns = [
    { header: "Giorno", key: "giorno", width: 15 },
    { header: "Fornitore", key: "nome_fornitore", width: 20 },
    { header: "Prodotto", key: "nome_prodotto", width: 20 },
    { header: "Condizione Trasporto", key: "condizione_trasporto", width: 20 },
    { header: "Integrità confezioni", key: "integrita_confezioni", width: 20 },
    { header: "Etichettatura", key: "etichettatura", width: 20 },
    { header: "Infestanti", key: "infestanti", width: 15 },
    { header: "Temperatura", key: "temperatura", width: 15 },
  ];

  const title = sheetTrasporti.insertRow(1, [
    `Scheda controllo norme trasporti - mese ${meseNum}/${anno}`,
  ]);
  title.font = { size: 14, bold: true, color: { argb: "B17457" } };
  title.alignment = { horizontal: "center", vertical: "middle" };

  sheetTrasporti.mergeCells(1, 1, 1, 4);

  sheetTrasporti.insertRow(2, []);

  const headerRow = sheetTrasporti.getRow(3);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let query = await db.query(
    "SELECT t.id, t.nome_fornitore, t.nome_prodotto, t.condizione_trasporto, t.integrita_confezioni, t.etichettatura, t.infestanti, t.temperatura, t.giorno, u.username FROM trasporto t JOIN dati_accesso u ON t.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM t.giorno) = $1 AND EXTRACT(YEAR FROM t.giorno) = $2 ORDER BY t.giorno DESC",
    [meseNum, anno]
  );

  query.rows.forEach((trasporto) => {
    let row = sheetTrasporti.addRow({
      giorno: trasporto.giorno,
      nome_fornitore: trasporto.nome_fornitore,
      nome_prodotto: trasporto.nome_prodotto,
      condizione_trasporto: trasporto.condizione_trasporto,
      integrita_confezioni: trasporto.integrita_confezioni,
      etichettatura: trasporto.etichettatura,
      infestanti: trasporto.infestanti,
      temperatura: trasporto.temperatura,
    });

    const cellGiorno = row.getCell(1);
    cellGiorno.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cellGiorno.font = { bold: true, color: { argb: "FAF7F0" }, size: 10 };
    cellGiorno.alignment = { horizontal: "center", vertical: "middle" };
    cellGiorno.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=TrasportiFile.xlsx`
  );

  await workBookTrasporti.xlsx.write(res);
  res.end();
});

Router.get("/excelIgiene", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  const meseNum = parseInt(mese, 10);
  const anno = new Date().getFullYear();

  const workBookIgiene = new exceljs.Workbook();
  const sheetIgiene = workBookIgiene.addWorksheet("Scheda controlli igiene");

  sheetIgiene.columns = [
    { header: "Giorno", key: "giorno", width: 15 },
    { header: "Parte Giornata", key: "controllo", width: 20 },
    { header: "igiene Locale", key: "locale", width: 20 },
    { header: "Igiene Attrezzature", key: "attrezzature", width: 20 },
    { header: "Igiene Personale", key: "personale", width: 20 },
    { header: "Firma", key: "username", width: 20 },
  ];

  const title = sheetIgiene.insertRow(1, [
    `Scheda controllo norme igiene- mese ${meseNum}/${anno}`,
  ]);
  title.font = { size: 14, bold: true, color: { argb: "B17457" } };
  title.alignment = { horizontal: "center", vertical: "middle" };

  sheetIgiene.mergeCells(1, 1, 1, 4);

  sheetIgiene.insertRow(2, []);

  const headerRow = sheetIgiene.getRow(3);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let query = await db.query(
    "SELECT i.id, i.giorno, i.controllo, i.locale, i.attrezzature, i.personale,  u.username FROM igiene i JOIN dati_accesso u ON i.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM i.giorno) = $1 AND EXTRACT(YEAR FROM i.giorno) = $2 ORDER BY i.giorno DESC",
    [meseNum, anno]
  );

  query.rows.forEach((igiene) => {
    let row = sheetIgiene.addRow({
      giorno: igiene.giorno,
      controllo: igiene.controllo,
      locale: igiene.locale,
      attrezzature: igiene.attrezzature,
      personale: igiene.personale,
      username: igiene.username,
    });

    const cellGiorno = row.getCell(1);
    cellGiorno.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cellGiorno.font = { bold: true, color: { argb: "FAF7F0" }, size: 10 };
    cellGiorno.alignment = { horizontal: "center", vertical: "middle" };
    cellGiorno.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=IgieneFile.xlsx`);

  await workBookIgiene.xlsx.write(res);
  res.end();
});

Router.get("/excelTemperature", async (req, res) => {
  const { mese } = req.query;

  if (!mese) {
    return res.status(400).json({ message: "Selezionare un mese" });
  }

  const meseNum = parseInt(mese, 10);
  const anno = new Date().getFullYear();

  const workBookTemperature = new exceljs.Workbook();
  const sheetTemperature = workBookTemperature.addWorksheet(
    "Scheda controlli Temperature frighi"
  );

  sheetTemperature.columns = [
    { header: "Giorno", key: "giorno", width: 15 },
    { header: "Parte Giornata", key: "parte_giornata", width: 20 },
    { header: "Frigo1", key: "n1", width: 20 },
    { header: "Frigo2", key: "n2", width: 20 },
    { header: "Frigo3", key: "n3", width: 20 },
    { header: "Frigo Bar", key: "bar", width: 20 },
    { header: "Frigo Gelati", key: "gelati", width: 20 },
    { header: "Frigo Vini", key: "vini", width: 20 },
    { header: "Frigo Bibite", key: "bibite", width: 20 },
    { header: "Firma", key: "username", width: 20 },
  ];

  const title = sheetTemperature.insertRow(1, [
    `Scheda controllo Temperature frighi- mese ${meseNum}/${anno}`,
  ]);
  title.font = { size: 14, bold: true, color: { argb: "B17457" } };
  title.alignment = { horizontal: "center", vertical: "middle" };

  sheetTemperature.mergeCells(1, 1, 1, 4);

  sheetTemperature.insertRow(2, []);

  const headerRow = sheetTemperature.getRow(3);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  let query = await db.query(
    "SELECT t.id, t.giorno, t.parte_giornata, t.n1, t.n2, t.n3, t.bar, t.gelati, t.vini, t.bibite, u.username FROM temperature t JOIN dati_accesso u ON t.lavoratore_id = u.id WHERE EXTRACT(MONTH FROM t.giorno) = $1 AND EXTRACT(YEAR FROM t.giorno) = $2 ORDER BY t.giorno DESC",
    [meseNum, anno]
  );

  query.rows.forEach((temperatura) => {
    let row = sheetTemperature.addRow({
      giorno: temperatura.giorno,
      n1: temperatura.n1,
      n2: temperatura.n2,
      n3: temperatura.n3,
      bar: temperatura.bar,
      gelati: temperatura.gelati,
      vini: temperatura.vini,
      bibite: temperatura.bibite,
      username: temperatura.username,
    });

    const cellGiorno = row.getCell(1);
    cellGiorno.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B17457" },
    };
    cellGiorno.font = { bold: true, color: { argb: "FAF7F0" }, size: 10 };
    cellGiorno.alignment = { horizontal: "center", vertical: "middle" };
    cellGiorno.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=TemperatureFile.xlsx`
  );

  await workBookTemperature.xlsx.write(res);
  res.end();
});

Router.post;

export default Router;
