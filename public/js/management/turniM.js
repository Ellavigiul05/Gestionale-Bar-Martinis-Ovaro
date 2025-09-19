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

//I create a function to take the usernames of the employees
async function NomiLavoratori() {
  try {
    //I made an api call
    let response = await fetch(`${apiURL}/api/seeWorkers`);
    //I take the selected rows 
    let result = await response.json();
    //I take the field where will be display the workers
    let select = document.getElementById("lavoratore");
    //i clean the field 
    select.innerHTML = "";
    //For each user in the select form i add an option with the user of the worker
    result.data.forEach((worker) => {
      let option = document.createElement("option");
      option.value = worker.id;
      option.className = "selezioni-workers";
      option.dataset.id = worker.id;
      option.innerText = worker.username;

      select.appendChild(option);
    });
  } catch (err) {
    console.log("Errore nell'arrivo degli username", err);
  }
}

NomiLavoratori();

//I select the button to see the shifts
const buttonSearchTurni = document.getElementById("btn-dipendente");
//When i select the worker i take the month and his id and i pass both to the "vedereDatiLavoratore" function 
buttonSearchTurni.addEventListener("click", (e) => {
  e.preventDefault();
  let select = document.getElementById("lavoratore");
  let idLavoratore = select.selectedOptions[0].dataset.id;

  let mese = document.getElementById("mese").value;

  vedereDatiLavoratore(idLavoratore, mese);

});

//I create a function to see the worker's data
async function vedereDatiLavoratore(idLavoratore, mese) {
  //I check if there is the worker id and the month
  if (!idLavoratore || !mese) {
    return alert("Selezionare lavoratore e/o mese");
  }

  try {
    //i made an api call where i pass the query of the id
    let response = await fetch(
      `${apiURL}/api/guardaTurni?idLavoratore=${idLavoratore}`
    );
    //If is ok 
    if (response.ok) {
      //i take the selected rows
      let result = await response.json();
      //I take body of the table where i will see the shifts
      let SpazioInserimentoOrari = document.getElementById("orari-workers");
      //I clean the field
      SpazioInserimentoOrari.innerHTML = "";
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
      //I see what month is select
      const meseSelezionato = mesi[mese];
      //I'll show the data with the selected month
      result.data.forEach((worker) => {
        const meseTurno = new Date(worker.giorno).getMonth() + 1;
        const meseStr = meseTurno.toString().padStart(2, "0");

        if (meseStr !== meseSelezionato) return;

        let riga = document.createElement("tr");

        let giorno = new Date(worker.giorno).toLocaleDateString();

        riga.innerHTML = `
        <td>${giorno}</td>
        <td>${worker.ora_inizio}</td>
        <td>${worker.ora_fine}</td>
        <td>${differenzaOre(worker.ora_inizio, worker.ora_fine)}</td>
        `;

        SpazioInserimentoOrari.appendChild(riga);
      });
    } else {
      return alert("Problema nella ricezione dei dati");
    }
  } catch (err) {
    console.log("Problema nella ricezione dei dati");
  }
}

//I select the button to download the shift excel sheet
const btnExcel = document.getElementById("btn-excel");

btnExcel.addEventListener("click", (e) => {
  e.preventDefault();
  const select = document.getElementById("lavoratore");
  const idLavoratore = select.selectedOptions[0].dataset.id;

  const mese = document.getElementById("mese").value;

  if (!idLavoratore || !mese) {
    let errore = document.getElementById("errore-selezionare");
    return mostraErrore(errore, "Selezionare lavoratore e mese");
  }

  window.location.href = `${apiURL}/api/creazioneFile?idLavoratore=${idLavoratore}&mese=${mese}`;
});

