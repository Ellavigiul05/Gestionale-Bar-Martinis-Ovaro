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



//I create a function to see the products in each table
async function visioneLista() {
  try {
    //I made a fetch call to the API
    let response = await fetch(`/api/ricezioneListaSpesa`);
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
                <td class= "importanza-cell">${item.importanza}</td>
                <td>${item.nota}</td>
                <td>${item.username}</td>
            `;

      //Then i append each product to his personal table
      table.appendChild(riga);
      //I select the elements that contains the importance
      let importanzaCell = riga.querySelector(".importanza-cell");
      //For each importance i give a different style
      if (item.importanza == "lieve") {
        importanzaCell.style.backgroundColor = "#A8D5BA";
      } else if (item.importanza == "moderato") {
        importanzaCell.style.backgroundColor = "#F3DFA2";
      } else {
        importanzaCell.style.backgroundColor = "#F1A59C";
      }

      

    });

    let bodys = ["table-caffetteria","table-friulbrau", "table-cibo", "table-publicart", "table-pulizia", "table-altro"];
    //If the products in a table are 0 i won't show the delete button
    bodys.forEach(id=>{
        let tabella = document.getElementById(id);
        let bottoneElimina = document.getElementById(`btn-delete-${id}`);

        if(tabella.getElementsByTagName("tr").length == 0) {
            bottoneElimina.style.display="none";
        }else{
            bottoneElimina.style.display="block";
        }
    });
  } catch (err) {
    console.log("Impossibile trovare il prodotto", err);
  }
}

visioneLista();


//I take the delete buttons
let corpiTabelle = document.getElementsByClassName("btn-delete-all");
//When i click on each delete button i pass the name of the cateogry to the function where i delete everything
for(let i = 0; i < corpiTabelle.length; i++) {
    corpiTabelle[i].addEventListener("click", (e)=>{
        let categoria = e.target.dataset.value;
        EliminaContenutiTabella(categoria);
    })
}


//I create a function to delete the products of a category
async function EliminaContenutiTabella(categoria) {
    //I chek if there is the category's name 
    if(!categoria) {
        return alert("Nessuna tabella da eliminare selezionata");
    }

    try{
      //I made an api call
        let response = await fetch(`/api/eliminazioneProdottiTotale`, {
          //With method post
            method:"POST",
            //With json
            headers: {"content-type": "application/json"},
            //I pass the category's name
            body: JSON.stringify({categoria}),
        });
        //If is all ok
        if(response.ok) {
          //I reload the page to update data
            window.location.href="/listaSpesaM";
        }
    }catch(err) {
        console.log("Nessuna tabella da eliminare trovata");
    }
    
}






