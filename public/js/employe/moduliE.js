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

async function InvioDatiIgiene(e) {
  e.preventDefault();
  let checkValue = document.getElementById("controllo").value;
  let dayValue = document.getElementById("giorno").value;
  let localeValue = document.getElementById("locale").value;
  let attrezzatureValue = document.getElementById("attrezzature").value;
  let personaleValue = document.getElementById("personale").value;

  if (
    !checkValue ||
    !dayValue ||
    !localeValue ||
    !attrezzatureValue ||
    !personaleValue
  ) {
    let errore = document.getElementById("errore-igiene");
    return mostraErrore(errore, "Compilare tutti i campi");
  }

  const dati = {
    giorno: dayValue,
    locale: localeValue,
    attrezzature: attrezzatureValue,
    personale: personaleValue,
    controllo: checkValue,
  };

  try {
    let response = await fetch(`/api/invioDatiIgiene`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(dati),
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/moduliE";
    } else {
      let errore = document.getElementById("errore-igiene");
      return mostraErrore(
        errore,
        "Impossibile inserire i dati igiene, riprovare"
      );
    }
  } catch (err) {
    console.log("Impossibile inserire i dati igiene", err);
  }
}

document
  .getElementById("btn-igiene")
  .addEventListener("click", InvioDatiIgiene);

async function invioDatiTrasporto() {
  let data = document.getElementById("giorno-consegna").value;
  let nomeFornitore = document.getElementById("fornitore").value;
  let prodotto = document.getElementById("prodotto").value;
  let condizioneTrasporto = document.getElementById(
    "condizione-trasporto"
  ).value;
  let integritaConfezioni = document.getElementById("integrita").value;
  let etichetta = document.getElementById("etichettatura").value;
  let vInfestanti = document.getElementById("infestanti").value;
  let temperaturaConsegna = document.getElementById("temperatura").value;

  if (
    !data ||
    !nomeFornitore ||
    !prodotto ||
    !condizioneTrasporto ||
    !integritaConfezioni ||
    !etichetta ||
    !vInfestanti ||
    !temperaturaConsegna
  ) {
    let errore = document.getElementById("errore-trasporto");
    return mostraErrore(errore, "Compilare tutti i campi");
  }

  const dati = {
    giorno: data,
    nFornitore: nomeFornitore,
    nProdotto: prodotto,
    cTrasporto: condizioneTrasporto,
    iConfezioni: integritaConfezioni,
    etichettatura: etichetta,
    infestanti: vInfestanti,
    temperatura: temperaturaConsegna,
  };

  try {
    let response = await fetch(`/api/invioDatiTrasporto`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(dati),
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/moduliE";
    } else {
      let errore = document.getElementById("errore-trasporto");
      return mostraErrore(errore, "Problema nell'invio dei dati, riprovare");
    }
  } catch (err) {
    console.log("Impossibile inviare i dati di trasporto", err);
  }
}

document
  .getElementById("btn-trasporto")
  .addEventListener("click", invioDatiTrasporto);

async function invioDatiTemperature(e) {
  e.preventDefault();
  let giornoValue = document.getElementById("giorno-frighi").value;
  let controlloValue = document.getElementById("parte").value;
  let frigo1Value = document.getElementById("n1").value;
  let frigo2Value = document.getElementById("n2").value;
  let frigo3Value = document.getElementById("n3").value;
  let frigoBar = document.getElementById("bar-frigo").value;
  let frigoGelati = document.getElementById("gelati").value;
  let frigoVini = document.getElementById("vini").value;
  let frigoBibite = document.getElementById("bibite").value;

  let valori = [giornoValue, controlloValue, frigo1Value, frigo2Value, frigo3Value, frigoBar, frigoGelati, frigoVini, frigoBibite];

  for(let i = 0; i < valori.length; i++) {
    if(!valori[i]) {
      let errore = document.getElementById("errore-temperature");
      return mostraErrore(errore, "Compilare i campi");
    }
  }

  const dati = {
    giorno: giornoValue,
    parteGiornata: controlloValue,
    frigo1: frigo1Value,
    frigo2: frigo2Value,
    frigo3: frigo3Value,
    bar: frigoBar,
    gelati: frigoGelati, 
    vini: frigoVini, 
    bibite: frigoBibite,
  };

  try {
    let response = await fetch(
      `/api/invioDatiTemperature`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dati),
        credentials: "include",
      }
    );

    if (response.ok) {
      window.location.href = "/moduliE";
    }
  } catch (err) {
    console.log("Errore nell'inserimento delle temperature");
  }
}

document
  .getElementById("btn-temperature")
  .addEventListener("click", invioDatiTemperature);



document.getElementById("ex-trasporti-btn").addEventListener("click", (e) => {
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

  let mesePreso = document.getElementById("mese-trasporti").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-mese-trasporto");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelTrasportiE?mese=${meseNum}`; 
});



document.getElementById("ex-igiene-btn").addEventListener("click", (e)=>{
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
    let errore = document.getElementById("errore-igiene");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelIgieneE?mese=${meseNum}`; 
});


  document.getElementById("ex-temperature-btn").addEventListener("click", (e)=>{
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

  let mesePreso = document.getElementById("mese-temperature").value.toLowerCase();
  let meseNum = mesi[mesePreso];

  if (!mesePreso) {
    let errore = document.getElementById("errore-temperature");
    return mostraErrore(errore, "Selezionare un mese");
  }

  window.location.href = `/api/excelTemperatureE?mese=${meseNum}`; 
});