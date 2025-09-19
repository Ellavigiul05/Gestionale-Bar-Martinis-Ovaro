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


//I create a function to send products to the db
async function inserimentoProdotti(e) {
  e.preventDefault();
  //I select the product
  let prodottoE = document.getElementById("prodotto");
  //I select his category
  let categoriaE = document.getElementById("categoria");
  //I select his level of absence
  let assenzaE = document.getElementById("assenza");
  //I select eventually notes for the product
  let notaE = document.getElementById("nota");

  //I take the value of the product
  let prodottoValue = prodottoE.value;
  //I take the value category of the product
  let categoriaValue = categoriaE.value;
  //I take the value of the absence of the product
  let assenzaValue = assenzaE.value;
  //I take the eventually value note of the product
  let notaValue = notaE.value;

  //I check if there is the product, the category iof the product and the level of absence
  if (!prodottoValue || !categoriaValue || !assenzaValue) {
    let errore = document.getElementById("errore-prodotto");
    return mostraErrore(errore, "Compilare tutti i campi");
  }

  //I save the data in a box
  const dati = {
    item: prodottoValue,
    tipologia: categoriaValue,
    importanza: assenzaValue,
    nota: notaValue,
  };

  try {
    //I made fetch call to the API
    let response = await fetch(
      `${apiURL}/api/inserimentoProdotti`,
      {
        //with method post
        method: "POST",
        //with json
        headers: { "content-type": "application/json" },
        //I transform data in json data
        body: JSON.stringify(dati),
        //I send the id session information to my backend
        credentials: "include",
      }
    );

    //If the backend gives me a positive answer
    if (response.ok) {
      //I clean the product field
      prodottoE.value = "";
      //I clean the category field
      categoriaE.value = "";
      //I clean the absence field
      assenzaE.value = "";
      //I clean the note field
      notaE.value = "";
      //i take the fetch call
      const data = await response.json();
      //I see the fetch call
      console.log(data);
      //I reload the page to update data
      window.location.href = "/listaSpesa";

      //if backend gives me a negative answer i show an error to the user
    } else {
      let errore = document.getElementById("errore-prodotto");
      return mostraErrore(errore, "Problema nell'inserimento del prodotto, riprova");
    }
  } catch (err) {
    console.log("Problema nell'arrivo dei dati del prodotto inserito", err);
  }
}

const buttonInserimentoItem = document.getElementById("btn-inserimento-item");

buttonInserimentoItem.addEventListener("click", inserimentoProdotti);

//I create a function to see the products in each table
async function visioneLista() {
  try {
    //I made a fetch call to the API
    let response = await fetch(`${apiURL}/api/ricezioneListaSpesa`);
    //I take the api's data
    let result = await response.json();
    //I create an object to associate each table to his selection
    let tables = {
      caffetteria: document.getElementById("table-caffetteria"),
      friulbrau: document.getElementById("table-friulbrau"),
      cibo: document.getElementById("table-cibo"),
      publicart: document.getElementById("table-publicart"),
      pulizia: document.getElementById("table-pulizia"),
      altro: document.getElementById("table-altro"),
    };

    //I use a forEach loop to show the data
    result.data.forEach((item) => {
      //I see in what table is the product
      const table = tables[item.tipologia];
      //I check if the product has is typology
      if (!table) return;

      //i create a "tr" tag element where i put the the "td" of the row of db
      let riga = document.createElement("tr");
      riga.innerHTML = `
                <td>${item.item}</td>
                <td class= "importanza-cell" data-id="${item.id}">${item.importanza}</td>
                <td>${item.nota}</td>
                <td>${item.username}</td>
                <td><button class= "modifica" data-id="${item.id}">Modifica assenza</button></td>
                <td><button class="elimina" data-id="${item.id}">Elimina Prodotto</button></td>
            `;

      //Then i append each product to his personal table
      table.appendChild(riga);

      let importanzaCell = riga.querySelector(".importanza-cell");

      if (item.importanza == "lieve") {
        importanzaCell.style.backgroundColor = "#A8D5BA";
      } else if (item.importanza == "moderato") {
        importanzaCell.style.backgroundColor = "#F3DFA2";
      } else {
        importanzaCell.style.backgroundColor = "#F1A59C";
      }
      //I select each delete button, and everytime i click it i pass the personal id of the db to the deleteProduct function where i delete the row of the db
      riga.querySelector(".elimina").addEventListener("click", (e) => {
        const idBottone = e.target.dataset.id;
        eliminaProdotti(idBottone);
      });

      riga.querySelector(".modifica").addEventListener("click", (e) => {
        e.preventDefault()
        const idModificaBottone = e.target.dataset.id;
        const celleDacambiare = riga.getElementsByClassName("importanza-cell");
        let BottoneModificato;
        for (let i = 0; i < celleDacambiare.length; i++) {
          let verifica = celleDacambiare[i].dataset.id;
          if (verifica == idModificaBottone) {
            BottoneModificato = celleDacambiare[i];
          }
        }

        BottoneModificato.innerHTML = "";
        BottoneModificato.innerHTML = `
          <select name="assenza-nuova" id="assenza-nuova">
            <option value="lieve">Lieve</option>
            <option value="moderato">Moderato</option>
            <option value="grave">Grave</option>
          </select>
        `;
        let select = BottoneModificato.querySelector("#assenza-nuova");

        select.addEventListener("change", () => {
          let nuovaAssenza = select.value;
          modificaAssenza(idModificaBottone, nuovaAssenza);
        });
      });
    });
  } catch (err) {
    console.log("Impossibile trovare il prodotto", err);
  }
}

visioneLista();

//I create the function to delete product's row of the db
async function eliminaProdotti(idProdottoSelezionato) {
  //I check if there is the id of the product's row
  if (!idProdottoSelezionato) {
    return console.log("Nessun prodotto trovato");
  }
  //I save the id product's row
  const dati = { idProdotto: idProdottoSelezionato };

  try {
    //I made a fetch call
    let response = await fetch(
      `${apiURL}/api/eliminazioneProdotto`,
      {
        //With method post
        method: "POST",
        //With json language
        headers: { "content-type": "application/json" },
        //I transform the data in json data
        body: JSON.stringify(dati),
      }
    );

    //If the backend gives me a positive answer
    if (response.ok) {
      //I reload the page to update the data products
      window.location.href = "/listaSpesa";
    } else {
      return console.log("Errore di eliminazione prodotto, riprova");
    }
  } catch (err) {
    console.log("Impossibile eliminare il prodotto:", err);
  }
}

//I create a function to change the type of absence
async function modificaAssenza(idRiga, newAssenza) {
  //I check if there is the id of the row and the new absence type
  if (!idRiga || !newAssenza) {
    return alert("Selezionare riga e nuova assenza");
  }
  //I put this data in a box
  const dati = { id: idRiga, nuovaAssenza: newAssenza };

  try {
    //I made a call to api
    let response = await fetch(
      `${apiURL}/api/modificaAssenzaProdotto`,
      {
        //With method post
        method: "POST",
        //With json
        headers: { "content-type": "application/json" },
        //I pass the data
        body: JSON.stringify(dati),
      }
    );
    //If is all ok 
    if (response.ok) {
      //I reload the page to update data
      window.location.href = "/listaSpesa";
    }else{
      //I'll show the problem if there is
      return alert("Impossibile cambiare il tipo di assenza, riprovare");
    }
  } catch (err) {
    console.log("Nessuna modifica effettua errore: ", err);
  }
}
