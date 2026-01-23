// Hämtar DOM element
const formMessage = document.querySelector('#formMessage');
const msgElement = document.getElementById('msg');
const chatElement = document.getElementById('chat');



// Websocket-anslutning till servern

const websocket = new WebSocket("ws://localhost:8555");


// Händelselyssnare


// När användaren skickar ett chattmeddelande
formMessage.addEventListener("submit", (e) => {
    e.preventDefault();

    // Hämtar texten som skrivits i inputfältet
    const msg = msgElement.value;

    // Skapar ett obj som innehåller meddelandet
    const obj = {msg: msg};
   

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
    renderMessage(obj)

});



// Funktioner

function renderMessage(obj) {


    // chatElement.innerHTML += `<p>${obj.msg}</p>`;

    const p = document.createElement("p");

    // p.textContent = obj.msg;

    // Visar både användarnamn och meddelande
    p.textContent = `${obj.msg}`;

    chatElement.appendChild(p);

}
