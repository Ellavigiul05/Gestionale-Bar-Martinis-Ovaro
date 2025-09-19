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

function differenzaOre(inizio, fine) {
  if (!fine) return "";


  const [hInizio, mInizio] = inizio.split(":").map(Number);
  const [hFine, mFine] = fine.split(":").map(Number);


  let minutiInizio = hInizio * 60 + mInizio;
  let minutiFine = hFine * 60 + mFine;


  if (minutiFine < minutiInizio) {
    minutiFine += 24 * 60; 
  }


  const diffMinuti = minutiFine - minutiInizio;
  const ore = Math.floor(diffMinuti / 60);
  const minuti = diffMinuti % 60;

  return `${ore}:${minuti.toString().padStart(2, "0")}`;
}

//I create a function to send the initial shift  times
async function fetchTurniIn(e) {
  e.preventDefault();
  //I select the the start hour
  let oraIniziof = document.getElementById("ora-inizio");
  //I select the day
  let giornof = document.getElementById("giorno");

  //I take the value of the start hour
  let oraInizioValue = oraIniziof.value;
  //I take the value of the day
  let giornoValue = giornof.value;

  //I check if there are the start hour and the day
  if (!oraInizioValue || !giornoValue) {
    let errore = document.getElementById("errore-inizio");
    return mostraErrore(errore, "Compilare tutti i campi");
  }
  //If there are the values i save the values
  const data = { oraInizio: oraInizioValue, giorno: giornoValue };

  try {
    //I made a fetch request to the API, i send data with:
    let response = await fetch(
      `${apiURL}/api/inserimentoInizioTurno`,
      {
        //With method post
        method: "POST",
        //With json language
        headers: { "content-type": "application/json" },
        //I tranform the data saved before in json
        body: JSON.stringify(data),
        //I insert this to use cookies or session to pass the id to the backend
        credentials: "include",
      }
    );

    //If the backend sends a positive message
    if (response.ok) {
      //I clean the fiel of orario
      oraIniziof.value = "";
      //I clean the field of the day
      giornof.value = "";
      
      window.location.href= "/turni"
    } else {
      let errore = document.getElementById("errore-inizio");
      //If backend sends a negative message i shos an error
      mostraErrore(errore, "Errore sconosciuto, riprova");
    }
  } catch (err) {
    console.log("Errore nell'inserimento dei dati", err);
  }
}

const bottoneInizioTurno = document.getElementById("btn-inizio");

bottoneInizioTurno.addEventListener("click", fetchTurniIn);

//I create a function to send the end of the shift
async function fetchTurniOff(e) {
  e.preventDefault();

  //I select the end of the shift
  let OrarioFineOff = document.getElementById("ora-fine");
  //I take the value of the end of the shift
  let OrarioFineValue = OrarioFineOff.value;
  //I check if there is the value
  if (!OrarioFineValue) {
    let errore = document.getElementById("errore-fine");
    return mostraErrore(errore, "Compilare il campo");
  }
  //If there is the value i save the value in a box
  const dati = { fineTurno: OrarioFineValue };

  try {
    //I made a fetch call to my api with
    const response = await fetch(
      `${apiURL}/api/inserimentoFineTurno`,
      {
        //Method post
        method: "POST",
        //Using the json language
        headers: { "content-type": "application/json" },
        //I change data in json language
        body: JSON.stringify(dati),
        //I use session to take id
        credentials: "include",
      }
    );

    //If backend sends a positive message
    if (response.ok) {
      //I clean the field
      OrarioFineOff.value = "";
      //I save the data
      let data = await response.json();
      //And i'll check it on the console
      console.log(data);
      window.location.href = "/turni";
    } else {
      let errore = document.getElementById("errore-fine");
      //If backend sens me a negative message, i show an error
      return mostraErrore(errore, "Errore sconosciuto, riprova");
    }
  } catch (err) {
    console.log("Errore nell'inserimento dei dati", err);
  }
}


const buttonFineTurno = document.getElementById("btn-fine");

buttonFineTurno.addEventListener("click", fetchTurniOff);

//When i choose the month the "mostraturni" function will work
let selectMese = document.getElementById("mese");

selectMese.addEventListener("change", mostraTurni);



//I create a function to show shifts in each month
async function mostraTurni() {
  try {
    //I made a call to the api
    let response = await fetch(`${apiURL}/api/visioneTurni`, {
      //With method get
      method: "GET",
      //I will user the user id
      credentials: "include",
    });
    //I take the rows
    let result = await response.json();
    //I select the body of the table
    const turniMiei = document.getElementById("turni-miei");
    //I clean the body
    turniMiei.innerHTML = "";
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
    //I see what month is selected by the user
    const meseSelezionato = mesi[selectMese.value];

    result.data.forEach((turno) => {
      const meseTurno = new Date(turno.giorno).getMonth() + 1;
      const meseStr = meseTurno.toString().padStart(2, "0");
      //I choose just the shift in the month choose by employee
      if (meseStr !== meseSelezionato) return;

      let riga = document.createElement("tr");

      let giorno = new Date(turno.giorno).toLocaleDateString();

      riga.innerHTML = `
            <td data-label = "Giorno">${giorno}</td>
            <td data-label = "Ora Inizio">${turno.ora_inizio}</td>
            <td data-label = "Ora Fine">${turno.ora_fine || ""}</td>
            <td data-label = "Totale">${differenzaOre(turno.ora_inizio, turno.ora_fine)}</td>
            <td data-label = "Elimina turno"><button class = "elimina" data-id = ${turno.id}>Elimina turno</button></td>
            `;

      turniMiei.appendChild(riga);

      const bottoniElimina = riga.getElementsByClassName("elimina");

      for(let i = 0; i < bottoniElimina.length; i++) {
        bottoniElimina[i].addEventListener("click", (e)=>{
          let idTurno = e.target.dataset.id;
          eliminazioneTurni(idTurno);
        })
      }
    });
  } catch (err) {
    console.log("Errore nella presa dei dati");
  }
}



//I crete a function to delete shifts
async function eliminazioneTurni(idTurno) {
  //I check if there is the id of the shift
  if(!idTurno) {
    return alert("selezionare turno da eliminare");
  }

  try{
    //I made a call to the api
    let response = await fetch(`${apiURL}/api/eliminazioneTurni`, {
      //With method post
      method: "POST", 
      //With json
      headers: {"content-type" : "application/json"},
      //I pass the id of the shift
      body: JSON.stringify({idTurno}),
    });

    //If is all ok
    if(response.ok) {
      //I will reload the page to update data
      window.location.href = "/turni";
    }
  }catch(err) {
    console.log("Impossibile eliminare il turno", err);
  }
  
}


//I select the button to download excel
const btnExcel = document.getElementById("btn-excel");
//When i click the excel's button will be create a new excel's sheet with the month shifts
btnExcel.addEventListener("click", () => {
  const mese = document.getElementById("mese").value;
  let errore = document.getElementById("errore-mese");
  if(!mese) return mostraErrore(errore, "Selezionare mese");

  window.location.href = `${apiURL}/api/fileemploye?mese=${mese}`;
});
