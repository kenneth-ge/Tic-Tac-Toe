let height = window.innerHeight;
let width = window.innerWidth;

var yourPlayerNumber = -1
var currPlayer = -1

//no piece -> 0
//player 1 -> 1
//player 2 -> 2
//etc. 


let socket = new WebSocket("ws://localhost:7071/ws");

socket.onopen = function(e) {
  alert("[open] Connection established");
  alert("Sending to server");
};

let lengthN = -1 //num rows
let lengthM = -1 //num columns
var board = [[0, 0], [0, 0]]
socket.onmessage = function(event) {
  data = JSON.parse(event.data)

  if(yourPlayerNumber == -1){
    yourPlayerNumber = data.yourPlayerNumber

    board = data.board
    lengthN = data.lengthN
    lengthM = data.lengthM

    drawValues()

    alert(yourPlayerNumber)
  }else{
    alert(data)

    currPlayer = data.currentPlayer
    squareX = data.squareX
    squareY = data.squareY
    playerWhoJustWent = data.playerWhoJustWent

    if(!squareX || !squareY || !playerWhoJustWent)
      return;

    board[squareY][squareX] = playerWhoJustWent
  }
};

socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};

printBoard();
function setup() {
    createCanvas(width, height);
  }
  
  function draw() {
    background(220)
    stroke(2)
    for (let i = 1; i < lengthN; i++){
      //draw horizontal lines
      line(0, i*height/(lengthN), width, i*height/(lengthN))
    }
    for(let i = 1; i < lengthM; i++){
      //draw vertical lines
      line(i*width/(lengthM), 0, i*width/(lengthM), height)
    }
    drawValues()
  }

  let serverapproval = false;

  function mouseClicked(){
      //check bounds
      //each box: x, x+(width/lengthN)  y, y+(height/lengthM)
      if(currPlayer == yourPlayerNumber){
        squareX = int(mouseX/(width/lengthM))
        squareY = int(mouseY/(height/lengthN))
        console.log(squareX, squareY)
        if(board[squareY][squareX] == -1){
          board[squareY][squareX] = currPlayer
          socket.send(JSON.stringify({
            squareX,
            squareY
          }));
        }
  
        printBoard();
      }


  }

let vals = ['X', 'O', 'Δ', '▢', '✂', '📪']
let fontSize = 50

  function drawValues() {
      for (let i = 0; i < board.length; i ++){
          for (let j = 0; j < board[i].length; j ++){
              textSize(fontSize);
            text(vals[board[i][j]], (j + 1/2)*(width/lengthM) - fontSize / 2, (i + 1/2)*(height/lengthN))
          }
      }
  }


  function printBoard(){
    let string = ""
    for(let i = 0; i<board.length; i++){
        for(let j = 0; j<board[i].length; j++){
            string += board[i][j]
            string += " "
        }
        string += "\n"
    }
    console.log(string)
  }