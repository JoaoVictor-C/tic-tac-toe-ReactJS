import { Component } from 'react'
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import Game from '../components/Game';
import axios from 'axios';
const baseUrl = 'https://3000-joaovictorc-tictactoere-rkag27l2u55.ws-us107.gitpod.io' 

export default class JoinGame extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            name: '',
            roomCode: '',
            players: [],
            isInRoom: false,
            isReady: false,
            isLoading: false,
            isError: false,
            isGameStarted: false,
            errorMsg: '',
            socket: null
        }
    }

    onNameChange = (name) => {
        this.setState({ name });
    }

    onCodeChange = (roomCode) => {
        this.setState({ roomCode });
    }

    joinParty = () => {
        const bind = this
        const socket = io(`${baseUrl}/${this.state.roomCode}`);
        this.setState({ socket });
        console.log("socket criado")
        socket.emit('setName', this.state.name);
        
        socket.on("joinSuccess", function() {
            console.log("entrada bem sucedida")
            // bind.setState({ isLoading: false });
            bind.setState({ isInRoom: true })
        })

        socket.on("joinFailed", function(err) {
            console.log("entrada falhou, causa: " + err);
            bind.setState({ 
                errorMsg: err,
                isError: true,
                isLoading: false
            });
            socket.disconnect();
        })

        socket.on('startGame', () => {
            this.setState({ isGameStarted: true});
        })

        socket.on('partyUpdate', (players) => {
            this.setState({ players })
            if(players.length >= 3 && players.map(x => x.isReady).filter(x => x === true).length === players.length) { //TODO MUDAR 2 DE VOLTA PARA 3
                this.setState({ canStart: true })
            } else {
                this.setState({ canStart: false })
            }
        })


        socket.on('disconnected', function() {
            console.log("Você perdeu a conexão com o servidor")
        });
    }

    attemptJoinParty = () => {

        if(this.state.name === '') {
            console.log('Por favor, digite um nome');
            this.setState({ 
                errorMsg: 'Por favor, digite um nome',
                isError: true 
            });
            return
        }
        if(this.state.roomCode === '') {
            console.log('Por favor, digite um código de sala');
            this.setState({ 
                errorMsg: 'Por favor, digite um código de sala',
                isError: true
            });
            return
        }

        this.setState({ isLoading: true });
        const bind = this
        axios.get(`${baseUrl}/exists/${this.state.roomCode}`)
            .then(function (res) {
                console.log(res)
                if(res.data.exists) {
                    console.log(`Entrando na sala ${bind.state.roomCode}`)
                    bind.setState({errorMsg: ''})
                    bind.joinParty();
                } else {
                    console.log('Código de sala inválido')
                    bind.setState({ 
                        isLoading: false,
                        errorMsg: 'Código de sala inválido',
                        isError: true
                    });
                }
            })
            .catch(function (err) {
                console.log("erro ao obter exists", err);
                bind.setState({ 
                    isLoading: false,
                    errorMsg: 'Erro do servidor, sala não encontrada',
                    isError: true
                });
            })
    }
    
    reportReady = () => {
        this.state.socket.emit('setReady', true);
        this.state.socket.on('readyConfirm', () => {
            this.setState({ isReady: true })
        })
    }

    render() {
        if(this.state.isGameStarted) {
            return (<Game socket={this.state.socket} players={this.state.players} name={this.state.name} roomCode={this.state.roomCode}/>)
        }
        let error = null;
        let joinReady = null;
        let ready = null;
        if(this.state.isError) {
            error = <b>{this.state.errorMsg}</b>
        }
        if(this.state.isInRoom) {
            joinReady = <button className="joinButton btn" onClick={this.reportReady} disabled={this.state.isReady}>Pronto</button>
        } else {
            joinReady = <button className={`joinButton btn ${this.state.isLoading ? "pulse" : ""}`} onClick={this.attemptJoinParty} disabled={this.state.isLoading}>{this.state.isLoading ? 'Entrando...': 'Entrar'}</button>
        }
        if(this.state.isReady) {
            ready = <b style={{ color: '#5FC15F', textAlign: 'center'}}>Você está pronto! <br></br>Aguardando o líder da sala iniciar o jogo...</b>
            joinReady = null
        }

        return (
            <div className="joinGameContainer">
                <p>Seu Nome</p>
                <input
                    type="text" value={this.state.name} disabled={this.state.isLoading}
                    onChange={e => {
                        if(e.target.value.length <= 16 && e.target.value.length > 0){
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
                <p>Código da Sala</p>
                <input
                    type="text" value={this.state.roomCode} disabled={this.state.isLoading}
                    onChange={e => this.onCodeChange(e.target.value)}
                />
                <br></br>
                {joinReady}
                <br></br>
                {ready}
                <br></br>
                {error}
                <Link to="/" className="backButton btn">Voltar</Link>
                <div className="readyUnitContainer">
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
                </div>
            </div>
        )
    }
}
