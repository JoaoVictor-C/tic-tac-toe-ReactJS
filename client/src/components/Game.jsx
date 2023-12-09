import PropTypes from 'prop-types';
import Board from './game/board';
import React from 'react';

import "../App.css"

export default class Game extends React.Component {
        constructor(props) {
            super(props)

            this.state = {
                squares: Array(9).fill(null),
                winner: null,
                turn: null,
                isMyTurn: false,
                isGameOver: false,
                isDraw: false,
                myName: this.props.name,
                isTie: false,
                isWinner: false,
                isLoser: false,
                playersSymbols: null,
                partyLeader: null,
            }
    }

    componentDidMount() {
        const bind = this;
            
        bind.props.socket.on('gameStart', (data) => {
            bind.setState({
                squares: data.board,
                winner: data.winner,
                gameOver: data.gameOver,
                moves: data.moves,
                players: data.players,
                turn: data.turn,
                isMyTurn: data.turn === bind.props.name,
                isGameOver: data.gameOver,
                playersSymbols: data.playersSymbols,
                partyLeader: data.partyLeader,
            })
        })

        bind.props.socket.on('move', (data) => {
            bind.setState({
                squares: data.board,
                winner: data.winner,
                gameOver: data.gameOver,
                moves: data.moves,
                turn: data.turn,
                isMyTurn: data.turn === bind.props.name,
                isGameOver: data.gameOver,
                playersSymbols: data.playersSymbols,
            })
            console.log(bind.props.players.totalWins)
        })

    }

    handleClick = (i) => {
        const bind = this;  

        if(bind.state.isMyTurn && bind.state.squares[i] === null) {
            const data = {
                index: i,
                player: bind.props.name,
            }
            bind.props.socket.emit('move', data);
        }
    }

    render() {
        const bind = this;
        const isFinished = bind.state.isGameOver ? `${bind.state.winner} venceu!` : ``;
        const isMyTurn = (bind.state.isMyTurn && !bind.state.isGameOver) ? `Seu turno` : (bind.state.isGameOver ? `` : `Turno do oponente`);
        
        const restartGameScreen = () => {
            console.log(bind.state.partyLeader, bind.props.name);
            if (bind.state.partyLeader === bind.props.name) {
                return (
                    <div>
                        <div className='restartGameScreen'>
                            <h1>Jogo finalizado</h1>
                            <h2>{bind.state.winner === bind.props.name ? 'Você venceu!' : bind.state.isTie ? 'Empate' : 'Você perdeu!'}</h2> 
                            <h3>{isFinished}</h3>
                            <button className='restartGameButton btn' onClick={() => {
                                bind.props.socket.emit('restartGame', bind.props.roomCode);
                            }}>Reiniciar jogo</button>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div>
                        <div className='restartGameScreen'>
                            <h1>Jogo finalizado</h1>
                            <h2>{bind.state.winner === bind.props.name ? 'Você venceu!' : bind.state.isTie ? 'Empate' : 'Você perdeu!'}</h2>  
                            <h3>{isFinished}</h3>
                            <p>Esperando o líder da sala recomeçar o jogo...</p>
                        </div>
                    </div>
                )
            }
        }

        return (
            <div className="game">
                {bind.state.isGameOver ? restartGameScreen() : null}
                <h1>Jogo da velha</h1>
                <p className='roomCode' onClick={() => {
                    navigator.clipboard.writeText(bind.props.roomCode)
                }}>{bind.props.roomCode}</p>
                <div className='infoContainer'>
                    <div className='playerContainer'>
                        <h4 className='wins'>Vitórias: {bind.props.players[0].totalWins}</h4>
                        <h3 className='playerName'>{bind.props.players[0].name === bind.props.name ? `${bind.props.players[0].name} (você)` : bind.props.players[0].name}</h3>
                        <h4 className='symbol'>{`${bind.props.players[0].name === bind.props.name ? `Você é ${bind.props.players[0].symbol}` : `Oponente ${bind.props.players[0].symbol}`}`}</h4>
                    </div>
                    <div className='gameStatus'>
                        <h3>{isMyTurn}</h3>
                        <h3>{isFinished}</h3>
                    </div>
                    <div className='playerContainer'>
                        <h4 className='wins'>Vitórias: {bind.props.players[1].totalWins}</h4>
                        <h3 className='playerName'>{bind.props.players[1].name === bind.props.name ? `${bind.props.players[1].name} (você)` : bind.props.players[1].name}</h3>
                        <h4 className='symbol'>{`${bind.props.players[1].name === bind.props.name ? `Você é ${bind.props.players[1].symbol}` : `Oponente ${bind.props.players[1].symbol}`}`}</h4>
                    </div>
                </div>
                <div className="board">
                    <Board 
                        squares={this.state.squares}
                        onClick={this.handleClick}
                    />
                </div>
                <a href="/"><button className="backButton btn">Voltar</button></a>
            </div>
        )
    }
}

Game.propTypes = {
    socket: PropTypes.object.isRequired,
    roomCode: PropTypes.string.isRequired,
    players: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
}