import express from "express";

import exceljs from "exceljs";

import { database } from "../config/db.js";

import { differenzaOre } from "./function.js";

const Router = express.Router();

const db = await database();

const workbook = new exceljs.Workbook();

import nodemailer from "nodemailer";

import mailjetTransport from "nodemailer-mailjet-transport";

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

//I create an API to insert into the db the values of a umor's employees
Router.post("/valoriumore", async (req, res) => {
  //I take the value of the umor and the user_id to find who's insert this value
  const { valore } = req.body;

  if (!req.session.userId) {
    return res.status(401).json({ message: "Utente non autenticato" });
  }
  //If check if the employee has insert a value
  if (!valore) {
    return res.status(400).json({ message: "Inserire tutti i campi" });
  }
  //I ckeck if the value is undefine, isn't a value o is bigger than 10 or smaller than 0
  if (valore === undefined || isNaN(valore || valore < 0 || valore > 10)) {
    return res.status(400).json({ message: "Valore non valido" });
  }

  try {
    //I insert into the db the value and the user_id
    let query = await db.query(
      "INSERT INTO valorifelicita(valore, user_id) VALUES ($1, $2) RETURNING *",
      [valore, req.session.userId]
    );
    //If this process works i give a successful message
    res.status(200).json({ message: "Inserimento avvenuto con successo" });
  } catch (err) {
    res.status(500).json({ message: "Interanle server error", err });
    console.log("Problema del server", err);
  }
});

//Create a route to show the data
Router.get("/writevaloriumore", async (req, res) => {
  //Of course i request the user_id to search the values of each person
  const id_utente = req.session.userId;
  //If check if the user is logged
  if (!id_utente) {
    return res.status(401).json({ message: "Utente non autenticato" });
  }

  try {
    //I take the values "valore" and "giorno" where the user_id is equal to the user_id of the person
    let query = await db.query(
      "SELECT valore, giorno FROM valorifelicita WHERE user_id = $1",
      [id_utente]
    );
    //I see the values
    console.log(query);
    //I give a positive answer if is everthing ok
    res
      .status(200)
      .json({ message: "Dati recuperati con successo", data: query.rows });
  } catch (err) {
    res.status(500).json({ message: "Errore di recupero dati", err });
    console.log("Errore nel server", err);
  }
});

//Create  a route to send communication between the employees
Router.post("/sendCommunication", async (req, res) => {
  //Request the id session to know who's send communication
  const id = req.session.userId;
  //Take the communication from the form
  const { messaggio } = req.body;
  //I check if the user is logged
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }
  //I check if the message field is fill
  if (!messaggio) {
    return res.status(400).json({ message: "Inserire comunicazione" });
  }

  try {
    //I insert the id and the message in the db and the id of the message and the time are set automaticcaly
    let query = await db.query(
      "INSERT INTO chat_bar(messaggio, user_messaggio_id) VALUES($1, $2) RETURNING*",
      [messaggio, id]
    );

    let queryComunicazioneGmail = await db.query(
      "SELECT email, username FROM dati_accesso"
    );

    const emailPromises = queryComunicazioneGmail.rows
      .filter((lavoratore) => lavoratore.email)
      .map((lavoratore) => {
        const emailComunicazioniHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">

      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Nuova Comunicazione</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao ${
          lavoratore.username
        },</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Ti invitiamo a visualizzare la nuova comunicazione presente nella piattaforma.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.barmartinis.com/" 
             style="background-color: #B17457; color: #FAF7F0; text-decoration: none; 
                    padding: 14px 28px; border-radius: 8px; font-weight: bold; 
                    display: inline-block; font-size: 15px;">
            Visualizza comunicazione
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

        const workerMailComunicazioniOptions = {
          from: process.env.EMAIL_USER,
          to: lavoratore.email,
          subject: `Nuova comunicazione`,
          html: emailComunicazioniHtml,
        };

        return sendMailAsync(workerMailComunicazioniOptions);
      });

    await Promise.all(emailPromises);

    res.status(200).json({
      message: "Comunicazione inviata correttamente e messaggio inviato",
    });
    console.log(query.rows);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", err });
    console.log("Problema nell'invio della comunicazione", err);
  }
});

