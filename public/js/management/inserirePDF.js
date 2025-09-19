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





//I create a function to insert the pdf file
async function inserimentoFilePDF(e) {
    e.preventDefault();

    //I select the file field
    let filePDF = document.getElementById("file").files[0];

    //I pass the file 
    const formData = new FormData();
    formData.append("file", filePDF);

    try{
        //I made an api request
        let response = await fetch(`${apiURL}/api/invioPDF`, {
            //With method post
            method: "POST",
            //I pass the file
            body: formData,
        });

        //If is all ok
        if(response.ok) {
            //I give a positive answer
            let positivo = document.getElementById("messaggio-positivo");

            mostraRispostaPositiva(positivo, "Documento caricato con successo");
        }else{
            //Else i'll show a negative answer
            let errore = document.getElementById("errore-invio");

            mostraErrore(errore, "Errore nella lettura del documento, riprovare");
        }
    }catch(err) {
        console.log("Errore nella lettura file", err);
    }
    
}

//When i calick the send file button i send the pdf
document.getElementById("invio-pdf").addEventListener("click", inserimentoFilePDF);



document.getElementById("dow-qr").addEventListener("click", async ()=>{
    try{
        window.location.href=`${apiURL}/api/qrcode/download`
    }catch(err) {
        console.log("Errore nel download del codice qr")
    }
})

