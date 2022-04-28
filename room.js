let util = require('./util')
let uuid = require('uuid')

function Room(){
    let clients = new Map(),
        numPlayers = 0,
        currentPlayer = 0,
        numReady = 0,
        gameStarted = false,
        players = [],
        lengthN = 5, //num rows
        lengthM = 7, //num columns
        inARow = 4,
        lastActive = Date.now()

    board = new Array(lengthN)

    function clearBoard(){
        for(let i = 0; i < lengthN; i++){
            board[i] = new Array(lengthM)
            for(let j = 0; j < lengthM; j++){
                board[i][j] = -1
            }
        }
    }

    clearBoard()

    function shufflePlayers(){
        var newPlayerNums = new Array(players.length)
        newPlayerNums.fill(-1)

        for(var i = 0; i < players.length; i++){
            while(true){
                var spot = Math.floor(Math.random() * players.length)

                if(newPlayerNums[spot] == -1){
                    newPlayerNums[spot] = i
                    players[spot].playerNum = i
                    break
                }
            }
        }

        players.sort((a, b) => (a.playerNum > b.playerNum) ? 1 : -1)

        clients.forEach((value, key) => {
            value.playerNum = newPlayerNums[value.playerNum]
        })

        clients.forEach((value, key) => {
            let message = {
                type: 5,
                playerNum: value.playerNum,
                players
            }
            const outbound = JSON.stringify(message);
            key.send(outbound);
        })
    }

    function createClient(ws){
        if(gameStarted || numPlayers >= 10){ //create spectator
            const id = uuid.v4();
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
            const id = uuid.v4();
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
    }

    function selectBoardSize(){
        const minLen = 4
        const maxLen = 5

        lengthN = Math.ceil(5 * Math.pow(1.3, numPlayers / 2))
        lengthM = Math.ceil(7 * Math.pow(1.3, numPlayers / 2))

        if(lengthN > 8){
            inARow = maxLen
        }else{
            inARow = minLen
        }

        if(numPlayers == 2){
            inARow = 5
        }else if(numPlayers <= 4){
            inARow = 4
        }else{
            inARow = 3
        }

        board = new Array(lengthN)
        clearBoard()
    }

    function addClient(ws){
        createClient(ws)
    
        ws.on('message', (messageAsString) => {
            const message = JSON.parse(messageAsString);
            const metadata = clients.get(ws);
            
            message.sender = metadata.id;
            message.playerNum = metadata.playerNum;
    
            if(message.type === undefined || message.playerNum == -2){
                return;
            }

            lastActive = Date.now()
    
            switch(message.type){
                case 0: //move
                    if(!gameStarted){
                        //console.log("Game not yet started")
                        return;
                    }
    
                    if(message.squareX === undefined || message.squareY === undefined){
                        //console.log("Missing squareX and squareY")
                        return;
                    }
            
                    if(message.playerNum != currentPlayer){
                        //console.log("Not your turn", currentPlayer, "'s turn")
                        //console.log("Your player number is", message.playerNum)
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
                    let winner = util.checkWinner(board, inARow)
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

                        shufflePlayers()
                    }
                    break;
                case 1: //ready
                    message.type = 1
                    
                    if(metadata.ready){
                        return;
                    }
                    
                    clients.get(ws).ready = true
    
                    numReady++
    
                    if(numReady == numPlayers){
                        message.allReady = true
                        gameStarted = true

                        selectBoardSize()
                        message.board = board
                        message.lengthN = lengthN
                        message.lengthM = lengthM
                        message.inARow = inARow
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
            const metadata = clients.get(ws);
            let playerNum = metadata.playerNum;

            if(playerNum >= 0){ //if not spectator, then we have to stop the game and restart
                clearBoard()
                gameStarted = false
                numReady = 0
                currentPlayer = 0
                numPlayers--;

                clients.forEach((value, key) => {
                    value.ready = false
                    if(value.playerNum >= playerNum){
                        value.playerNum--;
                    }
                })

                players.splice(playerNum, 1)

                clients.forEach((value, key) => {
                    let message = {
                        type: 4,
                        playerNum,
                        players
                    }
                    const outbound = JSON.stringify(message);
                    key.send(outbound);
                })
            }

            clients.delete(ws);
        });
    }

    function inactive(){
        let timeSinceActive  = Date.now() - lastActive

        if(timeSinceActive > 2 * 60 * 60 * 1000) { //if 2 hours of inactivity
            clients.forEach((value, key) => {
                console.log('closing socket')
                clients.delete(key);
                key.close()
            })
            return true
        }

        return false
    }

    return {
        addClient,
        inactive
    }
}

module.exports = {
    Room
}