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


function mostraRispostaPositiva(divPositivo, message) {

  divPositivo.innerHTML = "";

  let positiva = document.createElement("h3");

  positiva.classList.add("positiva");

  positiva.innerText = message;

  divPositivo.appendChild(positiva);
}


//I create a function to send holiday's request
async function InvioFerie(e) {
    e.preventDefault();

    //I select the fields of start day and end day
    let giornoInizioE = document.getElementById("inizio_vacanze");
    let giornoFineE = document.getElementById("fine_vacanze");
    //i take the values
    let giornoInizioValue = giornoInizioE.value;
    let giornoFineValue = giornoFineE.value;
    //I check if there are the values
    if(!giornoInizioValue || !giornoFineValue) {
      let errore = document.getElementById("errore-vacanze")
        return mostraErrore(errore, "Compilare tutti i campi");
    }

    
    //I pute the values in a box
    const dati = {giornoInizio: giornoInizioValue, giornoFine: giornoFineValue};

    try{
      //I made a call to api
        let response = await fetch(`/api/invioDateFerie`, {
          //With method post
            method: "POST", 
            //with json
            headers: { "content-type": "application/json" },
            //I pass data
            body: JSON.stringify(dati),
            //I will use the user id
            credentials: "include",
        });
        
        //if is all ok 
        if(response.ok) {
          //I reload the page to update data
          window.location.href = "/richiesteE";
        }else{
          //If there is an error i will show it
          let errore = document.getElementById("errore-vacanze");
            return mostraErrore(errore, "Problema con l'invio dei dati");
        }
    }catch(err) {
        console.log("problema nell'invio dei dati", err);
    }
    
}

//Every time i clik the button the function will work
document.getElementById("invio-vacanze").addEventListener("click", InvioFerie);



//I crete a function to see the holiday's request
async function visioneFerie() {
  try {
    //I made a call to api
    let response = await fetch(`/api/visioneFerie`, {
      //With method get
      method: "GET",
      //I will pass the user id
      credentials: "include",
    });
    //I take rows selected by backend
    let result = await response.json();
    //I take the body of table's request
    let bodyFerie = document.getElementById("tabella-ferie");
    //I clean the area
    bodyFerie.innerHTML = "";
    //For each row i add the information 
    result.dati.forEach(ferie => {
      let dataInizio = new Date(ferie.giorno_inizio).toLocaleDateString("it-IT");
      let dataFine = new Date(ferie.giorno_fine).toLocaleDateString("it-IT");

      let riga = document.createElement("tr");
      riga.innerHTML = `
        <td data-label = "Giorno Inizio">${dataInizio}</td>
        <td data-label = "Giorno Fine">${dataFine}</td>
        <td class = "status" data-label = "Status">${ferie.status}</td>
        <td data-label = "Elimina Richiesta"><button data-id="${ferie.id}" class= "elimina">Elimina richiesta</button></td>
      `;

      bodyFerie.appendChild(riga);
      //I select the status value
      let statusElementi = riga.getElementsByClassName("status");
      //Fo each different status i will add a different style
      for(let i = 0; i < statusElementi.length; i++) {
        if(statusElementi[i].textContent.trim().toLowerCase() == "approvato") {
          statusElementi[i].classList.add("approvato");
        }else if(statusElementi[i].textContent.trim().toLowerCase() == "negato"){
          statusElementi[i].classList.add("negato");
        }else{
          statusElementi[i].classList.add("in-attesa");
        }
      }


      //I select the delete buttons
      let bottoniElimina = riga.getElementsByClassName("elimina");
      //For each delete button i will pass the id of the row to the function for delete the row from db
      for(let i = 0; i < bottoniElimina.length; i++) {
        bottoniElimina[i].addEventListener("click", (e)=>{
          let idRichiesta = e.target.dataset.id;
          eliminazioneRichiesta(idRichiesta);
        })
      }
    });
  } catch (err) {
    console.log("errore ricezione dati", err);
  }
}

visioneFerie();


