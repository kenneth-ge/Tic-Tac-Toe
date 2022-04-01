function dummyWinner(board){
    return board[0][0]
}

//spit out a symbol?

function checkWinner(board){
    for(let i = 0; i< board.length - 3; i++){
        for(let j =0; j<board[i].length; j++){
            let x = i;
            let y = j;
            let position = board[x][y];
            if(position == -1)
                continue
            
            if(position == board[x+1][y] && position == board[x+2][y] && position == board[x+3][y]){
                return position;
            }
        }
    }
    for(let j = 0; j< board.length; j++){
        for(let i =0; i<board[j].length - 3; i++){
            let x = i;
            let y = j;
            let position = board[x][y];
            if(position == -1)
                continue
            
            if(position == board[x][y+1] && position == board[x][y+2] && position == board[x][y+3]){
                return position;
            }
        }
    }
    //do diagonals later
    return -1
}

module.exports = {
    dummyWinner,
    checkWinner
}