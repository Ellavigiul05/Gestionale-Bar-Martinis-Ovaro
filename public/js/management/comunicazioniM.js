let toggle = document.getElementById("toggle-side");
let hiddenBar = document.getElementById("hidden-bar");

toggle.addEventListener("click", () => {
  hiddenBar.style.display = "block";
});

let x = document.getElementById("delete-side");

x.addEventListener("click", () => {
  hiddenBar.style.display = "none";
});


function mostraErrore(divErrore, message) {

  divErrore.innerHTML = "";

  let errore = document.createElement("h3");

  errore.classList.add("error");

  errore.innerText = message;

  divErrore.appendChild(errore);
}


function mostraRispostaPositiva(divPositivo, message) {

  divPositivo.innerHTML = "";

  let positiva = document.createElement("h3");

  positiva.classList.add("positiva");

  positiva.innerText = message;

  divPositivo.appendChild(positiva);
}


//I create a function to send the communication
async function invioComunicazioni(e) {
  e.preventDefault();
  //I select the field
  let comunicazioneE = document.getElementById("comunicazione");
  //I take the communication value
  let comunicazioneValue = comunicazioneE.value;
  //I check if there is the communication value
  if (!comunicazioneValue) {
    let errore = document.getElementById("comunicazione-errore");
    return mostraErrore(errore, "Compilare il campo");
  }
  //I put in the box the data
  const data = { messaggio: comunicazioneValue };

  try {
    //I made an api call
    let response = await fetch(`/api/sendCommunication`, {
      //With method post
      method: "POST",
      //With json
      headers: { "content-type": "application/json" },
      //I pass the data
      body: JSON.stringify(data),
      //I take the user id
      credentials: "include",
    });

    //If is all ok
    if (response.ok) {
      //I clean the communication value
      comunicazioneE.value = "";
      //I reload the page to update data
      window.location.href = "/comunicazioniM";
    } else {
      //If there is an error i will show the error
      let errore = document.getElementById("comunicazione-errore");
      return mostraErrore(errore, "Problema di inserimento comunicazione, riprova");
    }
  } catch (err) {
    console.log("Problema nell'inserimento della comunicazione", err);
  }
}

//I select the button to send communication
const buttonSendCommunication = document.getElementById("btn-communication");
//When i click the button i send the communication
buttonSendCommunication.addEventListener("click", invioComunicazioni);

//I create a function to visualize the communication
async function visioneComunicazioni() {
  try {
    //I made an api call
    let response = await fetch(`/api/getcommunication`);
    //I take the selected rows
    let result = await response.json();
    //I take the box where will be displayed every message
    let boxMessaggi = document.getElementById("contenuti-messaggi");
    //For each row i will show the data
    result.data.forEach((message) => {
      let messaggio = document.createElement("div");
      //If the username is ugoValle i add a specific css class
      if(message.username === "ugoValle") {
        messaggio.classList.add("messaggio-ugo");
      }else{
        messaggio.classList.add("messaggio");
      }


      let giorno = new Date(message.orario).toLocaleDateString();

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
      //I select the delete buttons
      let bottoniElimina = messaggio.getElementsByClassName("elimina");
      //From the delete buttons i take the id of the row
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
  //i check if there is the id message
  if (!idMessaggio) {
    return alert("Comunicazione non trovata");
  }
  //I put in the box the message id
  const dati = { idComunicazione: idMessaggio };

  try {
    //I made an api call
    let response = await fetch(
      `/api/eliminazioneComunicazione`,
      {
        //With method post
        method: "POST",
        //With json
        headers: { "content-type": "application/json" },
        //I pass the message id
        body: JSON.stringify(dati),
      }
    );
    
    //if is all ok
    if (response.ok) {
      //I reload the page to update data
      window.location.href = "/comunicazioniM";
    } else {
      //If there is an error i will show it
      return mostraErrore("Impossibile cancellare la comunicazione, riprova");
    }
  } catch (err) {
    console.log("Impossibile eliminare la comunicazione", err);
  }
}
