const Square = ({ value, onClick }) => {
    return (
        <button className="square" onClick={onClick}>
            {value}
        </button>
    )
}

const board = ({ squares, chooseSquare }) => {
    return (
        <>
            <div className="board-row first-row">
                <Square value={squares[0]} onClick={() => chooseSquare(0)} />
                <Square value={squares[1]} onClick={() => chooseSquare(1)} />
                <Square value={squares[2]} onClick={() => chooseSquare(2)} />
            </div>
            <div className="board-row second-row">
                <Square value={squares[3]} onClick={() => chooseSquare(3)} />
                <Square value={squares[4]} onClick={() => chooseSquare(4)} />
                <Square value={squares[5]} onClick={() => chooseSquare(5)} />
            </div>
            <div className="board-row">
                <Square value={squares[6]} onClick={() => chooseSquare(6)} />
                <Square value={squares[7]} onClick={() => chooseSquare(7)} />
                <Square value={squares[8]} onClick={() => chooseSquare(8)} />
            </div>
        </>
    )
}

export default board