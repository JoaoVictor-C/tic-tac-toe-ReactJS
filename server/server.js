const express = require('express');
const moment = require('moment');
const app = express();
const cors = require('cors');
const { connect } = require('http2');
app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 3000 || process.env.PORT;

let users = [];
let rooms = [];

const generateRooms = (length = 2) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


app.get('/createRooms', function (req, res) {
    let newRoom = '';
    while(newRoom === '' || (newRoom in rooms)) {
        newRoom = generateRooms();
    }
    const newSocket = io.of(`/${newRoom}`);
    openSocket(newSocket, `/${newRoom}`);
    rooms[newRoom] = null;
    console.log(newRoom + " CREATED")
    res.json({Room: newRoom});
})

app.get('/exists/:room', function (req, res) {
    const room = req.params.room;
    res.json({exists: (room in rooms)});
})

app.get('/rooms', function (req, res) {
    res.json({rooms: rooms});
})

app.get('/users', function (req, res) {
    res.json({users: users});
})

const openSocket = (socket, room) => {
    let players = []; 
    let started = false;

    socket.on('connection', (socket) => {
        socket.on('join', (data) => {
            if (players.length < 2) {
                players.push(data);
                socket.join(room);
                socket.emit('joined', {room: room, player: data});
                socket.broadcast.emit('joined', {room: room, player: data});
                if (players.length === 2) {
                    socket.emit('start', {room: room, players: players});
                    socket.broadcast.emit('start', {room: room, players: players});
                }
            }
        });

        socket.on('action', (data) => {
            socket.broadcast.emit('action', {room: room, action: data.action, player: data.player});
        });

        socket.on('disconnect', () => {
            socket.broadcast.emit('disconnected', {room: room});
            socket.leave(room);
        });
    });

    socket.on('disconnect', () => {
        socket.removeAllListeners();
    });
}

server.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});