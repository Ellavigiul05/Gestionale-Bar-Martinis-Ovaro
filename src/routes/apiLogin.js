import express from "express";

import { database } from "../config/db.js";

import bcrypt from "bcrypt";




const Router = express.Router();

const db = await database();


//I create the route to check the username and password for the login 
Router.post("/InserimentoDatiAccesso", async (req, res) => {
  try {
    //I take the username and password from the body
    const { username, password } = req.body;

    //I check if there are the username and password
    if (!username || !password) {
      return res.status(400).json({ message: "Compilare tutti i campi" });
    }
    //I made a query to take the db where there is the usernames and passwords
    let query = await db.query(
      "SELECT * FROM dati_accesso WHERE username = $1",
      [username]
    );
    //If there isn't any account with the username insert in the body i return error
    if (query.rows.length === 0) {
      return res.status(400).json({ message: "Username o password errati" });
    }
    //Else i take the line of the db where there is the username 
    const user = query.rows[0];
    //Then i use "compare" function to see if the password of the body is equal with the hash password in db
    const valid = await bcrypt.compare(password, user.password); // <-- confronta la password inserita con quella hashata
    //I check if the passwords are equal
    if (!valid) {
      return res.status(400).json({ message: "Username o password errati" });
    } else{
            //Else i take the userId
    req.session.userId = user.id;
    //I return a positive message 
    res.status(200).json({ message: "Username e password corretti", username: user.username });
    }

  } catch (err) {
    console.log("Errore nel server", err);
    res.status(500).json({ message: "Errore nel server", err });
  }
});



//I export every API hear
export default Router;