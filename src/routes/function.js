import bcrypt from "bcrypt";

//hash password function
 export async function  hashPassword(password) {
    
  const saltRounds = 10;

  let secureHashPassword = bcrypt.hash(password, saltRounds);

  return secureHashPassword;
}

export async function comparazione(password, arrayDiPassword) {

  let valid = bcrypt.compare(password, arrayDiPassword);

  return valid;
  
}

export function differenzaOre(inizio, fine) {
  if (!fine) return "";


  const [hInizio, mInizio] = inizio.split(":").map(Number);
  const [hFine, mFine] = fine.split(":").map(Number);


  let minutiInizio = hInizio * 60 + mInizio;
  let minutiFine = hFine * 60 + mFine;


  if (minutiFine < minutiInizio) {
    minutiFine += 24 * 60; 
  }

  const diffMinuti = minutiFine - minutiInizio;
  const ore = Math.floor(diffMinuti / 60);
  const minuti = diffMinuti % 60;


  return `${ore}:${minuti.toString().padStart(2, "0")}`;
}


export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  next();
}










