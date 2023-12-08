const gameUtils = require("./utils")

class tictactoe {
    constructor() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.turn = gameUtils.shufflePlayers();
        this.winner = null;
        this.nameSocketMap = gameUtils.buildNameSocketMap(players);
        this.nameIndexMap = gameUtils.buildNameIndexMap(players);
        this.players = gameUtils.buildPlayers(players);
        this.gameSocket = gameSocket;
        this.namespace = namespace;   
    }

    resetGame() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.turn = gameUtils.shufflePlayers();
        this.winner = null;
    }

    checkWin() {
        let winner = null;
        let board = this.board;
        let turn = this.turn;
        let boardFull = true;
        let tie = false;
        let win = false;
        let winCondition = [
            [board[0][0], board[0][1], board[0][2]],
            [board[1][0], board[1][1], board[1][2]],
            [board[2][0], board[2][1], board[2][2]],
            [board[0][0], board[1][0], board[2][0]],
            [board[0][1], board[1][1], board[2][1]],
            [board[0][2], board[1][2], board[2][2]],
            [board[0][0], board[1][1], board[2][2]],
            [board[0][2], board[1][1], board[2][0]]
        ];

        winCondition.map(x => {
            if (x[0] !== null && x[0] === x[1] && x[1] === x[2]) {
                win = true;
                winner = x[0];
            }
        })

        board.map(x => {
            x.map(y => {
                if (y === null) {
                    boardFull = false;
                }
            })
        })

        if (win) {
            this.winner = winner;
            this.gameSocket.emit('g-win', winner);
        } else if (boardFull) {
            this.gameSocket.emit('g-tie');
        }
    }

    listen() {
        this.players.map(x => {
            const socket = this.gameSocket.sockets[x.socketID];
            let bind = this
            socket.on('g-select', (data) => {
                if (bind.turn === x.player) {
                    if (bind.board[data.row][data.col] === null) {
                        bind.board[data.row][data.col] = x.player;
                        bind.gameSocket.emit('g-select', data);
                        bind.checkWin();
                        bind.turn = bind.players[bind.nameIndexMap[bind.turn]].player;
                    }
                }
            })
        
            socket.on('g-reset', () => {
                bind.resetGame();
                bind.gameSocket.emit('g-reset');
            })

            socket.on('checkWin', () => {
                bind.checkWin();
            })
        })
    }

    playTurn() {
        this.gameSocket.emit("g-updateCurrentPlayer", this.players[this.currentPlayer].name);
        console.log(this.players[this.currentPlayer].socketID)
        this.gameSocket.to(this.players[this.currentPlayer].socketID).emit('g-chooseAction');
    }

    start() {
        this.resetGame();
        this.listen();
        console.log('Game has started');
        this.playTurn()
    }
}


module.exports = tictactoe;