//I create a function to delete the holiday's requests
async function eliminazioneRichiesta(idRichiesta) {
  //I check if there id the id of the row
  if(!idRichiesta) {
    return alert("selezionare richiesta da cancellare");
  }

  try{
    //I made a call to api
    let response = await fetch(`/api/eliminazioneRichieste`, {
      //With method post
      method: "POST", 
      //With json
      headers: {"content-type" : "application/json"},
      //I pass the row's id
      body: JSON.stringify({idRichiesta}),
    })

    //If is all ok
    if(response.ok) {
      //I will reload the page to update data
      window.location.href="/richiesteE";
    }else{
      //If isn't ok i will show the error
      return alert("Problema con la ricezione della richiesta");
    }
  }catch(err) {
    console.log("problemi con la cancellazione della richiesta", err);
  }
  
}


//I made the same for the free day's requests

async function InserimentoGiornoX() {

  let giornoXE = document.getElementById("giorno");

  let giornoXValue = giornoXE.value;

  if(!giornoXValue) {
    let errore = document.getElementById("errore-giorno");
    return mostraErrore(errore, "Compilare tutti i campi");
  }


  try{
    let response = await fetch(`/api/richiestaGiornoX`, {
      method:"POST", 
      headers: {"content-type" : "application/json"},
      body: JSON.stringify({giornoX: giornoXValue}),
      credentials:"include"
    });

    if(response.ok) {
      window.location.href="/richiesteE"
    }else{
      let errore = document.getElementById("errore-giorno");
      return mostraErrore(errore, "Impossibile inviare i dati, riprovare");
    }
  }catch(err) {
    console.log("Problemi di invio richiesta", err);
  }
  
}

document.getElementById("giornoX-invio").addEventListener("click", InserimentoGiornoX);


async function vedereGiornoX() {
  try{
      let response = await fetch(`/api/visioneGiorniX`, {
    method: "GET", 
    credentials: "include",
  });

  let result = await response.json();

  let corpoTabellaGiorniX = document.getElementById("tabella-giorni-x");
  corpoTabellaGiorniX.innerHTML="";

  result.data.forEach(x => {
    let giornoX = new Date(x.giorno).toLocaleDateString();

    let riga = document.createElement("tr");

    riga.innerHTML = `
    <td data-label = "Giorno">${giornoX}</td>
    <td class= "status" data-label = "Status">${x.status}</td>
    <td data-label = "Elimina Richiesta"><button data-id="${x.id}" class= "elimina">Elimina richiesta</button></td>

    `

    corpoTabellaGiorniX.appendChild(riga);

    let statusElementi = riga.getElementsByClassName("status");

    for(let i = 0; i < statusElementi.length; i++) {
      if(statusElementi[i].textContent.trim().toLowerCase() == "approvato") {
        statusElementi[i].classList.add("approvato");
      }else if(statusElementi[i].textContent.trim().toLowerCase() == "negato"){
        statusElementi[i].classList.add("negato");
      }else{
        statusElementi[i].classList.add("in-attesa");
      }
    }

    let raccoltaElimina = riga.getElementsByClassName("elimina");

    for(let i = 0; i < raccoltaElimina.length; i++) {
      raccoltaElimina[i].addEventListener("click", (e)=>{
        let idGiornoX = e.target.dataset.id;
        eliminazioneGiornoX(idGiornoX);
      })
    }
    
  });
  }catch(err) {
    console.log("Problemi di ricezione dati", err);
  }

  
}

vedereGiornoX();

async function eliminazioneGiornoX(idGiornoX) {
  if (!idGiornoX) {
    return alert("Scegliere casella da eliminare");
  }

  try{
    let response = await fetch(`/api/eliminazioneGiorniX`, {
      method: "POST", 
      headers: {"content-type" : "application/json"},
      body: JSON.stringify({idGiornoX}),
    });

    if(response.ok) {
      window.location.href="/richiesteE"
    }
  }catch(err){
    console.log("Errore nell'eliminazione dei dati", err);
  }
  
}









