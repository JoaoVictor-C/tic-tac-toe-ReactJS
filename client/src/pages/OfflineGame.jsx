import '../App.css'
import { useState, useEffect } from 'react'
import Board from '../components/game/board'


function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [player, setPlayer] = useState('X')
  const [result, setResult] = useState({ winner: 'none', state: 'none' })
  

  useEffect(() => {
    checkWin()
    checkIfTie()
    if (player === 'X') {
      setPlayer('O')
    } else if (player === 'O') {
      setPlayer('X')
    }
  }, [board])

  useEffect(() => {
    if (result.state !== 'none') {
      alert(`Game Finished! Winning Player: ${result.winner}`)
      restartGame()
    }
  }, [result])

  const chooseSquare = (square) => {
    if (board[square] === null) {
      setBoard(
        board.map((value, index) => {
          if (index === square && value === null) {
            return player
          }
          return value
        }),
      )
    }
  }

  const checkWin = () => {
    const winLines = [
      // Horizontal Wins
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // Vertical Wins
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // Diagonal Wins
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let index = 0; index < winLines.length; index++) {
      const [a, b, c] = winLines[index]

      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setResult({ winner: player, state: 'Won' })
      }
    }
  }

  const restartGame = () => {
    setBoard(Array(9).fill(null))
    randomizePlayer()
    setResult({ winner: 'none', state: 'none' })
  }

  const checkIfTie = () => {
    let filled = true

    board.forEach((square) => {
      if (square === null) {
        filled = false
      }
    })

    if (filled) {
      setResult({ winner: 'No One', state: 'Tie' })
    }

    return filled
  }

  const randomizePlayer = () => {
    const random = Math.floor(Math.random() * 2)
    if (random === 0) {
      setPlayer('X')
    } else {
      setPlayer('O')
    }
  }

  return (
    <div className="offline-game">
      <header className="App-header">
        <h1>Jogo da velha offline</h1>
      </header>
      <div className="board">
        <Board squares={board} onClick={chooseSquare} />
      </div>

        <div className="status">
          {result.state != 'none' ? (
            <h3>
              Vencedor: {result.winner}
            </h3>
          ) : (
            <h3>
              Próximo jogador: {player}
            </h3>
          )}
          <button onClick={restartGame}>Reiniciar jogo</button>
        </div>
        <a href="../" rel='noopener noreferrer'><button className='Voltar'>Voltar</button></a>
    </div>
  )
}

export default App
