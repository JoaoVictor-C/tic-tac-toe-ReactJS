const express = require('express');
const app = express();

const server = require('http').createServer(app);
const socketio = require('socket.io')

const cors = require('cors');
app.use(cors());
const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

const port = 3000 || process.env.PORT;

const gameUtils = require("./game/utils")

let rooms = {};

const generateRoom = (length = 4) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.get('/createRoom', function (req, res) { 
    let newRoom = '';
    while(newRoom === '' || (newRoom in rooms)) {
        newRoom = generateRoom();
    }
    const newSocket = io.of(`/${newRoom}`);
    openSocket(newSocket, `/${newRoom}`);
    rooms[newRoom] = {
        name: newRoom,
        socket: newSocket
    }
    console.log(`room ${rooms[newRoom].name} has been created`);
    res.json({room: newRoom});
})

app.get('/exists/:room', function (req, res) { //returns bool
    const room = req.params.room;
    res.json({exists: (room in rooms)});
})

openSocket = (gameSocket, room) => {
    let players = []; //includes deleted for index purposes
    let partyMembers = []; //actual members
    let partyLeader = ''
    let started = false;
    let board = null;
    let winner = null;
    let gameOver = null;
    let moves = null;
    let turn = null;
    let playersSymbols = null;
    let firstPlayer = null;
    gameSocket.on('connection', (socket) => {
        console.log('connected: ' + socket.id);
        players.push({player: '', socket_id: socket.id, isReady: false, totalWins: 0, symbol: ''});
        let index = players.length - 1;
        console.log(players[index]);

        const updatePartyList = () => {
            partyMembers = players.map(x => {
                return {name: x.player, socketID: x.socket_id, isReady: x.isReady, totalWins: x.totalWins, symbol: x.symbol}
            }).filter(x => x.name != '')
            console.log(`party members: ${JSON.stringify(partyMembers)}`);
            gameSocket.emit('partyUpdate', partyMembers);
        }

        socket.on('setName', (name) => { //when client joins, it will immediately set its name
            console.log(started)
            if(started) {
                gameSocket.to(players[index].socket_id).emit("joinFailed", 'game_already_started');
                return
            }
            if(!players.map(x => x.player).includes(name)){
                if(partyMembers.length >= 2) {
                    gameSocket.to(players[index].socket_id).emit("joinFailed", 'party_full');
                } else {
                    if(partyMembers.length == 0) {
                        partyLeader = players[index].socket_id;
                        players[index].isReady = true;
                        gameSocket.to(players[index].socket_id).emit("leader");
                        console.log("PARTY LEADER IS: " + partyLeader);
                    }
                    players[index].player = name;
                    console.log(players[index]);
                    updatePartyList();
                    gameSocket.to(players[index].socket_id).emit("joinSuccess", players[index].socket_id);
                }
                
            } else {
                gameSocket.to(players[index].socket_id).emit("joinFailed", 'name_taken');
            }  
        })
        socket.on('setReady', (isReady) => { //when client is ready, they will update this
            console.log(`${players[index].player} is ready`);
            players[index].isReady = isReady;
            updatePartyList();
            gameSocket.to(players[index].socket_id).emit("readyConfirm");
            if(partyMembers.every(x => x.isReady)) {
                gameSocket.to(partyLeader).emit("allReady");
            }
        })

        socket.on('startGameSignal', (players) => {
            started = true;
            gameSocket.emit('startGame');
            start();
        })

        
        socket.on('move', (data) => {
            if (data.player === turn && !gameOver) {
                if (board[data.index] === null) {
                    if (playersSymbols[0].name === data.player) { 
                        board[data.index] = playersSymbols[0].symbol 
                    } else { 
                        board[data.index] = playersSymbols[1].symbol 
                    };
                    moves++;
                    
                    checkWinner();
                    changeTurn();

                    gameSocket.emit('move', {
                        "board": board,
                        "turn": turn,
                        "winner": winner,
                        "gameOver": gameOver,
                        "moves": moves,
                        "players": players
                    });
                }
            }
        });

        socket.on('disconnect', () => {
            gameSocket.emit('gameOver', {
                "board": board,
                "turn": turn,
                "winner": winner,
                "gameOver": gameOver,
                "moves": moves,
                "players": players
            });
        });

        socket.on('reset', () => {
            board = Array(9).fill(null);
            turn = gameUtils.randomPlayer();
            winner = '';
            gameOver = false;
            moves = 0;
            gameSocket.emit('gameStart', {
                "board": board,
                "turn": turn,
                "winner": winner,
                "gameOver": gameOver,
                "moves": moves,
                "players": players
            });
        });

        socket.on('restartGame', () => {
            restart();
        })
    
        const changeTurn = () => {
            if (turn === players[0].player) {
                turn = players[1].player;
            } else {
                turn = players[0].player;
            }
        };
    
        const checkWinner = () => {
            const winningConditions = [
                [0, 1, 2], //horizontal
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6], //vertical
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8], //diagonal
                [2, 4, 6]
            ];
    
            winningConditions.forEach((condition) => {
                if (
                    board[condition[0]] &&
                    board[condition[0]] === board[condition[1]] &&
                    board[condition[1]] === board[condition[2]]
                ) {
                    winner = turn;
                    if (players[0].player === winner) {
                        players[0].totalWins++;
                    } else {
                        players[1].totalWins++;
                    }
                    updatePartyList();
                    gameOver = true;
                    console.log(`${winner} wins!`);
                }
            });
    
            if (!board.includes(null) && !winner) {
                gameOver = true;
                winner = 'Tie';
                console.log('Tie!');
            }
        };
    
        const restart = () => {
            board = Array(9).fill(null);
            winner = '';
            gameOver = false;
            moves = 0;
            if (firstPlayer === players[0].player) {
                turn = players[1].player;
            } else {
                turn = players[0].player;
            }
            players.forEach((x, index) => {
                players[index].symbol = playersSymbols[index].symbol;
            })
            gameSocket.emit('gameStart', {
                "board": board,
                "turn": turn,
                "winner": winner,
                "gameOver": gameOver,
                "moves": moves,
                "players": players
            });
        };
        
    
        const start = () => {
            board = Array(9).fill(null);
            winner = '';
            gameOver = false;
            moves = 0;
            turn = gameUtils.randomPlayer(players.map(x => x.player));
            firstPlayer = turn;
            playersSymbols = gameUtils.buildPlayersSymbols(players);
            players.forEach((x, index) => {
                players[index].symbol = playersSymbols[index].symbol;
            })

            const leader = players.filter(x => x.socket_id === partyLeader)[0].player;
            console.log(leader);
            updatePartyList();
            console.log(partyLeader)
            gameSocket.emit('gameStart', {
                "board": board,
                "turn": turn,
                "winner": winner,
                "gameOver": gameOver,
                "moves": moves,
                "players": players,
                "playersSymbols": playersSymbols,
                "partyLeader": leader,
            });
        };
        
        socket.on('disconnect', () => {
            console.log('disconnected: ' + socket.id);
            players.map((x,index) => {
                if(x.socket_id == socket.id) {
                    gameSocket.emit('g-addLog', `${JSON.stringify(players[index].player)} has disconnected`);
                    gameSocket.emit('g-addLog', 'Please recreate the game.');
                    gameSocket.emit('g-addLog', 'Sorry for the inconvenience (シ_ _)シ');
                    players[index].player ='';
                    if(socket.id === partyLeader) {
                        console.log('leader disconnected');
                        if(partyMembers.length > 0) {
                            partyLeader = partyMembers[0].socketID;
                            gameSocket.to(partyLeader).emit("leader");
                            console.log("PARTY LEADER IS: " + partyLeader);
                        }
                    }
                }
            })
            players = players.filter(x => x.player != '');
            console.log(Object.keys(gameSocket['sockets']).length)
            updatePartyList();
        })

    });
    let checkEmptyInterval = setInterval(() => {
        if(partyMembers.length == 0) {
            console.log('party empty');
            clearInterval(checkEmptyInterval);
            delete rooms[room.substring(1)];
            gameSocket.emit('partyEmpty');
        }
    }, 10000);
}

server.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});