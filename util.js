function dummyWinner(board){
    return board[0][0]
}

//spit out a symbol?

function get(board, row, column){
    if(row < 0 || column < 0 || row >= board.length || column >= board[row].length)
        return -1;
    
    return board[row][column];
}

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
    /*for(let i =0;i<get(board,).length;i++){
        for(let j=0;j<board[i].length;j++){
            let row = i;
            let col = j;
            let position = get(board, row, col);
            if (position == -1){
                continue
            }
            if (position == board[row+1][col+1] && position == board[row+2][col+2] && position == board[row+3][col+3]){
                return position;
            }
            if (position == board[row-1][col+1] && position == board[row-2][col+2] && position == board[row-3][col+3]){
                return position;
            }
        }
    }*/
    return -1
}

module.exports = {
    dummyWinner,
    checkWinner
}