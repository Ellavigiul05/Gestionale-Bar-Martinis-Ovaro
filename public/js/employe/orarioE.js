let toggle = document.getElementById("toggle-side");
let hiddenBar = document.getElementById("hidden-bar");

toggle.addEventListener("click", ()=>{
    hiddenBar.style.display = "block"
});

let x = document.getElementById("delete-side");

x.addEventListener("click", ()=>{
    hiddenBar.style.display="none";
});



//When i change the month will be displayed the shifts of that month
document.getElementById("mese").addEventListener("change", () => {
  let meseValue = document.getElementById("mese").value;
  VedereTabella(meseValue);
});

//I create a function to see the table 
async function VedereTabella(mese) {
  try {
    let response = await fetch(`${apiURL}/api/ottieniOrari?mese=${mese}`);
    let result = await response.json();

    let corpoTabella = document.getElementById("body-orario");
    corpoTabella.innerHTML = "";

    result.data.forEach(giorno => {
      let riga = document.createElement("tr");

      riga.innerHTML = `
        <td>${giorno.giorno}</td>
        <td>${giorno.turno_1 || ""}</td>
        <td>${giorno.turno_2 || ""}</td>
        <td>${giorno.turno_3 || ""}</td>
        <td>${giorno.turno_4 || ""}</td>
      `;

      corpoTabella.appendChild(riga);
    });
  } catch (err) {
    console.log("Errore: ", err);
  }
}