//Create a route to give the information about the communication, with the message and who's send the message
Router.get("/getcommunication", async (req, res) => {
  try {
    //I made a query where i join the tables of chat_bar and dati_accesso to take the message and the username of the persona who's write
    let query = await db.query(
      `SELECT c.id, c.messaggio, c.orario, u.username
       FROM chat_bar c
       JOIN dati_accesso u ON c.user_messaggio_id = u.id
       ORDER BY c.orario DESC`
    );
    //I give the positive information if is all ok
    res.status(200).json({
      message: "Informazioni ricevute correttamente",
      data: query.rows,
    });
    console.log(query.rows);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", err });
    console.error("Arrivo comunicazioni non riuscito", err);
  }
});

//I creato the route to delete communication
Router.post("/eliminazioneComunicazione", async (req, res) => {
  //i take the id of the row's communication
  const { idComunicazione } = req.body;
  //I check if there is the id
  if (!idComunicazione) {
    return res.status(400).json({ message: "Selezionare comunicazione" });
  }

  try {
    //I delete the row where the id corrispond
    let query = await db.query(
      "DELETE FROM chat_bar WHERE id = $1 RETURNING *",
      [idComunicazione]
    );

    res.status(200).json({ message: "Prodotto eliminato con successo" });
    console.log(query.rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problemi nell'eliminazione della comunicazione", err });
    console.log("Errore nell'eliminazione della comunicazione", err);
  }
});

//I create a route to insert the start work's time of the user
Router.post("/inserimentoInizioTurno", async (req, res) => {
  console.log("BODY:", req.body);
  //I take the day and the initial time
  const { giorno, oraInizio } = req.body;
  //I take the id of the employe
  const id = req.session.userId;
  //I chek if the worker is autenticate
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }
  //I check if the fields of day and start time is filled
  if (!giorno || !oraInizio) {
    return res.status(400).json({ message: "Inserire tutti i campi" });
  }

  try {
    //I insert the data so the day and the start time
    let query = await db.query(
      "INSERT INTO turni(giorno, ora_inizio, lavoratore_id) VALUES ($1, $2, $3) RETURNING*",
      [giorno, oraInizio, id]
    );
    //If the query is ok i give a positive answer
    res.status(200).json({
      message: "Inizio turno inserito correttamente",
    });
    console.log(query.rows);
  } catch (err) {
    res.status(500).json({
      message: "Problemi nell'inserimento dell'inizio del turno",
      err,
    });
    console.log("Errore nell'inserimento dell'inizio del turno", err);
  }
});

