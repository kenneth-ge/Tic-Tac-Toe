let randomWords = require('random-words');

let get = (board, row, column) => {
    if(row < 0 || column < 0 || row >= board.length || column >= board[row].length)
        return -1;
    
    return board[row][column];
}

let checkWinner = (board, inarow) => {
    for(let r = 0; r < board.length; r++){
        for(let c = 0; c < board[r].length; c++){
            let symbol = board[r][c];
            if(symbol == -1)
                continue
            
            let vertical = true, horizontal = true, diagonalClockwise = true, diagonalCounter = true
            for(let k = 0; k < inarow; k++){
                //vertical
                vertical &= get(board, r + k, c) == symbol
                horizontal &= get(board, r, c + k) == symbol
                diagonalClockwise &= get(board, r + k, c + k) == symbol
                diagonalCounter &= get(board, r + k, c - k) == symbol
            }

            if(vertical || horizontal || diagonalClockwise || diagonalCounter)
                return symbol;
        }
    }
    return -1
}

let generateRoom = () => {
    return randomWords()
}

module.exports = {
    checkWinner,
    generateRoom
}