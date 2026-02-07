import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { nanoid } from "nanoid";

const app = express();
const PORT = 8555;

// Max 4 spelare
const MAX_PLAYERS = 4;

// Tillgängliga katter
const availableCatSprites = [
  "black-cat-Sheet.png",
  "orange-cat-Sheet.png",
  "white-cat-Sheet.png",
  "tabby-cat-Sheet.png",
];

// Skickar statiska filer
app.use(express.static("public"));

// Skapar en http server
const server = http.createServer(app);

// Skapar en websocket server
const wss = new WebSocketServer({ noServer: true });

// API för att ge spelare ett ID
app.get("/api/player-id", (req, res) => {
  res.json({ id: nanoid() });
});

// Hanterar Websocket-handskakning
// Bestämmer vilka som får ansluta
server.on("upgrade", (req, socket, head) => {
  console.log("event upgrade");

  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log("Client:", req.headers["user-agent"]);

    // Skickar vidare anslutningen till connection-event
    wss.emit("connection", ws, req);
  });
});

// Array with authenticated users (my pets)
// let users = ["Bobo", "Sivert", "Bella"];

// eventuellt hålla koll på vilka som är online
let usersOnline = [];

// Se till att uppdatera usersOnline när någon ansluter eller lämnar

// Middleware
// --------------------------------------------------------------
// Middleware för att parsa JSON i request body
app.use(express.json());

// Routes
// -----------------------------------------------------------------

// När en ny klient ansluter via WebSocket
wss.on("connection", (ws) => {
  console.log(`Client connected, number of clients: ${wss.clients.size}`);

  // Skicka meddelande till den nya klienten
  // Skicka och ta emot data förutsatt att det är i JSON format

  //Skicka meddelande till alla klienter om att en ny användare är ansluten
  const obj = {
    type: "new_client",
    msg: "New player joined!",
    usersOnline: usersOnline,
  };
  broadcast(wss, obj);

  // När en klient lämnar chatten
  ws.on("close", () => {
    // Uppdatera usersOnline, skicka aktuell lista till alla klienter

    console.log(`Client left, number of clients: ${wss.clients.size}`);

    // Ev skicka info till alla klienter om att någon lämnat

    // Ta bort ett element ur en array
    usersOnline = usersOnline.filter((u) => u !== ws.username);
    const obj = {
      type: "user_left",
      username: ws.username,
      usersOnline: usersOnline,
    };

    broadcastExclude(wss, ws, obj);
  });

  // När servern tar emot ett meddelande från en klient
  ws.on("message", (data) => {
    // Parsar JSON-data till objekt
    const obj = JSON.parse(data);

    console.log(obj);

    // Om behov finns, kontrollera obj.type för att avgöra vad det är för typ av meddelande

    switch (obj.type) {
      case "text":
        // För att visa aktuell tid för ett textmeddelande kan man lägga till
        // egenskapen på serversidan
        // då kommer tidszoner kunna implementeras
        // 1. Skapa en tidsstämpel
        const date = new Date();

        // 2. Lägg till som en ny egenskap till obj
        obj.date = date;

        broadcastExclude(wss, ws, obj);
        break;

      case "new_user":
        // Ge spelaren nästa tillgängliga sprite
        const spriteIndex = usersOnline.length;
        const catSprite = availableCatSprites[spriteIndex];

        // Skicka info om befintliga spelare till den nya spelaren
        wss.clients.forEach((client) => {
          if (client !== ws && client.playerId) {
            ws.send(
              JSON.stringify({
                type: "new_user",
                username: client.username,
                playerId: client.playerId,
                catSprite: client.catSprite,
                x: client.x || 100,
                y: client.y || 50,
                direction: client.direction || "down",
                usersOnline: usersOnline,
              }),
            );
          }
        });

        // Uppdatera listan usersOnline med användaren
        usersOnline.push(obj.username);
        obj.usersOnline = usersOnline;

        // En variant som funkar i javaScript
        // Lägg till en egenskap till det objekt som nu har koll på klientkoppling

        // Spara på websocket-objektet
        ws.username = obj.username;
        ws.playerId = obj.playerId;
        ws.catSprite = catSprite;

        // broadcastExclude(wss, ws, obj);
        // Skicka till alla spelare att en ny spelare har joinat
        broadcast(wss, {
          type: "new_user",
          username: obj.username,
          playerId: obj.playerId,
          catSprite: catSprite,
          usersOnline: usersOnline,
        });
        break;
      case "playerMove":
        // Spara spelarens position på servern
        ws.x = obj.x;
        ws.y = obj.y;
        ws.direction = obj.direction;

        // Skicka vidare till alla andra klienter att en spelare har rört sig
        broadcastExclude(wss, ws, {
          type: "playerMove",
          playerId: obj.playerId,
          x: obj.x,
          y: obj.y,
          direction: obj.direction,
          username: ws.username,
        });
        break;
    }
  });
});

// Funktion för att broadcasta till alla eller vissa
/**
 *
 *
 * @param {WebSocketServer} wss
 * @param {object} obj
 */
function broadcast(wss, obj) {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(obj));
  });
}

// Funktion som exkluderar en klient
/**
 *
 *
 * @param {WebSocketServer} wss
 * @param {WebSocket} ws
 * @param {object} obj
 */
function broadcastExclude(wss, ws, obj) {
  wss.clients.forEach((client) => {
    if (client !== ws) {
      client.send(JSON.stringify(obj));
    }
  });
}

// Startar servern
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
