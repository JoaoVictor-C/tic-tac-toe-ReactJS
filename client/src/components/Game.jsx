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
                playersSymbol: null
            }

            const bind = this;


            bind.props.socket.on('connect', () => {
                console.log("connected")
                bind.props.socket.emit('setName', bind.props.name);
            });

            bind.props.socket.on('gameUpdate', (squares) => {
                bind.state = { squares }
            });

            bind.props.socket.on('gameOver', (winner) => {
                bind.state = { winner };
                if(winner === bind.state.myName) {
                    bind.state = { isWinner: true };
                } else if(winner === "tie") {
                    bind.state = { isTie: true };
                } else {
                    bind.state = { isLoser: true };
                }
            });

            bind.props.socket.on('turnUpdate', (isMyTurn) => {
                bind.state = { isMyTurn }
            })
            
            bind.props.socket.on('gameStart', (data) => {
                console.log(data)
                bind.state = {
                    squares: data.board,
                    winner: data.winner,
                    gameOver: data.gameOver,
                    moves: data.moves,
                    players: data.players,
                    turn: data.turn,
                    isMyTurn: data.turn === bind.props.name,
                    isGameOver: data.gameOver,
                    playersSymbols: data.playersSymbols,
                }
            })

            bind.props.socket.on('move', (data) => {
                console.log(data)
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
                })
                console.log(`Squares: ${this.state.squares}`)
            })
    }

    handleClick = (i) => {
        const bind = this;  
        console.log(`squares[i]: ${bind.state.squares[i]}`)
        console.log(`isMyTurn: ${bind.state.isMyTurn}`)

        if(bind.state.isMyTurn && bind.state.squares[i] === null) {
            console.log(i)
            const data = {
                index: i,
                player: bind.props.name,
            }
            bind.props.socket.emit('move', data);
        }
    }

    render() {
        const bind = this;
        const playersDiv = bind.props.players.map((player, index) => {
            return (
                <div key={index}>
                    <h3>{player.name === bind.props.name ? `${player.name} (You)` : player.name}</h3>
                </div>
            )
        });
        const isMyTurn = bind.state.isMyTurn ? 'Your turn' : 'Opponent\'s turn';
        const isGameOver = bind.state.isGameOver ? 'Game Over' : null;
        const isWinner = bind.state.isWinner ? 'You won!' : null;
        const isLoser = bind.state.isLoser ? 'You lost!' : null;
        const isTie = bind.state.isTie ? 'It\'s a tie!' : null;

        return (
            <div className="game">
                <h1>Tic Tac Toe game</h1>
                <p className='roomCode' onClick={() => {
                    navigator.clipboard.writeText(bind.props.roomCode)
                }}>{bind.props.roomCode}</p>
                <div className='playersContainer'>
                    {playersDiv}
                </div>
                <div className="board">
                    <Board 
                        squares={this.state.squares}
                        onClick={this.handleClick}
                    />
                </div>
                <h2>Game Status:</h2>
                <div>
                    <h3>{isMyTurn}</h3>
                    <h3>{isGameOver}</h3>
                    <h3>{isWinner}</h3>
                    <h3>{isLoser}</h3>
                    <h3>{isTie}</h3>
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