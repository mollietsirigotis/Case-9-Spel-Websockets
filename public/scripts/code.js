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
authenticated = false;

// Skicka knappen är inaktiv från start
sendButton.disabled = true;
sendButton.classList.add("disabled");

// Händelselyssnare

// När användaren anger sitt namn och strartar chatten
formUsername.addEventListener("submit", (e) => {
  e.preventDefault();

  // Spara användarnamnet lokalt
  username = usernameElement.value.trim();

  // Endpoint för inloggning
  const endpoint = "http://localhost:8555/login";

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username }),
  };

  fetch(endpoint, options)
    .then((res) => res.json())
    .then((data) => {
      console.log("data", data);

      if (data.authenticated === true) {
        authenticated = true;
        username = data.username;

        // Lås input så namnet inte ändras mitt i chatten
        usernameElement.setAttribute("disabled", true);

        usernameElement.value = "";

        startPage.classList.add("hidden");
        gamePage.classList.remove("hidden");

        // Gör så att meddelandeinputfältet är i fokus så fort man li autentiserad
        msgElement.focus();
      } else {
        // Ge meddelande till klienten om att autentiseringen inte gick igenom
      }
    });
});

// Lyssnar på input i meddelandefältet
msgElement.addEventListener("input", () => {
  if (msgElement.value.trim() === "") {
    sendButton.disabled = true;
    sendButton.classList.add("disabled");
  } else {
    sendButton.disabled = false;
    sendButton.classList.remove("disabled");
  }
});

// När användaren skickar ett chattmeddelande
formMessage.addEventListener("submit", (e) => {
  e.preventDefault();

  // Endast autentiserade ska kunna chatta

  // Hämtar texten som skrivits i inputfältet
  const msg = msgElement.value.trim();
  if (msg === "") return;

  // Skapar ett obj som innehåller både: meddelandet och vem som skickade det
  const obj = { type: "text", msg: msg, username: username };

  renderMessage(obj);

  // Skickar meddelandet till servern via Websocket
  websocket.send(JSON.stringify(obj));

  // Rensar input fältet efter meddelandet har skickats
  msgElement.value = "";

  sendButton.disabled = true;
  sendButton.classList.add("disabled");
});

// Lyssnar på tangenttryck i meddelandeinput
msgElement.addEventListener("keydown", (e) => {
  console.log("is typing", e.key);
});

// Websocket-lyssnare
// Tar emot data från servern i realtid

websocket.addEventListener("message", (e) => {
  const data = e.data;

  // Data tas emot som text och parsas till objekt
  const obj = JSON.parse(e.data);
  console.log("obj", obj);

  // Ta höjd för att meddelande via websocket kan ha olika type. typ text eller annat
  // Om det är av type === "text" används metoden renderMessage

  // Renderar meddelandet i chatten
  switch (obj.type) {
    case "text":
      renderMessage(obj);
      break;

      case "new_client":
            console.log("Uppdatera något på klientsidan", obj.usersOnline);
      break;

      case "new_user":
        

      break;
  }
});

// Funktioner

/**
 *
 *
 * @param {Object} obj
 */
function renderMessage(obj) {
  let div = document.createElement("div");
  const p = document.createElement("p");

  if (obj.username !== username) {
    div.classList.add("textMessage", "other");
  } else {
    div.classList.add("textMessage");
  }

  // Meddelandet
  p.textContent = obj.msg;
  p.classList.add("text");
  div.appendChild(p);

  // Username
  const divUsername = document.createElement("div");
  divUsername.textContent = obj.username;
  divUsername.classList.add("username");

  div.appendChild(divUsername);

  chatElement.appendChild(div);
}
