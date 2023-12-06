import { Component } from 'react'
import io from "socket.io-client";
import { ReactSortable } from "react-sortablejs";
import Game from '../components/Game';
import axios from 'axios';
const baseUrl = "http://localhost:3000"

// on: join, action, disconnect
// emit: joined, start, action, disconnected
// get: createRooms, exists, rooms, users

export default class CreateGame extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            name: '',
            roomCode: '',
            copied: false,
            isInRoom: false,
            isLoading: false,
            players: [],
            isError: false,
            isGameStarted: false,
            errorMsg: '',
            canStart: false,
            socket: null,
        }
    }

    onNameChange = (name) => {
        this.setState({ name });
    }

    joinParty = () => {
        const bind = this
        const socket = io(`${baseUrl}/${this.state.roomCode}`);
        this.setState({ socket });
        console.log("Socket created")
        socket.emit('setName', this.state.name);
        
        socket.on("joinSuccess", function() {
            console.log("Join successful")
            bind.setState({ 
                isLoading: false,
                isInRoom: true
            });
        })

        socket.on("joinFailed", function(err) {
            console.log("Join failed, cause: " + err);
            bind.setState({ isLoading: false });
        })

        socket.on("leader", function() {
            console.log("You are the leader")
        })

        socket.on('disconnected', function() {
            console.log("You've lost connection with the server")
        });
    }


}