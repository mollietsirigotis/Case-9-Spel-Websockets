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

// Middlwware
// -----------------------------------------------------------------
// Middleware för att parsa JSON i request body
app.use(express.json());


// Routes
// -----------------------------------------------------------------

app.post('/login', (req, res) => {

    console.log("A Post request", req.body);

    let username = req.body.username;
    console.log("username: ", username);

}   
);

// När en ny klient ansluter via WebSocket
wss.on('connection', (ws) => { 


    console.log(`Client connected, number of clients: ${wss.clients.size}`);

    // Skicka meddelande till den nya klienten
    // Skicka och ta emot data förutsatt att det är i JSON format
    const obj = { msg:"Welcome to the chat!" };
    ws.send(JSON.stringify(obj));

    
    // När en klient lämnar chatten
    ws.on('close', () => {
        console.log(`Client left, number of clients: ${wss.clients.size}`);
    });

    // När servern tar emot ett meddelande från en klient
    ws.on('message', (data) => {

        // Parsar JSON-data till objekt
        const obj = JSON.parse(data);


        console.log(obj);

        // Skickar meddelandet vidare till alla anslutna klienter
        // wss.clients.forEach(client => {
        //     client.send(JSON.stringify(obj));
        // });

        // broadcast(wss, obj);
        broadcastExclude(wss, ws, obj);

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
