 let express = require('express');
let path = require('path')
let router = require('./router')
let fs = require('fs')
let WebSocket = require('ws');
let wss = new WebSocket.Server({ port: 7071 });

let clients = new Map();

const app = express();

const middleware = [
    express.static('public')
];

app.use(middleware)
express.static('public')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/', router)

//Failsafe for unauthorized pages
app.use((req, res, next) => {
    res.status(404).render("error", {
        code: "404",
        reason: "Page Not Found",
        description: "The page you are looking for does not exist."
    })
})

let uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

var numPlayers = 0
var currentPlayer = 0

let lengthN = 5 //num rows
let lengthM = 7 //num columns
let board = new Array(lengthN)

for(let i = 0; i < lengthN; i++){
    board[i] = new Array(lengthM)
    for(let j = 0; j < lengthM; j++){
        board[i][j] = -1
    }
}

wss.on('connection', (ws) => {
    const id = uuidv4();
    const playerNum = numPlayers
    const metadata = { id, playerNum };

    clients.set(ws, metadata);

    ws.send(JSON.stringify({
        yourPlayerNumber: numPlayers,
        currentPlayer: currentPlayer,
        board,
        lengthN, lengthM
    }))

    numPlayers++

    ws.on('message', (messageAsString) => {
        const message = JSON.parse(messageAsString);
        const metadata = clients.get(ws);
  
        message.sender = metadata.id;
        message.playerNum = metadata.playerNum;

        if(!message.squareX || !message.squareY){
            console.log("Missing squareX and squareY")
            return
        }

        console.log(message)

        if(message.playerNum != currentPlayer){
            console.log("Not your turn")
            return;
        }

        board[message.squareY][message.squareX] = message.playerNum

        message.playerWhoJustWent = currentPlayer

        currentPlayer++
        currentPlayer %= numPlayers

        console.log(numPlayers)

        message.currentPlayer = currentPlayer

        clients.forEach((value, key) => {
            message.yourPlayerNumber = value.playerNum
            console.log("Send to player " + message.yourPlayerNumber)
            const outbound = JSON.stringify(message);
            key.send(outbound);
        });
    })

    ws.on("close", () => {
        clients.delete(ws);
      });
})

app.listen(8080)