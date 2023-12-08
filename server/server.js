const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const server = require('http').createServer(app);
const socketio = require('socket.io')

const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

const port = 3000 || process.env.PORT;

const TicTacToe = require('./game/tictactoe.js');

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
    rooms[newRoom] = null;
    console.log(newRoom + " CREATED")
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

    gameSocket.on('connection', (socket) => {
        console.log('id: ' + socket.id);
        players.push({
            "player": '',
            "socket_id": `${socket.id}`,
            "isReady": false
        })
        console.log(`player ${players.length} has connected`);
        socket.join(socket.id);
        console.log('socket joined ' + socket.id);
        const index = players.length-1;

        const updatePartyList = () => {
            partyMembers = players.map(x => {
                return {name: x.player, socketID: x.socket_id, isReady: x.isReady}
            }).filter(x => x.name != '')
            console.log(partyMembers);
            gameSocket.emit('partyUpdate', partyMembers) ;
        }

        // socket.on('g-actionDecision', (action) => {
        //     rooms[room].onChooseAction(action);
        // })

        socket.on('setName', (name) => { //when client joins, it will immediately set its name
            console.log(started)
            if(started) {
                gameSocket.to(players[index].socket_id).emit("joinFailed", 'game_already_started');
                return
            }
            if(!players.map(x => x.player).includes(name)){
                if(partyMembers.length >= 6) {
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
        })

        socket.on('startGameSignal', (players) => {
            started = true;
            gameSocket.emit('startGame');
            startGame(players, gameSocket, room);
        })
    
        socket.on('disconnect', () => {
            console.log('disconnected: ' + socket.id);
            players.map((x,index) => {
                if(x.socket_id == socket.id) {
                    gameSocket.emit('g-addLog', `${JSON.stringify(players[index].player)} has disconnected`);
                    gameSocket.emit('g-addLog', 'Please recreate the game.');
                    gameSocket.emit('g-addLog', 'Sorry for the inconvenience (シ_ _)シ');
                    players[index].player ='';
                    if(socket.id === partyLeader) {
                        console.log('Leader has disconnected');
                        gameSocket.emit('leaderDisconnect', 'leader_disconnected');
                        socket.removeAllListeners();
                        delete io.nsps[room];
                        delete rooms[room.substring(1)]
                        players = [];
                        partyMembers = []
                    }
                }
            })
            console.log(Object.keys(gameSocket['sockets']).length)
            updatePartyList();
        })
    });
    let checkEmptyInterval = setInterval(() => {
        if(Object.keys(gameSocket['sockets']).length === 0) {
            console.log('room ' + room + ' has been deleted');
            delete io.nsps[room];
            delete rooms[room.substring(1)]
            clearInterval(checkEmptyInterval);
        }
    }, 10000);
}

startGame = (players, gameSocket, room) => {
    rooms[room.substring(1)] = new TicTacToe(players, gameSocket);
    rooms[room.substring(1)].start();
}

server.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});