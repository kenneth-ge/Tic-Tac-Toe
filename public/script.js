let height = window.innerHeight;
let width = window.innerWidth;

let lengthN = 5 //num rows
let lengthM = 7 //num columns
const numPlayers = 6;

let currPlayer = 0

//no piece -> 0
//player 1 -> 1
//player 2 -> 2
//etc. 

let board = new Array(lengthN)

for(let i = 0; i < lengthN; i++){
    board[i] = new Array(lengthM)
    for(let j = 0; j < lengthM; j++){
        board[i][j] = -1
    }
}
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

  function mouseClicked(){
      //check bounds
      //each box: x, x+(width/lengthN)  y, y+(height/lengthM)
      squareX = int(mouseX/(width/lengthM))
      squareY = int(mouseY/(height/lengthN))
      console.log(squareX, squareY)
      if(board[squareY][squareX] == -1){
        board[squareY][squareX] = currPlayer
        currPlayer = currPlayer+1
        currPlayer %= numPlayers
      }

      printBoard()
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