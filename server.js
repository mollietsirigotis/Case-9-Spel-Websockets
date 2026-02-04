import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { nanoid } from "nanoid";

const app = express();
const PORT = 8555;

// Skickar statiska filer
app.use(express.static("public"));

// Skapar en http server
const server = http.createServer(app);

// Skapar en websocket server
const wss = new WebSocketServer({ noServer: true });

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

let users = ["Bobo", "Sivert"];

// eventuellt hålla koll på vilka som är online
let usersOnline = [];

// Se till att uppdatera usersOnline när någon ansluter eller lämnar



// Middleware
// -----------------------------------------------------------------
// Middleware för att parsa JSON i request body
app.use(express.json());


// Routes
// -----------------------------------------------------------------

app.post('/login', (req, res) => {

    console.log("A Post request", req.body);

    let username = req.body.username;
    console.log("Username:", username);

    
    if (users.includes(username)) {
        console.log("User exists");

        // Se till att aktuellt username tas bort från arrayen users
        // Kolla att ett namn matchar öven om man glömmer inledande versal
        users = users.filter((u) => u !== username);

        console.log("Användare som finns kvar:", users);

        // Bekräfta att användarnamnet är ok
        // Skicka ett objekt

        res.send({authenticated: true, username: username });

        // Uppdatera listan med usersOnline
        usersOnline.push(username);
    }
    else {
        res.send({ authenticated: false });
    }
}   
);

// När en ny klient ansluter via WebSocket
wss.on('connection', (ws) => { 


    console.log(`Client connected, number of clients: ${wss.clients.size}`);

    // Skicka meddelande till den nya klienten
    // Skicka och ta emot data förutsatt att det är i JSON format

    //Skicka meddelande till alla klienter om att en ny användare är ansluten
    const obj = { type: "new_client", msg:"New player joined!", usersOnline: usersOnline };
    broadcast(wss, obj);

    
    // När en klient lämnar chatten
    ws.on('close', () => {

        // Uppdatera usersOnline, skicka aktuell lista till alla klienter

        console.log(`Client left, number of clients: ${wss.clients.size}`);

        // Ev skicka info till alla klienter om att någon lämnat
    });

    // När servern tar emot ett meddelande från en klient
    ws.on('message', (data) => {

        // Parsar JSON-data till objekt
        const obj = JSON.parse(data);

        console.log(obj);

        // Om behov finns, kontrollera obj.type för att avgöra vad det är för typ av meddelande

        switch (obj.type) {
            case "text":
                broadcastExclude(wss, ws, obj);
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
    wss.clients.forEach(client => {
    
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
    wss.clients.forEach(client => {
        if (client !== ws) {
            client.send(JSON.stringify(obj))
        }
    } )
}

// Startar servern
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
