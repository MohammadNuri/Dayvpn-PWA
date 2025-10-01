import sha256 from "crypto-js/sha256";

const password = "125451254mS!";
const hash = sha256(password).toString();

console.log("Hashed password:", hash);
