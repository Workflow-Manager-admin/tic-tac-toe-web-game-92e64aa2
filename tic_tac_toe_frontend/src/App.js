import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Style tokens from project config
 */
const COLORS = {
  primary: "#1976D2",
  secondary: "#90CAF9",
  accent: "#FFC107",
};

/**
 * Square component representing a cell in the Tic Tac Toe grid.
 *
 * @param {Object} props - React component props
 * @param {string} props.value - Cell content ("X", "O", or null)
 * @param {Function} props.onClick - Click handler for this square
 * @param {boolean} props.highlight - If true, apply win highlighting
 */
// PUBLIC_INTERFACE
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? value : "empty cell"}
      type="button"
      tabIndex={0}
    >
      {value}
    </button>
  );
}

/**
 * Tic Tac Toe App - handles board state, turns, UI rendering and reset functionality.
 * Two-player game on the same device.
 */
// PUBLIC_INTERFACE
export default function App() {
  // Game state: 9 cells, "X" goes first
  const [squares, setSquares] = useState(Array(9).fill(null));
  // "X" if even moves, "O" if odd moves
  const [xIsNext, setXIsNext] = useState(true);
  // {winner: "X"|"O", line: [number,number,number]} or null for no winner, "draw" for tie
  const [winner, setWinner] = useState(null);
  // Track score for session
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  // Theme state ("light" only per requirements, but keep dark-mode toggle demo)
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Check for game ending
  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      if (result === "draw") {
        setWinner("draw");
        setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      } else {
        setWinner(result.winner);
        setScore((prev) => ({
          ...prev,
          [result.winner]: prev[result.winner] + 1,
        }));
      }
    }
  }, [squares]);

  // Reset for a new round, preserve scores
  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setXIsNext(winner === "draw" ? xIsNext : !xIsNext); // alternate who starts after a win
    setWinner(null);
  }

  // Reset all (board + scores)
  // PUBLIC_INTERFACE
  function handleFullReset() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setScore({ X: 0, O: 0, draws: 0 });
  }

  // When user clicks a square
  function handleClick(idx) {
    if (winner || squares[idx]) return;
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // Board render
  function renderBoard() {
    const winLine = winner && winner !== "draw" ? calculateWinner(squares).line : [];
    return (
      <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
        {[0, 1, 2].map((row) => (
          <div className="ttt-row" key={row} role="row">
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return (
                <Square
                  key={idx}
                  value={squares[idx]}
                  onClick={() => handleClick(idx)}
                  highlight={winLine.includes(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Game status message
  let status;
  if (!winner) {
    status = (
      <span>
        Turn:
        <span
          className="ttt-player"
          style={{
            color: xIsNext ? COLORS.primary : COLORS.accent,
            background: xIsNext ? COLORS.secondary : COLORS.accent + "10",
          }}
        >
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  } else if (winner === "draw") {
    status = <span className="ttt-draw">Draw!</span>;
  } else {
    status = (
      <span>
        Winner:{" "}
        <span
          className="ttt-player"
          style={{
            color: winner === "X" ? COLORS.primary : COLORS.accent,
            background: winner === "X" ? COLORS.secondary : COLORS.accent + "10",
          }}
        >
          {winner}
        </span>
      </span>
    );
  }

  return (
    <main className="App">
      <header className="App-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div className="ttt-status">{status}</div>
        {renderBoard()}
        <div className="ttt-buttons">
          <button
            className="btn ttt-btn"
            onClick={handleRestart}
            disabled={!winner && squares.every((s) => !s)}
            aria-label="Restart the current game"
            type="button"
          >
            Restart
          </button>
          <button
            className="btn ttt-btn ttt-reset"
            onClick={handleFullReset}
            aria-label="Reset all scores and game"
            type="button"
          >
            Reset All
          </button>
        </div>
        <div className="ttt-scoreboard">
          <section className="ttt-score ttt-score-x">
            X: <span>{score.X}</span>
          </section>
          <section className="ttt-score ttt-score-o">
            O: <span>{score.O}</span>
          </section>
          <section className="ttt-score ttt-score-draw">
            Draws: <span>{score.draws}</span>
          </section>
        </div>
        <div className="ttt-footer">
          <span>
            <a
              href="https://reactjs.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="App-link"
            >
              React
            </a>
            {" | "}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="App-link"
            >
              GitHub
            </a>
          </span>
        </div>
      </header>
    </main>
  );
}

/**
 * Determine the winner or draw for a Tic Tac Toe board state.
 * Returns:
 *   {winner: "X"|"O", line: [number,number,number]}  if win,
 *   "draw" if board full and no winner,
 *   null if still ongoing.
 * @param {string[]} squares
 */
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  // All possible winning lines (rows, cols, diags)
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (squares.every((s) => s)) return "draw";
  return null;
}
