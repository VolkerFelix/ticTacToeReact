import { useState } from 'react';
import { Keypair, Connection, PublicKey, Cluster, clusterApiUrl,
  LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction
} from "@solana/web3.js";

import secret_x_json from "./keypair/player_x.json";
import secret_o_json from "./keypair/player_o.json";

const secret_x_a_u8 = Uint8Array.from(secret_x_json);
const secret_o_a_u8 = Uint8Array.from(secret_o_json);
const kp_x = Keypair.fromSecretKey(secret_x_a_u8);
const kp_o = Keypair.fromSecretKey(secret_o_a_u8);

class CPlayer {
  constructor(name, pk) {
    this.m_name = name;
    this.m_pk = pk;
  }
}

const player_x = new CPlayer('X', kp_x.publicKey.toString());
const player_o = new CPlayer('O', kp_o.publicKey.toString());
let players = [];
players.push(player_x);
players.push(player_o);

function PlayerInfo() {
  let players_render = []
  for (let i = 0; i < players.length; i++) {
    players_render.push(
      <div className="player-info">
        <p>Name: {players[i].m_name}</p>
        <p>PublicKey: {players[i].m_pk}</p>
    </div>
    )
  }
  return players_render;
}

function Square({value, onSquareClick, isWinner}) {
  let cssClass = "square"
  if (isWinner) {
    cssClass = "winner-square"
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
  const winner = calcWinner(squares);

  function handleClick(i){
    if (squares[i] || winner) {
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

  function GameStatus() {
    let status = [];
    if (winner) {
      status.push(
        <div className="game-status">
          <div>
            <p>Winner: {winner[0]}</p>
          </div>
          <div>
            <button onClick={() => claimWinnersBatch()}>Claim batch</button>
          </div>
        </div>
      );
    }
    else {
      status.push(
        <div className="game-status">
          <p>Next Player: {(xIsNext ? "X" : "O")}</p>
        </div>);
    }
    return status;
  }

  function RenderBoard() {
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
    <>
      <RenderBoard /> 
      <GameStatus />
    </>
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
    <>
      <div>
        <PlayerInfo />
      </div>
      <div className="game">
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    </>
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

function claimWinnersBatch(){
  /* TODO */
}
