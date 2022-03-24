let gameStart = false
let isReady = false
let readyDraw = false

function ready(){
  isReady = true

  addPlayer(yourPlayerNumber, true)

  socket.send(JSON.stringify({
    type: 1,
    ready: true
  }));
}

let height = window.innerHeight;
let width = window.innerWidth * 8 / 10;

let addWidth = window.innerWidth * 2 / 10
var yourPlayerNumber = -1
var currPlayer = -1
//var name = prompt("Enter your name")
//no piece -> 0
//player 1 -> 1
//player 2 -> 2
//etc. 


let socket = new WebSocket("ws://localhost:7071/ws");

socket.onopen = function (e) {
  // alert("[open] Connection established");
  // alert("Sending to server");
};

let lengthN = -1 //num rows
let lengthM = -1 //num columns
var board = [[0, 0], [0, 0]]
socket.onmessage = function (event) {
  data = JSON.parse(event.data)

  console.log(JSON.stringify(data))

  const type  = data.type;

  switch(type){
    case 0:
      currPlayer = data.currentPlayer

      if (yourPlayerNumber == -1) {
        yourPlayerNumber = data.yourPlayerNumber
    
        board = data.board
        lengthN = data.lengthN
        lengthM = data.lengthM
    
        if(readyDraw)
          drawValues()

        for(var x of data.players){
          addPlayer(x.playerNum, x.ready)
        }
    
        //alert("you are player " + yourPlayerNumber)
      } else {
       // alert(JSON.stringify(data))
    
        squareX = data.squareX
        squareY = data.squareY
        playerWhoJustWent = data.playerWhoJustWent
    
        board[squareY][squareX] = playerWhoJustWent
      }
    break;

    case 1:
        if(data.allReady){
          gameStart = true;
        }
        if(!(data.playerNum === undefined) && data.playerNum != yourPlayerNumber){
          addPlayer(data.playerNum, data.ready)
        }
    break;
  }
}

socket.onerror = function (error) {
  alert(`[error] ${error.message}`);
};

printBoard();
function setup() {
  readyDraw = true
  createCanvas(width, height);

  if(lengthN != -1){
    drawValues()
  }
}

function draw() {
  background(220)
  stroke(2)
  for (let i = 1; i < lengthN; i++) {
    //draw horizontal lines
    line(0, i * height / (lengthN), width, i * height / (lengthN))
  }
  for (let i = 1; i < lengthM; i++) {
    //draw vertical lines
    line(i * width / (lengthM), 0, i * width / (lengthM), height)
  }
  drawValues()
}

let serverapproval = false;

function mouseClicked() {
  if(!gameStart)
    return;
  if (mouseX > 0) {
    if (currPlayer == yourPlayerNumber) {
      squareX = int((mouseX) / (width / lengthM))
      squareY = int(mouseY / (height / lengthN))
      console.log(squareX, squareY)
      if (board[squareY][squareX] == -1) {
        socket.send(JSON.stringify({
          type: 0,
          squareX,
          squareY
        }));
      }

      printBoard();
    }
  }


}

let vals = ['X', 'O', 'Δ', '▢', '✂', '📪']
let fontSize = 50

function drawValues() {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      textSize(fontSize);
      text(vals[board[i][j]], (j + 1 / 2) * (width / lengthM) - fontSize / 2, (i + 1 / 2) * (height / lengthN))
    }
  }
}

function printBoard() {
  let string = ""
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      string += board[i][j]
      string += " "
    }
    string += "\n"
  }
  console.log(string)
}

function addPlayer(playerNum, isReady){
  let existing = document.getElementById(`p${playerNum}`)
  if(existing){
    existing.innerHTML = `<div class="playerHeader">
        <h4> ${playerNum + 1}</h4>
    </div>
    <div class="symbolHeader">
        <h4>${vals[playerNum]}</h4>
    </div>
    <div class="readyHeader">
    ${isReady ? '<h4 style="color:green">✔</h4>' : '<h4 style="color:red">X</h4>'}
    </div>`
    return
  }

  let newElem = document.createElement("div")
  newElem.className = "main"
  newElem.id = `p${playerNum}`

  let table = document.getElementById("table")

  if(playerNum == yourPlayerNumber){
    newElem.className = "main you"
  }

  newElem.innerHTML = 
  `<div class="playerHeader">
      <h4> ${playerNum + 1}</h4>
  </div>
  <div class="symbolHeader">
      <h4>${vals[playerNum]}</h4>
  </div>
  <div class="readyHeader">
    ${isReady ? '<h4 style="color:green">✔</h4>' : '<h4 style="color:red">X</h4>'}
  </div>`

  table.appendChild(newElem)
}