//Create a route to inser the finish work's time
Router.post("/inserimentoFineTurno", async (req, res) => {
  //I take the time of fine turno
  const { fineTurno } = req.body;
  //I request the id
  const id = req.session.userId;
  //I check if there is the ID
  if (!id) {
    return res.status(400).json({ message: "Utente non autenticato" });
  }
  //I check if the field of fineTurno is fill
  if (!fineTurno) {
    return res.status(400).json({ message: "Inserire valore nel campo" });
  }

  try {
    //I made a query where i set ora_fine where there is the id of a worker and where the field of ora_fine isn't fill in db
    let query = await db.query(
      `UPDATE turni 
             SET ora_fine = $1 
             WHERE lavoratore_id = $2 
             AND ora_fine IS NULL
             RETURNING *`,
      [fineTurno, id]
    );
    //I check if there was a start work's time
    if (query.rows.length === 0) {
      return res.status(404).json({ message: "Nessun turno aperto trovato" });
    }
    //Then i give a positive answer
    res.status(200).json({ message: "Orario di fine turno inserito" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problemi nell'inserimento della fine del turno", err });
    console.log("Errore nell'inserimento della fine del turno", err);
  }
});

//I create a route to see the work of every employee
Router.get("/visioneTurni", async (req, res) => {
  //I request the user id
  const id = req.session.userId;
  //I check if there is the user id
  if (!id) {
    return res.status(400).json({ message: "Utente non autenticato" });
  }

  const annoCorrente = new Date().getFullYear();
  try {
    //I made a query where i select the id, the day, the start and the finish time of work where the lavoratore_id is associted with the user_id
    let query = await db.query(
      "SELECT id, giorno, ora_inizio, ora_fine FROM turni WHERE lavoratore_id = $1  AND EXTRACT(YEAR FROM giorno) = $2",
      [id, annoCorrente]
    );

    res
      .status(200)
      .json({ message: "Dati ricevuti con successo", data: query.rows });
  } catch (err) {
    res.status(500).json({
      message: "Errore nella visualizzazione dei dati dei turni",
      err,
    });
    console.log("Errore nella visualizzazione dei dati dei turni", err);
  }
});

//I create a route to delete the shifts
Router.post("/eliminazioneTurni", async (req, res) => {
  //I request the id of the row where there is the shift
  const { idTurno } = req.body;
  //I check if there is the id
  if (!idTurno) {
    return res.status(400).json({ message: "Scegliere turno da eliminare" });
  }

  try {
    //I made a query where i delete the shift where there is this id
    let query = await db.query("DELETE FROM turni WHERE id = $1", [idTurno]);

    res.status(200).json({ message: "Turno eliminato con successo" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problema nell'eliminazione del turno", err });
    console.log("Problema nell'eliminazione del turno", err);
  }
});

//I made a route to insert the products
Router.post("/inserimentoProdotti", async (req, res) => {
  //I request the userid to know who insert the product
  const id = req.session.userId;
  //I request the item, the tipoly, the importance, and maybe the notes
  const { item, tipologia, importanza, nota } = req.body;
  //i check if there is the id
  if (!id) {
    return res.status(400).json({ message: "Utente non autenticato" });
  }
  //I check if there are the item tipoly and importance, not the notes because are not mandatorys
  if (!item || !tipologia || !importanza) {
    return res.status(400).json({ message: "Compilare tutti i campi" });
  }

  try {
    //I made a query where i insert the new item with his features in the table
    let query = await db.query(
      "INSERT INTO lista_spesa(item, tipologia, importanza, nota, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [item, tipologia, importanza, nota, id]
    );

    res.status(200).json({ message: "Prodotti inseriti correttamente" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problema nell'inserimento del prodotto", err });
    console.log("Problema nell'inserimento del prodotto", err);
  }
});

//I made a query to delete the item
Router.post("/eliminazioneProdotto", async (req, res) => {
  //I reuqest the product id
  const { idProdotto } = req.body;
  //I check if there is the product id
  if (!idProdotto) {
    return res.status(400).json({ message: "Selezionare il prodotto" });
  }

  try {
    //I made a query where i delete the row where there is the id
    let query = await db.query(
      "DELETE FROM lista_spesa WHERE id = $1 RETURNING *",
      [idProdotto]
    );

    res.status(200).json({ message: "Prodotto eliminato con successo" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problema nell'eliminazione del prodotto", err });
    console.log("Problema nell'eliminazione del prodotto", err);
  }
});

//I made a route to change the type of "absence" of the product
Router.post("/modificaAssenzaProdotto", async (req, res) => {
  //I request the id and the new type of absence
  const { id, nuovaAssenza } = req.body;
  //I check if there are the id and the absence level
  if (!id || !nuovaAssenza) {
    return res
      .status(400)
      .json({ message: "Id della riga da modificare non trovato" });
  }

  try {
    //I made a query where i insert the new type of absence where there is the id
    let query = await db.query(
      "UPDATE lista_spesa SET importanza = $1 WHERE id = $2 RETURNING *",
      [nuovaAssenza, id]
    );

    res.status(200).json({ message: "Cambio fatto con successo" });
  } catch (err) {
    res.status(500).json({
      message: "Errore nell'inserimento del nuovo tipo di assenza",
      err,
    });
    console.log("Errore nell'inserimento del nuovo tipo di assenza", err);
  }
});

//I create a route to see the shopping list
Router.get("/ricezioneListaSpesa", async (req, res) => {
  try {
    //I made a join to select the username for knowing who's insert the product
    let query = await db.query(
      "SELECT lista_spesa.id, lista_spesa.item, lista_spesa.tipologia, lista_spesa.importanza, lista_spesa.nota, dati_accesso.username FROM lista_spesa JOIN dati_accesso ON lista_spesa.user_id = dati_accesso.id "
    );
    //I check if there is some product
    if (query.rows.length == 0) {
      return res.status(200).json({ message: "Nessun prodotto nella lista" });
    }

    res.status(200).json({
      message: "Ricezione dati lista della spesa avvenuti con successo",
      data: query.rows,
    });
  } catch (err) {
    res.status(500).json({
      message: "Errore nella ricezione dei dati sulla lista della spesa",
      err,
    });
    console.log("Errore nella ricezione dei dati sulla lista della spesa", err);
  }
});

//I create a route to creata a excel sheet where the employees can get his month work's hours
Router.get("/fileemploye", async (req, res) => {
  //I request the month
  const { mese } = req.query;
  //I request the id of the employee
  const idLavoratore = req.session.userId;
  //I check if there is the month
  if (!mese) {
    return res.status(400).json({ message: "Selezionare mese" });
  }
  //I check if there is the worker's id
  if (!idLavoratore) {
    res.status(400).json({ message: "Utente non loggato" });
  }

  try {
    //I made a query where i select every row where there is the id
    let query = await db.query("SELECT * FROM turni WHERE lavoratore_id = $1", [
      idLavoratore,
    ]);

    //I create a new sheet called "turni"
    const sheet = workbook.addWorksheet("Turni");

    //I create the headers of the table
    sheet.columns = [
      { header: "Giorno", key: "giorno" },
      { header: "Ora Inizio", key: "ora_inizio" },
      { header: "Ora Fine", key: "ora_fine" },
      { header: "Ore Totali", key: "ore_tot" },
    ];

    //I take the first row and i add some style for this row
    const headerRow = sheet.getRow(1);

    headerRow.eachCell((cell, colNumber) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 10,
      };

      cell.alignment = { horizontal: "center", vertical: "middle" };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDC143C" },
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    //I map the months
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
    //I check whic month the worker has selected
    const meseSelezionato = mesi[mese];
    //For each row of the query
    query.rows.forEach((row) => {
      const meseTurno = new Date(row.giorno).getMonth() + 1;
      const meseStr = meseTurno.toString().padStart(2, "0");
      //I select just the rows where the month is right
      if (meseStr != meseSelezionato) return;
      //Then i write on this table the information about the month
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
    console.log(err);
    res.status(500).json({ message: "problemi nell'arrivo dei dati al file" });
  }
});

//I create a route to select the table shift of the selected month
Router.get("/ottieniOrari", async (req, res) => {
  //So i take the month
  const { mese } = req.query;

  let year = new Date().getFullYear();
  let currentMonth = new Date().getMonth() + 1;

  try {
    let query;
    //I check if there is month
    if (mese) {
      if (currentMonth === 12 && mese.toLocaleLowerCase() === "gennaio") {
        query = await db.query(
          "SELECT * FROM orario WHERE LOWER(giorno) LIKE $1 AND LOWER(giorno) LIKE $2 ORDER BY id ASC",
          [`%${mese.toLowerCase()}%`, `%${year + 1}%`]
        );
      } else {
        //Then i made a query where i select everything from orario where there is the month selected
        query = await db.query(
          "SELECT * FROM orario WHERE LOWER(giorno) LIKE $1 AND LOWER(giorno) LIKE $2 ORDER BY id ASC",
          [`%${mese.toLowerCase()}%`, `%${year}%`]
        );
      }
    } else {
      query = await db.query("SELECT * FROM orario ORDER BY id ASC");
    }

    res.status(200).json({
      message: "Dati ottenuti correttamente",
      data: query.rows,
    });
  } catch (err) {
    console.log("Problema nella ricezione dei dati dell'orario", err);
    res
      .status(500)
      .json({ message: "Problema di ricezione dati dell'orario", err });
  }
});

//I made a route to send the holiday's requests
Router.post("/invioDateFerie", async (req, res) => {
  //I take the start day and the end day
  const { giornoInizio, giornoFine } = req.body;
  //I request the userid
  let id = req.session.userId;
  //I declare a variable in which there is a string "In attesa"
  let statusAttesa = "In attesa";
  //I check if there is the id
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }
  //i check if there are the start day and the end day
  if (!giornoInizio || !giornoFine) {
    return res.status(400).json({ message: "Compilare tutti i campi" });
  }

  try {
    //Then i made a query to insert the data into the table
    let query = await db.query(
      "INSERT INTO vacanze(giorno_inizio, giorno_fine, status, lavoratore_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [giornoInizio, giornoFine, statusAttesa, id]
    );

    res.status(200).json({
      success: true,
      message: "Richiesta inviata al dirigente con successo",
    });

    let ugoVacanzeRichiesteHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">

      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Nuova richiesta di vacanze</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao Ugo,</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Ciao Ugo hai una nuova richiesta di vacanze da visualizzare. Controlla i dettagli e approva o rifiuta la richiesta dalla piattaforma.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.barmartinis.com/" 
             style="background-color: #B17457; color: #FAF7F0; text-decoration: none; 
                    padding: 14px 28px; border-radius: 8px; font-weight: bold; 
                    display: inline-block; font-size: 15px;">
            Visualizza richiesta
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

    const workerVacanzeMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_CAPO,
      subject: `Nuova richiesta di vacanze`,
      html: ugoVacanzeRichiesteHtml,
    };

    transporter.sendMail(workerVacanzeMailOptions, (error, info) => {
      if (error) {
        console.error("Errore nell'invio della mail al dirigente", error);
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al dirigente" });
      }

      console.log("Email inviata al dirigente", info.response);
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Errore nell'invio della richiesta vacanze", err });
    console.log("Errore nell'invio della richiesta vacanze", err);
  }
});

//I create a route to see the holiday's requests
Router.get("/visioneFerie", async (req, res) => {
  //i take the userid
  let id = req.session.userId;
  //i check if there is
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  try {
    //I select every row where there id the id
    let query = await db.query(
      "SELECT * FROM vacanze WHERE lavoratore_id = $1",
      [id]
    );

    res
      .status(200)
      .json({ message: "Dati arrivati correttamente", dati: query.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Errore nell'arrivo delle richieste vacanze", err });
    console.log("errore nell'arrivo delle richieste vacanze", err);
  }
});

//i create a route to delete the holiday's request
Router.post("/eliminazioneRichieste", async (req, res) => {
  //i take the id of the request
  const { idRichiesta } = req.body;
  //I check if there is
  if (!idRichiesta) {
    return res.status(400).json({ message: "Selezionare una richiesta" });
  }

  try {
    //I delete the row where there is the id
    let query = await db.query("DELETE FROM vacanze WHERE id = $1", [
      idRichiesta,
    ]);

    res.status(200).json({
      message: "Eliminazione avvenuta con successo",
    });
  } catch (err) {
    res.status(500).json({
      message: "Problema nell'eliminazione della richiesta vacanze",
      err,
    });
    console.log("Problema nell'eliminazione della richiesta vacanze", err);
  }
});

//I create a route to make a free day's requests
Router.post("/richiestaGiornoX", async (req, res) => {
  //I take the day
  const { giornoX } = req.body;
  //I declare the status "in attesa"
  const status = "in attesa";
  //I take the user id
  const id = req.session.userId;
  //i check if there is the day
  if (!giornoX) {
    return res.status(400).json({ message: "Compilare il campo" });
  }
  //i check if there id the user id
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  try {
    //I made a query where i count every free day's request in the current month
    const verifica = await db.query(
      `SELECT COUNT(*) 
       FROM giorni_riposo 
       WHERE lavoratore_id = $1
       AND EXTRACT(MONTH FROM giorno_richiesta) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM giorno_richiesta) = EXTRACT(YEAR FROM CURRENT_DATE)
      `,
      [id]
    );
    //I change the values
    const count = parseInt(verifica.rows[0].count, 10);

    //In this piece i check if are more than 2
    if (count >= 2) {
      return res
        .status(400)
        .json({ message: "Hai già fatto 2 richieste questo mese" });
    }
    //If is all ok i insert the data and i made the request
    const query = await db.query(
      "INSERT INTO giorni_riposo (giorno, status, lavoratore_id) VALUES ($1, $2, $3) RETURNING *",
      [giornoX, status, id]
    );

    res.status(200).json({
      success: true,
      message: "Richiesta inviata al dirigente con successo",
    });

    let ugoGiorniXRichiesteHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #FAF7F0; padding: 20px; color: #4A4947;">
    <div style="max-width: 600px; margin: auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">

      <div style="background-color: #B17457; padding: 20px; text-align: center; color: #FAF7F0;">
        <h1 style="margin: 0; font-size: 22px;">Nuova richiesta giorno libero</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #B17457; margin-top: 0;">Ciao Ugo,</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Ciao Ugo hai una nuova richiesta di giorno libero da visualizzare. Controlla i dettagli e approva o rifiuta la richiesta dalla piattaforma.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.barmartinis.com/" 
             style="background-color: #B17457; color: #FAF7F0; text-decoration: none; 
                    padding: 14px 28px; border-radius: 8px; font-weight: bold; 
                    display: inline-block; font-size: 15px;">
            Visualizza richiesta
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

    const workerGiorniXMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_CAPO,
      subject: `Nuova richiesta di giorno libero`,
      html: ugoGiorniXRichiesteHtml,
    };

    transporter.sendMail(workerGiorniXMailOptions, (error, info) => {
      if (error) {
        console.error("Errore nell'invio della mail al dirigente", error);
        return res
          .status(500)
          .json({ error: "Fallito l'invio della mail al dirigente" });
      }

      console.log("Email inviata al dirigente", info.response);
    });
  } catch (err) {
    console.log("Problema di invio richiesta per il giorno libero", err);
    res.status(500).json({
      message: "Problema di invio richiesta per il giorno libero",
      err,
    });
  }
});

//I create a route to see the request
Router.get("/visioneGiorniX", async (req, res) => {
  //I take the user id
  let id = req.session.userId;
  //I check if there is the user id
  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  try {
    //Then i select every request made by that user id
    let query = await db.query(
      "SELECT * FROM giorni_riposo WHERE lavoratore_id = $1",
      [id]
    );

    res
      .status(200)
      .json({ message: "Dati ricevuti correttamente", data: query.rows });
  } catch (err) {
    res.status(500).json({
      message: "Problema nella ricezione delle richieste dei giorni liberi",
    });
    console.log(
      "Problema nella ricezione delle richieste dei giorni liberi",
      err
    );
  }
});

//i create a route to delete the free day's request
Router.post("/eliminazioneGiorniX", async (req, res) => {
  //I select the id of the free day request
  const { idGiornoX } = req.body;
  //I check if there is the id of the free day request
  if (!idGiornoX) {
    return res.status(400).json({ message: "Selezionare giorno da eliminare" });
  }

  try {
    //I made a query to delete every data of the row where there is the id
    let query = await db.query("DELETE FROM giorni_riposo WHERE id = $1", [
      idGiornoX,
    ]);

    res.status(200).json({ message: "Dato cancellato con successo" });
  } catch (err) {
    res.status(500).json({
      message: "Problema nell'eliminazione dei dati selezionati",
      err,
    });
    console.log("Problema nell'eliminazione dati selezionati", err);
  }
});

Router.post("/invioDatiIgiene", async (req, res) => {
  const { giorno, locale, attrezzature, personale, controllo } = req.body;
  const id = req.session.userId;

  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  if (!giorno || !locale || !attrezzature || !personale || !controllo) {
    return res.status(400).json({ message: "Compilare i campi" });
  }

  try {
    let query = await db.query(
      "INSERT INTO igiene(giorno, controllo, locale, attrezzature, personale, lavoratore_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [giorno, controllo, locale, attrezzature, personale, id]
    );

    res
      .status(200)
      .json({ message: "Dati di trasporto inviati correttamente" });
  } catch (err) {
    res.status(500).json({ message: "Problema nell'invio dei dati igienici" });
    console.log("Problema nell'invio dei dati igienici");
  }
});

Router.post("/invioDatiTrasporto", async (req, res) => {
  const {
    giorno,
    nFornitore,
    nProdotto,
    cTrasporto,
    iConfezioni,
    etichettatura,
    infestanti,
    temperatura,
  } = req.body;
  const id = req.session.userId;

  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  if (
    !giorno ||
    !nFornitore ||
    !nProdotto ||
    !cTrasporto ||
    !iConfezioni ||
    !etichettatura ||
    !infestanti ||
    temperatura === undefined
  ) {
    return res.status(400).json({ message: "Compilare tutti i campi" });
  }

  try {
    let query = await db.query(
      "INSERT INTO trasporto(giorno, nome_fornitore, nome_prodotto, condizione_trasporto, integrita_confezioni, etichettatura, infestanti, temperatura, lavoratore_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        giorno,
        nFornitore,
        nProdotto,
        cTrasporto,
        iConfezioni,
        etichettatura,
        infestanti,
        temperatura,
        id,
      ]
    );

    res.status(200).json({ message: "Dati di trasporto inviati con successo" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problema nell'invio dei dati di trasporto" });
    console.log("Problema nell'invio dei dati di trasporto");
  }
});

Router.post("/invioDatiTemperature", async (req, res) => {
  const {
    giorno,
    parteGiornata,
    frigo1,
    frigo2,
    frigo3,
    bar,
    gelati,
    vini,
    bibite,
  } = req.body;

  const id = req.session.userId;

  if (!id) {
    return res.status(400).json({ message: "Utente non loggato" });
  }

  const input = [
    giorno,
    parteGiornata,
    frigo1,
    frigo2,
    frigo3,
    bar,
    vini,
    gelati,
    bibite,
  ];

  for (let i = 0; i < input.length; i++) {
    if (!input[i]) {
      return res.status(400).json({ message: "Compilare tutti i campi" });
    }
  }

  try {
    let query = await db.query(
      "INSERT INTO temperature(giorno, parte_giornata, n1, n2, n3, bar, gelati, vini, bibite, lavoratore_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        giorno,
        parteGiornata,
        frigo1,
        frigo2,
        frigo3,
        bar,
        gelati,
        vini,
        bibite,
        id,
      ]
    );

    res.status(200).json({ message: "Temperature inserite con successo" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Problemi nell'inserimento delle temperature" });
    console.log("Problemi nell'inserimento delle temperature");
  }
});

Router.get("/excelTrasportiE", async (req, res) => {
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

Router.get("/excelIgieneE", async (req, res) => {
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

Router.get("/excelTemperatureE", async (req, res) => {
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

export default Router;
