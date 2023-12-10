import { Component } from 'react'
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import { ReactSortable } from "react-sortablejs";
import Game from '../components/Game';
import axios from 'axios';
const baseUrl = "https://super-goggles-p4gr5g4q9qpc74wv-3000.app.github.dev"

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
        this.setState({ name: name });
    }
    
    joinParty = () => {
        const bind = this
        const socket = io(`${baseUrl}/${this.state.roomCode}`)
        this.setState({ socket: socket });
        console.log("joining room " + this.state.roomCode)
        socket.emit('setName', this.state.name);
        
        socket.on("joinSuccess", function() {
            console.log("join successful")
            bind.setState({ 
                isLoading: false,
                isInRoom: true
            });
        })

        socket.on("joinFailed", function(err) {
            console.log("join failed, cause: " + err);
            bind.setState({ isLoading: false });
        })

        socket.on('disconnected', function() {
            console.log("You've lost connection with the server")
        });

        socket.on('partyUpdate', (players) => {
            console.log(`party update: ${players}`)
            this.setState({ players })
            if(players.length >= 2 && players.map(x => x.isReady).filter(x => x === true).length === players.length) {
                this.setState({ canStart: true })
            } else {
                this.setState({ canStart: false })
            }
        })
    }

    createParty = () => {
        if(this.state.name === '') {
            //TODO  handle error
            console.log('Please enter a name');
            this.setState({ errorMsg: 'Insira seu nome' });
            this.setState({ isError: true });
            return
        }

        this.setState({ isLoading: true });
        const bind = this;
        axios.get(`${baseUrl}/createRoom`)
            .then(function (res) {
                console.log(res);
                console.log(`room ${res.data.room} created`)
                bind.setState({ roomCode: res.data.room, errorMsg: '' }, () => {
                    bind.joinParty();
                });
            })
            .catch(function (err) {
                //TODO  handle error
                console.log("error in creating room", err);
                bind.setState({ isLoading: false });
                bind.setState({ errorMsg: 'Erro ao criar sala' });
                bind.setState({ isError: true });
            })
    }

    startGame = () => {
        this.state.socket.emit('startGameSignal', this.state.players)

        this.state.socket.on('startGame', () => {
            this.setState({ isGameStarted: true});
        })
    }

    copyCode = () => {
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = this.state.roomCode;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        this.setState({copied: true})
    }


    render() {
        if(this.state.isGameStarted) {
            return (<Game socket={this.state.socket} players={this.state.players} name={this.state.name} roomCode={this.state.roomCode}/>)
        }
        let error = null;
        let roomCode = null;
        let startGame = null;
        let createButton = null;
        if(!this.state.isInRoom) {
            createButton = <>
            <button className={`createButton btn ${this.state.isLoading ? "pulse" : ""}`} onClick={this.createParty} disabled={this.state.isLoading}>{this.state.isLoading ? 'Criando...': 'Criar'}</button>
            <br></br>
            </>
        }
        if(this.state.isError) {
            error = <b>{this.state.errorMsg}</b>
        }
        if(this.state.roomCode !== '' && !this.state.isLoading) {
            roomCode = <div className="roomCodeContainer">
                    <p>Código da sala:
                        <b className="RoomCode btn" onClick={this.copyCode}>{this.state.roomCode} 
                            <span className="iconify" data-icon="typcn-clipboard" data-inline="true"></span>
                        </b>
                    </p>
                    {this.state.copied ? <p><br></br>Copiado!</p> : null}
                </div>
        }
        if(this.state.canStart) {
            startGame = <button className="startGameButton btn" onClick={this.startGame}>Iniciar o jogo</button>
        }
        return (
            <div className="createGameContainer">
                <p>Insira seu nome</p>
                <input
                    type="text" value={this.state.name} disabled={this.state.isLoading || this.state.isInRoom}
                    onChange={e => {
                        if(e.target.value.length <= 16 && e.target.value.length > 0 ){
                            this.setState({
                                errorMsg: '',
                                isError: false
                            })
                            this.onNameChange(e.target.value);
                        } else {
                            this.setState({
                                errorMsg: 'Nome inválido, máximo de 16 caracteres',
                                isError: true
                            })
                        }
                        
                    }}
                />
                <br></br>
                {createButton}
                <Link to="/" className="backButton btn">Voltar</Link>
                {error}
                <br></br>
                {roomCode}
                <br></br>
                <div className="readyUnitContainer">
                    <ReactSortable list={this.state.players} setList={newState => this.setState({ players: newState })}>
                        {this.state.players.map((item,index) => {
                            let ready = null
                            let readyUnitColor = '#E46258'
                            if(item.isReady) {
                                ready = <b>Pronto!</b>
                                readyUnitColor = '#73C373'
                            } else {
                                ready = <b>Pendente!</b>
                            }
                            return (
                                    <div className="readyUnit" style={{backgroundColor: readyUnitColor}} key={index}>
                                        <p >{index+1}. {item.name} {ready}</p>
                                    </div>
                            )
                            })
                        }
                    </ReactSortable>
                </div>
                <br></br>
                {startGame}
            </div>
                
        )
    }
}
