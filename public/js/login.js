function mostraErrore(divErrore, message) {

  divErrore.innerHTML = "";

  let errore = document.createElement("h3");

  errore.classList.add("error");

  errore.innerText = message;

  divErrore.appendChild(errore);
}


//I create a function to take the data from login for the backend
async function fetchLogin(e) {
  e.preventDefault();
  //I select the username insert from user
  let usernamEl = document.getElementById("username");
  //I select the password insert from user
  let passwordEl = document.getElementById("password");
  //I take the value of the username
  let usernameInput = usernamEl.value;
  //I take the value of the password
  let passwordInput = passwordEl.value;
  //If the username or password are clean i'll show the error message
  if (usernameInput == "" || passwordInput == "") {
    let errore = document.getElementById("error-container");
    return mostraErrore(errore, "Compilare tutti i campi");
  }
  //I create a box where i store the data for the backend
  const dati = { username: usernameInput, password: passwordInput };

  try {
    //I call the api where i handler the user data
    const response = await fetch(
      `/api/InserimentoDatiAccesso`,
      {
        //I choose the method
        method: "POST",
        //I choos in what type of langue i pass the data(in this case, json)
        headers: { "content-type": "application/json" },
        //At the end i pass the data in the form of json
        body: JSON.stringify(dati),
      }
    );

    
    //If is everything ok 
    if (response.ok) {
      //I clean the username box
      usernamEl.value = "";
      //I clean the password box
      passwordEl.value = "";
      //I create a box where i take the data already pass now
      const data = await response.json();

      if(data.username == "ugoValle") {
        window.location.href="/personale"
      } else{
          window.location.href = "/turni";
      }
    } else {
      let errore = document.getElementById("error-container");
      //In the case where the username or password have a mistake i will show the error
      mostraErrore(errore, "Username o password errati");
    }
  } catch (err) {
    console.log("Errore nell'inserimento dei dati", err);
  }
}

//I select the button to send data
const bottoneLogin = document.getElementById("login-btn");
//Everytime i click the button I will active the fetchlogin
bottoneLogin.addEventListener("click", fetchLogin);
