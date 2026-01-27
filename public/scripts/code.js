// Hämtar DOM element
const formUsername = document.querySelector("#formUsername");
const formMessage = document.querySelector("#formMessage");
const msgElement = document.getElementById("msg");
const chatElement = document.getElementById("chat");
const usernameElement = document.querySelector("#username");
const gamePage = document.querySelector("#gamePage");
const startPage = document.querySelector("#startPage");
const sendButton = document.querySelector("#sendButton");

// Websocket-anslutning till servern

const websocket = new WebSocket("ws://localhost:8555");

let username;

// Händelselyssnare

// När användaren anger sitt namn och strartar chatten
formUsername.addEventListener("submit", (e) => {
  e.preventDefault();

  // Spara användarnamnet lokalt
  username = usernameElement.value.trim();

  // Lås input så namnet inte ändras mitt i chatten
  usernameElement.setAttribute("disabled", true);

  // Visa chattsektionen först när användaren submittat sitt användarnamn
  // chatSection.classList.remove("hidden");
  // istället för chatSection.classList.remove("hidden"); Lägg till display flex
  // ge startPage class hidden

  gamePage.style.display = "flex";
  startPage.classList.add("hidden");
});

// Lyssnar på input i meddelandefältet
msgElement.addEventListener("input", () => {
  if (msgElement.value.trim() === "") {
    sendButton.classList.add("disabled");
    sendButton.disabled = true;
    return;
  } else {
    sendButton.classList.remove("disabled");
    sendButton.disabled = false;
  }
});

// När användaren skickar ett chattmeddelande
formMessage.addEventListener("submit", (e) => {
  e.preventDefault();

  // Hämtar texten som skrivits i inputfältet
  const msg = msgElement.value;

  // Skapar ett obj som innehåller både: meddelandet och vem som skickade det
  const obj = { msg: msg, username: username };

  // Skickar meddelandet till servern via Websocket
  websocket.send(JSON.stringify(obj));

  // Rensar input fältet efter meddelandet har skickats
  msgElement.value = "";
});

// Lyssnar på tangenttryck i meddelandeinput
msgElement.addEventListener("keydown", (e) => {
  console.log("is typing", e.key);
});

// Websocket-lyssnare
// Tar emot data från servern i realtid

websocket.addEventListener("message", (e) => {
  // Data tas emot som text och parsas till objekt
  const obj = JSON.parse(e.data);
  console.log("obj", obj);

  // Renderar meddelandet i chatten
  renderMessage(obj);
});

// Funktioner

function renderMessage(obj) {
  const p = document.createElement("p");

  // Visar både användarnamn och meddelande
  p.textContent = `${obj.username}: ${obj.msg}`;

  chatElement.appendChild(p);
}
