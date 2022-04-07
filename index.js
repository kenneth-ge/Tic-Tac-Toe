let express = require('express');
let path = require('path')
let router = require('./router')
let fs = require('fs')
let WebSocket = require('ws');
let wss = new WebSocket.Server({ port: 7071 });
let util = require('./util');

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
var numReady = 0
let gameStarted = false
let players = []

let lengthN = 5 //num rows
let lengthM = 7 //num columns
let board = new Array(lengthN)

function clearBoard(){
    for(let i = 0; i < lengthN; i++){
        board[i] = new Array(lengthM)
        for(let j = 0; j < lengthM; j++){
            board[i][j] = -1
        }
    }
}
clearBoard()

wss.on('connection', (ws) => {
    if(gameStarted){
        const id = uuidv4();
        const metadata = { id, playerNum: -2 };
    
        clients.set(ws, metadata);

        ws.send(JSON.stringify({
            type: 2,
            yourPlayerNumber: -2,
            currentPlayer: currentPlayer,
            canPlay: false,
            board,
            lengthN, lengthM,
            players
        }))
        return;
    }else{
        const id = uuidv4();
        const playerNum = numPlayers
        const metadata = { id, playerNum };
    
        players.push(metadata)
        clients.set(ws, metadata);
        
        ws.send(JSON.stringify({
            type: 0,
            yourPlayerNumber: numPlayers,
            currentPlayer: currentPlayer,
            board,
            lengthN, lengthM,
            players
        }))

        numPlayers++
    }

    clients.forEach((value, key) => {
        const outbound = JSON.stringify({
            type: 1,
            playerNum: numPlayers - 1,
            numPlayers
        });
        key.send(outbound);
    });

    ws.on('message', (messageAsString) => {
        const message = JSON.parse(messageAsString);
        const metadata = clients.get(ws);
        
        message.sender = metadata.id;
        message.playerNum = metadata.playerNum;

        if(message.type === undefined){
            return;
        }

        switch(message.type){
            case 0: //move
                if(!gameStarted){
                    console.log("Game not yet started")
                    return;
                }

                if(message.squareX === undefined || message.squareY === undefined){
                    console.log("Missing squareX and squareY")
                    return;
                }
        
                if(message.playerNum != currentPlayer){
                    console.log("Not your turn", currentPlayer, "'s turn")
                    console.log("Your player number is", message.playerNum)
                    return;
                }
                
                board[message.squareY][message.squareX] = message.playerNum
                
                message.playerWhoJustWent = currentPlayer
        
                currentPlayer++
                currentPlayer %= numPlayers
        
                message.currentPlayer = currentPlayer
                message.type = 0
        
                clients.forEach((value, key) => {
                    message.yourPlayerNumber = value.playerNum
                    const outbound = JSON.stringify(message);
                    key.send(outbound);
                });

                //check if someone won
                let winner = util.checkWinner(board)
                if(winner != -1){
                    clearBoard()
                    gameStarted = false
                    numReady = 0
                    currentPlayer = 0

                    clients.forEach((value, key) => {
                        value.ready = false
                    })

                    clients.forEach((value, key) => {
                        let message = {
                            type: 3,
                            winner
                        }
                        const outbound = JSON.stringify(message);
                        key.send(outbound);
                    })
                }
                break;
            case 1: //ready
                message.type = 1
                
                if(metadata.ready){
                    console.log('already ready')
                    return;
                }
                
                clients.get(ws).ready = true

                numReady++

                if(numReady == numPlayers){
                    message.allReady = true
                    gameStarted = true
                }
                message.numPlayers = numPlayers
                clients.forEach((value, key) => {
                    const outbound = JSON.stringify(message);
                    key.send(outbound);
                })
                break;
            case 2: //name
                message.type = 2

                clients.forEach((value, key) => {
                    const outbound = JSON.stringify(message);
                    key.send(outbound);
                })
                break;
        }
    })

    ws.on("close", () => {
        clients.delete(ws);
    });
})

app.listen(8080)