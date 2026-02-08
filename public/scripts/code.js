// Hämtar DOM element
const formUsername = document.querySelector("#formUsername");
const formMessage = document.querySelector("#formMessage");
const msgElement = document.getElementById("msg");
const chatElement = document.getElementById("chat");
const usernameElement = document.querySelector("#username");
const gamePage = document.querySelector("#gamePage");
const startPage = document.querySelector("#startPage");
const sendButton = document.querySelector("#sendButton");
const onlineUsersElement = chatElement.querySelector("code");
const leaveGameButton = document.querySelector("#leaveGame");

// Websocket-anslutning till servern

const websocket = new WebSocket("ws://localhost:8555");

let username;
authenticated = false;

let myPlayerId = null;
const remotePlayers = new Map();

// Skicka knappen är inaktiv från start
sendButton.disabled = true;
sendButton.classList.add("disabled");

// Händelselyssnare

// När användaren anger sitt namn och strartar chatten
formUsername.addEventListener("submit", async (e) => {
  e.preventDefault();

  username = usernameElement.value.trim();

  if (!username) {
    alert("Please enter a username!");
    return;
  }

  try {
    // Hämtar player ID från servern
    const res = await fetch("http://localhost:8555/api/player-id");
    const data = await res.json();
    myPlayerId = data.id;

    console.log("Got player ID:", myPlayerId);

    // Visar spelet
    authenticated = true;
    usernameElement.setAttribute("disabled", true);
    usernameElement.value = "";
    startPage.classList.add("hidden");
    gamePage.classList.remove("hidden");
    msgElement.focus();

    // Skickar till servern via WebSocket
    const obj = {
      type: "new_user",
      username: username,
      playerId: myPlayerId,
    };
    websocket.send(JSON.stringify(obj));

    // Sparar för index.js
    window.myPlayerData = {
      playerId: myPlayerId,
      username: username,
    };

    console.log("Player initialized:", window.myPlayerData);
  } catch (error) {
    console.error("Error:", error);
    alert("Could not connect to server!");
  }
});

// Leave game-knapp
leaveGameButton.addEventListener("click", () => {
  console.log("Leaving game...");

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.close();
  }

  startPage.classList.remove("hidden");
  gamePage.classList.add("hidden");
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

  // Aktuell tid
  const date = new Date();
  obj.date = date;

  // Renderas direkt när man är inloggad
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

  // Renderar meddelandet i chatten
  switch (obj.type) {
    case "text":
      renderMessage(obj);
      break;

    case "new_client":
      console.log("Uppdatera något på klientsidan", obj.usersOnline);
      break;

    case "new_user":
      console.log(
        "Player joined:",
        obj.username,
        "PlayerId:",
        obj.playerId,
        "Sprite:",
        obj.catSprite,
      );

      // Uppdatera online-listan
      onlineUsersElement.textContent = obj.usersOnline;

      // Om det är den nya spelaren som har joinat, skapa en RemotePlayer-instans för den
      if (obj.playerId === myPlayerId && window.player) {
        window.player.image.src = `./img/${obj.catSprite}`;
      }
      // Skapa en RemotePlayer-instans för andra spelare
      if (obj.playerId && obj.playerId !== myPlayerId) {
        const remotePlayer = new RemotePlayer({
          playerId: obj.playerId,
          username: obj.username,
          x: 100 + Math.random() * 200,
          y: 50 + Math.random() * 200,
          direction: "down",
          catSprite: obj.catSprite,
        });

        remotePlayers.set(obj.playerId, remotePlayer);
        console.log(
          "Created RemotePlayer for:",
          obj.username,
          "Total:",
          remotePlayers.size,
        );
      }
      break;

    case "user_left":
      onlineUsersElement.textContent = obj.usersOnline;

      if (obj.playerId && remotePlayers.has(obj.playerId)) {
        remotePlayers.delete(obj.playerId);
        console.log("Removed RemotePlayer:", obj.playerId);
      }
      break;

    case "playerMove":
      if (obj.playerId !== myPlayerId) {
        const remotePlayer = remotePlayers.get(obj.playerId);
        if (remotePlayer) {
          remotePlayer.updatePosition(obj.x, obj.y, obj.direction);
        }
      }
      break;
  }
});

// Funktioner

/**
 *
 *
 * @param {Object} obj
 * @param {Date} obj.date
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

  // Aktuell tid
  const time = document.createElement("time");

  //Skapa ett datumobjekt för att kunna välja ut en viss del
  const date = new Date(obj.date);

  // Visa tid som hh:m
  time.textContent = date.toLocaleTimeString();
  time.dateTime = date.toLocaleTimeString();
  div.appendChild(time);

  chatElement.appendChild(div);
}
window.remotePlayers = remotePlayers;
window.websocket = websocket;
