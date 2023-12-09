import PropTypes from 'prop-types';

const Square = ({ value, onClick }) => {
    return (
        <button className="square" onClick={onClick}>
            {value}
        </button>
    )
}

Square.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

const Board = ({ squares, onClick }) => {
    return (
        <>
            <div className="board-row first-row">
                <Square value={squares[0]} onClick={() => onClick(0)} />
                <Square value={squares[1]} onClick={() => onClick(1)} />
                <Square value={squares[2]} onClick={() => onClick(2)} />
            </div>
            <div className="board-row second-row">
                <Square value={squares[3]} onClick={() => onClick(3)} />
                <Square value={squares[4]} onClick={() => onClick(4)} />
                <Square value={squares[5]} onClick={() => onClick(5)} />
            </div>
            <div className="board-row">
                <Square value={squares[6]} onClick={() => onClick(6)} />
                <Square value={squares[7]} onClick={() => onClick(7)} />
                <Square value={squares[8]} onClick={() => onClick(8)} />
            </div>
        </>
    )
}

Board.propTypes = {
    squares: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired
};

export default Board