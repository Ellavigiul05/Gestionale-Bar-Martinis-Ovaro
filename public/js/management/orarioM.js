
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

let toggle = document.getElementById("toggle-side");
let hiddenBar = document.getElementById("hidden-bar");

toggle.addEventListener("click", () => {
  hiddenBar.style.display = "block";
});

let x = document.getElementById("delete-side");

x.addEventListener("click", () => {
  hiddenBar.style.display = "none";
});

//I select the new parameters of shifts
async function parametriTurni(e) {
  e.preventDefault();
   //I select the parameters fields
  let turno1M = document.getElementById("turno-1");
  let turno2M = document.getElementById("turno-2");
  let turno3M = document.getElementById("turno-3");
  let turno4M = document.getElementById("turno-4");
  //I take the values of this parameters
  let turno1Value = turno1M.value;
  let turno2Value = turno2M.value;
  let turno3Value = turno3M.value;
  let turno4Value = turno4M.value;

  //I save the data
  const dati = {
    turno1: turno1Value,
    turno2: turno2Value,
    turno3: turno3Value,
    turno4: turno4Value,
  };

  try {
    //I made a api call
    let response = await fetch(`/api/inserimentoOrari`, {
      //With method post
      method: "POST",
      //With json
      headers: { "content-type": "application/json" },
      //I pass the data
      body: JSON.stringify(dati),
    });
    //If is all ok
    if (response.ok) {
      //I'll show a positive answer
      let positiva = document.getElementById("positiva-turni");
      mostraRispostaPositiva(positiva, "turni aggiornati correttamente");
    } else {
      //Else i'll show the negative answer
      let errore = document.getElementById("errore-turni");
      return mostraErrore(errore, "Problema nel cambiamento dei turni");
    }
  } catch (err) {
    console.log("Problema nell'inserimento dei nuovi orari");
  }
}


//I select the button to insert the new hour's shifts
const buttonNuoviOrari = document
  .getElementById("nuovi-orari")
  .addEventListener("click", parametriTurni);





let btnFormato = document.getElementById("btn-formato");
//If i select the button to download the excel format i take the month 
btnFormato.addEventListener("click", (e) => {
  e.preventDefault();
  let meseValue = document.getElementById("mese").value;
  if (!meseValue) {
    let errore = document.getElementById("errore-mese");
    return mostraErrore(errore,"Ritorna un mese prima di caricare il formato");
  }
  //i pass the month information in a query
  window.location.href = `/api/creaFormato?mese=${meseValue}`;
});





//I create a function to insert the shift's file
async function InserimentoFile(e) {
  e.preventDefault();
  //i select the field where there is the file
  let fileTurni = document.getElementById("fileTurni").files[0];
  //i take the file 
  const formData = new FormData();
  formData.append("file", fileTurni); 

  try {
    //I call the pai
    let response = await fetch(`/api/letturaFile`, {
      //With method post
      method: "POST",
      //I pass the file
      body: formData,
    });
    //If is all ok
    if (response.ok) {
      let result = await response.json();
      console.log("Dati inseriti:", result);
      //i give a positive answer
      let positiva = document.getElementById("positiva-lettura");
      mostraRispostaPositiva(positiva, "Documento letto e inserito con esito positivo");
    }else{
      //Else i'll show a negative answer
      let errore = document.getElementById("errore-lettura");
      mostraErrore(errore, "Impossibile leggere il documento, riprovare");
    }
  } catch (err) {
    console.log("Errore ", err);
  }
}

//I select the button to send the new hour's shifts
let btnLettura = document.getElementById("btn-lettura");
btnLettura.addEventListener("click", InserimentoFile);



//I create a function to see the free day's request approved
async function visioneGiorniApprovati() {

  try{
    //I made a call to the api
    let response = await fetch(`/api/visioneApprovatiGiorni`);
    //I take the data
    let result = await response.json();
    //I select the tbody to append the rows
    let bodyTabellaApprovatiGiorni = document.getElementById("body-giorni");
    //i clean the area to avoid errors
    bodyTabellaApprovatiGiorni.innerHTML= "";
    //For each row i insert the data
    result.dati.forEach(giorno => {
      let riga = document.createElement("tr");
      let giornoX = new Date(giorno.giorno).toLocaleDateString();

      riga.innerHTML = `
      <td>${giorno.username}</td>
      <td>${giornoX}</td>
      `

      bodyTabellaApprovatiGiorni.appendChild(riga);
      
    });
  }catch(err) {
    console.log("Errore nella ricezione dei dati");
  }
  
}

visioneGiorniApprovati();


//I made the same thing for the holidays
async function visioneVacanzeApprovate() {

  try{
    let response = await fetch(`/api/visioneApprovatiVacanze`);
    let result = await response.json();

    let bodyTabellaApprovateVacanze = document.getElementById("body-vacanze-approvate");

    bodyTabellaApprovateVacanze.innerHTML= "";

    result.dati.forEach(vacanze => {

      let riga = document.createElement("tr");

      let vacanzeGiornoInizio = new Date(vacanze.giorno_inizio).toLocaleDateString();

      let vacanzeGiornoFine = new Date(vacanze.giorno_fine).toLocaleDateString();

      riga.innerHTML = `
      <td>${vacanze.username}</td>
      <td>${vacanzeGiornoInizio}</td>
      <td>${vacanzeGiornoFine}</td>

      `

      bodyTabellaApprovateVacanze.appendChild(riga);
    });
  }catch(err) {
    console.log("Impossibile ricevere i dati", err);
  }
  
}

visioneVacanzeApprovate();
