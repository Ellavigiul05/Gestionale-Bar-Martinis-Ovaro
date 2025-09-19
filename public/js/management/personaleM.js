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

//I create a function to add new employee
async function newEmployees(e) {
    e.preventDefault();
    //I select the field of name password email and phone
    let usernameM = document.getElementById("username");
    let passwordM = document.getElementById("password");
    let emailM = document.getElementById("email");
    let telefonoM = document.getElementById("telefono");
    //I take the values
    let usernameValue = usernameM.value;
    let passwordValue = passwordM.value;
    let emailValue = emailM.value;
    let telefonoValue = telefonoM.value;
    //I check if there are the username and password
    if(!usernameValue || !passwordValue) {
        let errore = document.getElementById("errore-personale");
        return mostraErrore(errore, "Compilare campi obbligatori");
    }
    //I put the data in a box
    const dati = {username: usernameValue, password: passwordValue, email: emailValue, telefono: telefonoValue};

    try{
        //I mada an api call
        let response = await fetch(`${apiURL}/api/inserimentoPersonale`, {
            //With method post
            method: "POST",
            //WIth json
            headers: {"content-type": "application/json"},
            //I pass the data
            body: JSON.stringify(dati),
        });
        //If is all ok
        if(response.ok) {
            //I clean the fields
            usernameM.value = "";
            passwordM.value = "";
            emailM.value = "";
            telefonoM.value = "";
            //I reload the page to update the data
            window.location.href="/personale";
        }else{
            //If there is an error i will show it
            let errore = document.getElementById("errore-personale")
            return mostraErrore(errore, "Problema nell'invio dei dati, reinserire i valori");
        }
    }catch(err) {
        console.log("Problema nell'invio dei dati", err);
    }
    
}

//I select the button to create the account
const bottoneCreaAccount = document.getElementById("new-employee");
//Every time i click it i create an account
bottoneCreaAccount.addEventListener("click", newEmployees);



//I create a function to show the employees
async function mostraDipendenti() {

    try{
        //I made an api call
        let response = await fetch(`${apiURL}/api/mostraDipendenti`);
        //I take the selected rows
        let result = await response.json();
        //I select the tbody 
        const raccolta_lavoratori = document.getElementById("employees");
        //For each row i'll show the data
        result.data.forEach(lavoratore => {
            let riga = document.createElement("tr");

            riga.innerHTML= `
                <td data-label = "Username">${lavoratore.username}</td>
                <td data-label = "Cambio Password"><button class= "change" data-id="${lavoratore.id}">Cambio password</button></td>
                <td data-label = "Email"><a href="mailto:${lavoratore.email}">${lavoratore.email}</a></td>
                <td data-label = "Telefono"><a href="tel:${lavoratore.telefono}">+39 ${lavoratore.telefono}</a></td>
                <td data-label = "Elimina Lavoratore"><button class= "delete" data-id= "${lavoratore.id}">Elimina lavoratore</button></td>
            `

            raccolta_lavoratori.appendChild(riga);


            let bottoneElimina = riga.getElementsByClassName("delete");
            //I pass the id of the row to delete it
            for(let i = 0; i < bottoneElimina.length; i++) {
                bottoneElimina[i].addEventListener("click", (e)=>{
                    let idBottone = e.target.dataset.id;
                    eliminaLavoratore(idBottone);
                })
            }

            let bottoneCambio = riga.getElementsByClassName("change");
            //I pass the id of the worker to change is password
            for(let i = 0; i < bottoneCambio.length; i++) {
                bottoneCambio[i].addEventListener("click", (e)=>{
                    let idLavoratore = e.target.dataset.id;
                    passareIdCambioPassword(idLavoratore);
                })
            }

        });
    }catch(err) {
        console.log("Nessuna ricezione dei dati", err);
    }
    
}

mostraDipendenti();


//I create a function to delete workers
async function eliminaLavoratore(idBottone) {
    //I check if there is the button id
    if(!idBottone) {
        return mostraErrore("nessun lavoratore da eliminare trovato");
    }    
    //I put the id in a box
    const dato = {idLavoratore: idBottone};

    try{
        //I made an api call
        let response = await fetch(`${apiURL}/api/eliminazioneLavoratore`, {
            //With method post
            method: "POST",
            //With json
            headers: {"content-type" : "application/json"},
            //I pass the data
            body: JSON.stringify(dato),
        });

        //If is all ok
        if(response.ok) {
            //I reload the page to update the data
            window.location.href= "/personale"
        }else{
            //Else i will show the error
            return mostraErrore("Impossibile trovare lavoratore da eliminare")
        }
    }catch(err) {
        console.log("Id del bottone non trovato", err);
    }
}


//I create a function to change the password
async function passareIdCambioPassword(idLavoratore) {
    //I check if there is the worker id
    if(!idLavoratore){
        return alert("Nessun lavoratore trovato");
    }

    try {
        //I made an api call
      let response = await fetch(`${apiURL}/api/setLavoratore`, {
        //With method post
        method: "POST",
        //With json
        headers: { "Content-Type": "application/json" },
        //I pass the userId
        credentials: "include",
        //I pass the worker id
        body: JSON.stringify({ idLavoratore })
      });

      //If is all ok
      if(response.ok) {
        //I redirect to the page where i will change the password
        window.location.href = "/cambioPassword";
      }

    } catch (err) {
      console.error("Errore nel settaggio lavoratore", err);
    }


    
}
