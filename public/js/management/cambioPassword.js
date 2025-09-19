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

//I create a function to check if the secure answer is correct
async function InserisciRisposta(e) {
  e.preventDefault();

  //I select the hidden field where will be the form to change password
  let sezioneCambioPassword = document.getElementById("hidden");
  //I select the field of the user's answer
  let risposta = document.getElementById("cosa");

  //I take the value
  let rispostaValue = risposta.value;

  //I check if there is the user's answer
  if (!rispostaValue) {
    let errore = document.getElementById("errore-risposta");
    return mostraErrore(errore, "Compilare il campo");
  }

  try {
    let response = await fetch(`${apiURL}/api/verificaRisposta`, {
        method: "POST", 
        headers: {"content-type" : "application/json"},
        body: JSON.stringify({risposta: rispostaValue})
    });
    //I made a comparison bewtween the user's answer and the real answer
    if (response.ok) {
      //If is ok a make the form section visible
      sezioneCambioPassword.style.display = "block";
    } else {
      //Else i will show an error
      let errore = document.getElementById("errore-risposta");
      return mostraErrore(errore, "Risposta sbagliata");
    }
  } catch (err) {
    console.log("Errore nell'arrivo della risposta");
  }
}

//I select the answer button to send the answer
let bottoneSendRisposta = document.getElementById("btn-risposta");
bottoneSendRisposta.addEventListener("click", InserisciRisposta);

//I create a function to change the password
async function CambioDellaPassword(e) {
  e.preventDefault();
  //I select the field of the new password
  let newPassword = document.getElementById("password");
  //I take the value of the password
  let passwordValue = newPassword.value;
  //I check if there is the password
  if (!passwordValue) {
    let errore = document.getElementById("errore-password");
    return mostraErrore(errore, "Inserire una nuova password");
  }

  //I put the data in box
  const dati = { password: passwordValue };

  try {
    //I made an api call
    const response = await fetch(`${apiURL}/api/cambioPassword`, {
      //With method post
      method: "POST",
      //With json
      headers: { "content-type": "application/json" },
      //I pass the data
      body: JSON.stringify(dati),
      //I pass the user id
      credentials: "include",
    });

    //if is all ok
    if (response.ok) {
      //I redirect the page to /personale
      window.location.href = "/personale";
    } else {
      //Else i will show the error
      let errore = document.getElementById("errore-password");
      return mostraErrore(
        errore,
        "Non è stato possibile ricambiare password, riprova",
        container2
      );
    }
  } catch (err) {
    console.log("Non è stato possibile cambiare la password", err);
  }
}

//I select the change password button to change the password when i click it
let bottoneCambioPassword = document.getElementById("btn-new-password");

bottoneCambioPassword.addEventListener("click", CambioDellaPassword);
