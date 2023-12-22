import { useState } from 'react';

function Square({value, onSquareClick, isWinner}) {
  let cssClass = "square"
  if (isWinner) {
    cssClass = "winner_square"
  }
  return (
    <button
      className={cssClass}
      onClick={onSquareClick}    >
      {value}
    </button>
  );
}

function Board({xIsNext, squares, onPlay}) {
  function handleClick(i){
    if (squares[i] || calcWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    }
    else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calcWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  }
  else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  function RenderBoard(){
    let board = [];
    let row = [];
    let row_idx = 0;
    let isWinnerSquare = false;
    for ( let i = 0; i < squares.length; i++ ) {
      // Check if square belongs to the winner square
      if (winner) {
        isWinnerSquare = winner[1].includes(i);
      }
      row.push(
        <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} isWinner={isWinnerSquare} />
      );
      if ( (i+1) % 3 === 0 ) {
        board.push(
          <div className="board-row" key={row_idx}>
            {row}
          </div>
        );
        row = []
        row_idx++;
      }
    }
    return board;
  }
  
  return (
    <RenderBoard /> 
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares){
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    }
    else {
      description = "Go to game start.";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  }
  )

  return(
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calcWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i=0; i < lines.length; i++){
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return null;
}
