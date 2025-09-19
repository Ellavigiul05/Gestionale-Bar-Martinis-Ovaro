

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


//I create a function to send humor's values to the db
async function fetchUmore(e) {
  e.preventDefault();
  //I select the field of humor
  let valoreUmore = document.getElementById("umore");
  //I take the value of the humore
  let valoreInput = valoreUmore.value;
  //I check if there is a humor value
  if (!valoreInput) {
    let errore = document.getElementById("errore-valore");
    mostraErrore(errore, "Compilare tutti i campi");
  }

  if (valoreInput > 10 || valoreInput < 0) {
    let errore = document.getElementById("errore-valore");
    return mostraErrore(errore, "Inserire valore tra 0 e 10");
  }
  //If there is the humor value i save the value
  const data = { valore: valoreInput };

  try {
    //I made a fetch call to the API
    let response = await fetch(`/api/valoriumore`, {
      //With method post
      method: "POST",
      //With JSON language
      headers: { "content-type": "application/json" },
      //I transform the humore value in JSON
      body: JSON.stringify(data),
      //I take the id of the user
      credentials: "include",
    });

    //If backend sends a positive message
    if (response.ok) {
      //I clean the humo's field
      valoreUmore.valore = "";
      //I save the data
      let dati = await response.json();
      //I show the data on console to check if is all ok
      console.log(dati);
      window.location.href = "/benessere";
    } else {
      let errore = document.getElementById("errore-valore");
      //If the backend sends a negative message i show an error message
      return mostraErrore(errore, "Valore non caricato correttamente");
    }
  } catch (err) {
    console.log("Problema nella ricezione dell'input");
  }
}

let buttonInvioValori = document.getElementById("btn-umore");

buttonInvioValori.addEventListener("click", fetchUmore);

//I create a function to show the humr's graphic
async function graficoFelicita() {
  try {
    //I made fetch call to the API
    let response = await fetch(`/api/writevaloriumore`, {
      //I use metodh get
      method: "GET",
      //I request the id of the user
      credentials: "include",
    });
    //I save the data of the user in a box
    let result = await response.json();
    //If there isn't the data i'll show a error message
    if (!result.data) {
      console.log("Nessun dato disponibile");
      return;
    }
    //I will use the map function to create 2 news arrays
    //The first array will take just the days and will transform them in day/month/year
    //So i will have an array with just the date
    const labels = result.data.map((r) =>
      new Date(r.giorno).toLocaleDateString()
    );
    //The second array will take just the humor's values
    //So i will have an array with just the humor's value
    const valori = result.data.map((r) => r.valore);
    //I select the canva
    const ctx = document.getElementById("myChart");

    new Chart(ctx, {
      //I use the type line for the grapich to show just points link by lines
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Valori umore",
            data: valori,
            fill: false,
            borderColor: "#B17457",
            tension: 0.3,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } catch (err) {
    console.log("Errore di gestione valore", err);
  }
}

//I call the function "graficofelicita" to show the graphic of their humor's
graficoFelicita();
