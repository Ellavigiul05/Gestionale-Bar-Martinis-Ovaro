let toggle = document.getElementById("toggle-side");
let hiddenBar = document.getElementById("hidden-bar");

toggle.addEventListener("click", () => {
  hiddenBar.style.display = "block";
});

let x = document.getElementById("delete-side");

x.addEventListener("click", () => {
  hiddenBar.style.display = "none";
});


//I create a function to see the free day's requests
async function VisioneRichiesteGiorni() {
  try {
    //I made an api call
    let response = await fetch(
      `${apiURL}/api/visioneRichiesteGiorni`
    );
    //I take the selected rows
    let result = await response.json();
    //I select the tbody
    const bodyTabellaGiorni = document.getElementById("body-giorniX");
    //I clean the tbody
    bodyTabellaGiorni.innerHTML = ``;
    //For each row of the request i write the data
    result.dati.forEach((richiesta) => {
      let riga = document.createElement("tr");
      let giorno = new Date(richiesta.giorno).toLocaleDateString();

      riga.innerHTML = `
      <td>${richiesta.username}</td>
      <td>${giorno}</td>
      <td><button class="approvati status" data-value = "approvato" data-id = "${richiesta.id}">Approva</button></td>
      <td><button class="negati status" data-value= "negato" data-id = "${richiesta.id}">Nega</button></td>
      `;

      bodyTabellaGiorni.appendChild(riga);
      //I take the button status
      let bottoniStatus = riga.getElementsByClassName("status");
      //For eache status i give a different css style
      if (richiesta.status === "approvato") {
        riga.querySelector(".approvati").style.backgroundColor = "green";
      } else if (richiesta.status === "negato") {
        riga.querySelector(".negati").style.backgroundColor = "red";
      }
      //For each status button i take the value of the status and his id
      for (let i = 0; i < bottoniStatus.length; i++) {
        bottoniStatus[i].addEventListener("click", (e) => {
          let valoreStatusGiorni = e.target.dataset.value;
          let idRichiestaGiorno = e.target.dataset.id;
          invioStatusGiorno(valoreStatusGiorni, idRichiestaGiorno);

          let riga = e.target.closest("tr");
          //I change the css style for what status is selected
          riga.querySelectorAll(".status").forEach((btn) => {
            btn.style.backgroundColor = "";
          });

          if (valoreStatusGiorni === "approvato") {
            e.target.style.backgroundColor = "green";
          } else if (valoreStatusGiorni === "negato") {
            e.target.style.backgroundColor = "red";
          }
        });
      }
    });
  } catch (err) {
    console.log("Errore nella visione della tabella", err);
  }
}


VisioneRichiesteGiorni();

//I create a function to send the status to the employee
async function invioStatusGiorno(valoreStatusGiorni, idRichiestaGiorno) {
  //I check if there are the status value and his id
  if (!valoreStatusGiorni || !idRichiestaGiorno) {
    return alert("Dare una risposta");
  }

  //I put the data in a box
  const data = {
    valoreStatusGiorni: valoreStatusGiorni,
    idRichiestaGiorno: idRichiestaGiorno,
  };

  try {
    //I made an api call
    let response = await fetch(`${apiURL}/api/invioStatusGiorno`, {
      //With method post
      method: "POST",
      //With json
      headers: { "content-type": "application/json" },
      //I pass the data
      body: JSON.stringify(data),
    });

    //If is all ok
    if (response.ok) {
      //I reload the page to update the data
      window.location.href = "/richiesteM";
    } else{
      //If there is an error i will show it
      console.log("Problema di risposta status");
    }
  } catch (err) {
    console.log("Errore nell'invio dei dati");
  }
}

//The same think for the holidays
async function visioneVacanze() {
  try {
    let response = await fetch(`${apiURL}/api/visioneVacanze`);
    let result = await response.json();

    const bodyVacanze = document.getElementById("body-vacanze");

    bodyVacanze.innerHTML = "";

    result.dati.forEach((vacanza) => {
      let riga = document.createElement("tr");

      let giornoInizio = new Date(vacanza.giorno_inizio).toLocaleDateString();

      let giornoFine = new Date(vacanza.giorno_fine).toLocaleDateString();

      riga.innerHTML = `
      <td>${vacanza.username}</td>
      <td>${giornoInizio}</td>
      <td>${giornoFine}</td>
      <td><button class = "approvaV statusV" data-id = "${vacanza.id}" data-value = "approvato">Approva</button></td>
      <td><button class = "negatoV statusV" data-id = "${vacanza.id}" data-value = "negato">Negato</button></td>
      `;

      bodyVacanze.appendChild(riga);

      if (vacanza.status === "approvato") {
        riga.querySelector(".approvaV").style.backgroundColor = "green";
      } else if (vacanza.status === "negato") {
        riga.querySelector(".negatoV").style.backgroundColor = "red";
      }

      let buttonsStatus = riga.getElementsByClassName("statusV");

      for (let i = 0; i < buttonsStatus.length; i++) {
        buttonsStatus[i].addEventListener("click", (e) => {
          let valoreStatusVacanze = e.target.dataset.value;
          let idRichiestaVacanza = e.target.dataset.id;

          invioStatuVacanze(valoreStatusVacanze, idRichiestaVacanza);

          let riga = e.target.closest("tr");

          riga.querySelectorAll(".statusV").forEach((btn) => {
            btn.style.backgroundColor = "";
          });

          if (valoreStatusVacanze === "approvato") {
            e.target.style.backgroundColor = "green";
          } else if (valoreStatusVacanze === "negato") {
            e.target.style.backgroundColor = "red";
          }
        });
      }
    });
  } catch (err) {
    console.log("Impossibile visualizzare i dati", err);
  }
}

visioneVacanze();

async function invioStatuVacanze(valoreStatusVacanze, idRichiestaVacanza) {
  if ((!valoreStatusVacanze, !idRichiestaVacanza)) {
    return alert("Selezionare uno status");
  }

  const dati = {
    valoreStatusVacanze: valoreStatusVacanze,
    idRichiestaVacanza: idRichiestaVacanza,
  };

  try {
    let response = await fetch(`${apiURL}/api/invioStatusVacanze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(dati),
    });

    if (response.ok) {
      window.location.href = "/richiesteM";
    } else{
      console.log("Problema di inserimento status");
    }
  } catch (err) {
    console.log("Impossibile inviare lo status", err);
  }
}
