let toggle = document.getElementById("toggle-side");
let hiddenBar = document.getElementById("hidden-bar");

toggle.addEventListener("click", ()=>{
    hiddenBar.style.display = "block"
});

let x = document.getElementById("delete-side");

x.addEventListener("click", ()=>{
    hiddenBar.style.display="none";
})

function mostraErrore(divErrore, message) {

  divErrore.innerHTML = "";

  let errore = document.createElement("h3");

  errore.classList.add("error");

  errore.innerText = message;

  divErrore.appendChild(errore);
}



//I create a function to send communication
async function invioComunicazioni(e) {
  e.preventDefault();
  // I select the communication field
  let comunicazioneE = document.getElementById("comunicazione");
  //I take the communication value
  let comunicazioneValue = comunicazioneE.value;
  //i check if there is the communication value
  if (!comunicazioneValue) {
    let errore = document.getElementById("errore-comunicazione");
    return mostraErrore(errore, "Compilare il campo");
  }
  //I put the value in a box 
  const data = { messaggio: comunicazioneValue };

  try {
    //I call the api
    let response = await fetch(`${apiUrl}/api/sendCommunication`, {
      //I use method post
      method: "POST",
      //In json 
      headers: { "content-type": "application/json" },
      //I send change the the values in json
      body: JSON.stringify(data),
      //I take the userid in session
      credentials: "include",
    });
 
    //i check if is all ok
    if (response.ok) {
      //i clean the field
      comunicazioneE.value = "";
      //I reload the page to update visual data
      window.location.href = "/comunicazioni";
    } else {
      //I give an error if is needed
      let errore = document.getElementById("errore-comunicazione");
      return mostraErrore(errore, "Problema di inserimento comunicazione, riprova");
    }
  } catch (err) {
    console.log("Problema nell'inserimento della comunicazione", err);
  }
}

//I select the button to send data
const buttonSendCommunication = document.getElementById("btn-communication");
//i send data with a click using the previous function
buttonSendCommunication.addEventListener("click", invioComunicazioni);

//I create a function to see the communication
async function visioneComunicazioni() {
  try {
    //i call the api
    let response = await fetch(`${apiUrl}/api/getcommunication`);
    //i take the data
    let result = await response.json();
    //I select the field where there are the messages
    let boxMessaggi = document.getElementById("contenuti-messaggi");

    //For each row i creat a new message
    result.data.forEach((message) => {
      let messaggio = document.createElement("div");
      //I convert the date data in just the date with day month and year
      let giorno = new Date(message.orario).toLocaleDateString();
      //I check if the username is the username of the owner
      if (message.username === "ugoValle") {
        messaggio.classList.add("messaggio-ugo");

        messaggio.innerHTML = `
            <div class="nickname-data">
                <h3>${message.username}</h3>
                <h3>${giorno}</h3>
            </div>

            <div class="body">
                <p>${message.messaggio}</p>
            </div>

            `;

        boxMessaggi.appendChild(messaggio);
      } else {
        messaggio.classList.add("messaggio");

        messaggio.innerHTML = `
            <div class="nickname-data">
                <h3>${message.username}</h3>
                <h3>${giorno}</h3>
            </div>

            <div class="body">
                <p>${message.messaggio}</p>
            </div>

            <button class="elimina" data-id="${message.id}">Elimina comunicazione</button>

            `;

        boxMessaggi.appendChild(messaggio);
      }
      //I select every delete button
      let bottoniElimina = messaggio.getElementsByClassName("elimina");
      //For each delete button if i click it i take the data-id contains the id of the row and width the function i delete the row
      for (let i = 0; i < bottoniElimina.length; i++) {
        bottoniElimina[i].addEventListener("click", (e) => {
          let idMessaggio = e.target.dataset.id;
          deleteCommunication(idMessaggio);
        });
      }
    });
  } catch (err) {
    console.log("Impossibile visualizzare i messaggi", err);
  }
}

visioneComunicazioni();

//I create a function to delete communication
async function deleteCommunication(idMessaggio) {
  //I take in input the message id 
  if (!idMessaggio) {
    return alert("Comunicazione non trovata");
  }
  //I put the message in a box 
  const dati = { idComunicazione: idMessaggio };

  try {
    //I made a call to the api
    let response = await fetch(
      `${apiURL}/api/eliminazioneComunicazione`,
      {
        //With method post
        method: "POST",
        //With json
        headers: { "content-type": "application/json" },
        //I pass the data in json
        body: JSON.stringify(dati),
      }
    );
    //If is all ok 
    if (response.ok) {
      //I reload the page to update data
      window.location.href = "/comunicazioni";
    } else {
      //I'll show an error if there is a problem
      return mostraErrore("Impossibile cancellare la comunicazione, riprova");
    }
  } catch (err) {
    console.log("Impossibile eliminare la comunicazione", err);
  }
}
