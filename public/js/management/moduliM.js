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

async function letturaDatiTrasporto(e) {
  e.preventDefault();

  const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-trasporti");
    return mostraErrore(errore, "Selezionare un mese");
  }

  try {
    let response = await fetch(
      `/api/visualizzaDatiTrasporto?mese=${meseNum}`,
      {
        method: "GET",
      }
    );

    let result = await response.json();

    let bodyTrasporti = document.getElementById("body-trasporti");
    bodyTrasporti.innerHTML = "";

    result.dati.forEach((trasporto) => {
      let riga = document.createElement("tr");

      let giorno = new Date(trasporto.giorno).toLocaleDateString();

      riga.innerHTML = `
            <td>${giorno}</td>
            <td>${trasporto.nome_fornitore}</td>
            <td>${trasporto.nome_prodotto}</td>
            <td>${trasporto.condizione_trasporto}</td>
            <td>${trasporto.integrita_confezioni}</td>
            <td>${trasporto.etichettatura}</td>
            <td>${trasporto.infestanti}</td>
            <td>${trasporto.temperatura}</td>
            <td>${trasporto.username}</td>
            `;

      bodyTrasporti.appendChild(riga);
    });
  } catch (err) {
    console.log("Errore nell'ottenimento dei dati di trasporto");
  }
}

document
  .getElementById("seleziona-mese")
  .addEventListener("click", letturaDatiTrasporto);

document.getElementById("ex-trasporti").addEventListener("click", () => {
  const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-trasporti");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelTrasporti?mese=${meseNum}`; 
});

async function letturaDatiIgiene(e) {
  e.preventDefault();

  const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese-igiene").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-igiene");
    return mostraErrore(errore, "Selezionare un mese");
  }

  try {
    let response = await fetch(
      `/api/visualizzaDatiIgiene?mese=${meseNum}`,
      {
        method: "GET",
      }
    );

    let result = await response.json();

    let bodyIgiene = document.getElementById("body-igiene");
    bodyIgiene.innerHTML = "";

    result.dati.forEach((igiene) => {
      let riga = document.createElement("tr");

      let giorno = new Date(igiene.giorno).toLocaleDateString();

      riga.innerHTML = `
            <td>${giorno}</td>
            <td>${igiene.controllo}</td>
            <td>${igiene.locale}</td>
            <td>${igiene.attrezzature}</td>
            <td>${igiene.personale}</td>
            <td>${igiene.username}</td>
            `;

      bodyIgiene.appendChild(riga);
    });
  } catch (err) {
    console.log("Errore nell'ottenimento dei dati di trasporto");
  }
}

document
  .getElementById("seleziona-igiene")
  .addEventListener("click", letturaDatiIgiene);


document.getElementById("ex-igiene").addEventListener("click", ()=>{
    const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese-igiene").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-igiene");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelIgiene?mese=${meseNum}`; 
})

async function letturaDatiTemperature(e) {
  e.preventDefault();

  const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese-frigo").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-frighi");
    return mostraErrore(errore, "Selezionare un mese");
  }

  try {
    let response = await fetch(
      `/api/visualizzaDatiTemperature?mese=${meseNum}`,
      {
        method: "GET",
      }
    );

    let result = await response.json();

    let bodyFrighi = document.getElementById("body-frighi");
    bodyFrighi.innerHTML = "";

    result.dati.forEach((frigo) => {
      let riga = document.createElement("tr");

      let giorno = new Date(frigo.giorno).toLocaleDateString();

      riga.innerHTML = `
            <td>${giorno}</td>
            <td>${frigo.parte_giornata}</td>
            <td>${frigo.n1}</td>
            <td>${frigo.n2}</td>
            <td>${frigo.n3}</td>
            <td>${frigo.bar}</td>
            <td>${frigo.gelati}</td>
            <td>${frigo.vini}</td>
            <td>${frigo.bibite}</td>
            <td>${frigo.username}</td>
            `;

      bodyFrighi.appendChild(riga);
    });
  } catch (err) {
    console.log("Errore nell'ottenimento dei dati di trasporto");
  }
}

document
  .getElementById("seleziona-frighi")
  .addEventListener("click", letturaDatiTemperature);


  document.getElementById("ex-temperature").addEventListener("click", ()=>{
    const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  let mesePreso = document.getElementById("mese-frigo").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-frighi");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelTemperature?mese=${meseNum}`; 
});
