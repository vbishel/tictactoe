import React, { useReducer, useContext } from "react";
import GameGrid from "./components/GameGridComponent/GameGrid";
import Display from "./components/DisplayComponent/Display";
import "./App.css";

// Interfaces & Types
export interface GameState {
  currentTurn: "O" | "X";
  O: string[];
  O_score:number;
  X: string[];
  X_score:number;
  isGameEnded: boolean;
  winner:"O"|"X"|null,
  winningCombination:string[]|null
}

type Action = {
  type: string;
  payload: string;
};

type Context = {
  state: GameState;
  dispatch: Function;
};

// Game variables
const winningCombinations = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["1", "4", "7"],
  ["2", "5", "8"],
  ["3", "6", "9"],
  ["1", "5", "9"],
  ["3", "5", "7"],
];

const initialState: GameState = {
  currentTurn: "X",
  // These two arrays will store the information about the squares each player holds
  O: [],
  O_score: 0,
  X: [],
  X_score: 0,
  isGameEnded: false,
  winner: null,
  winningCombination: null,
};

// Helper Functions
// This function checks if haystack array contains all elements from needle array
function containsAll(needle: string[], haystack: string[]): boolean {
  for (let i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1) {
      return false;
    }
  }
  return true;
}

function flipACoin(): "heads" | "tails" {
  const num = Math.random();
  if (num > 0.5) {
    return "tails";
  } else {
    return "heads";
  }
}

// Reducer
const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "register_turn":
      // Checking who made the turn
      if (state.currentTurn === "X") {
        // Action payload will have a cell, which is added to a list of player's occupied cells.
        let newX = [...state.X, action.payload];
        return {
          ...state,
          X: newX,
          // Passing the turn to the second player
          currentTurn: "O",
        };
      } else if (state.currentTurn === "O") {
        let newO = [...state.O, action.payload];
        return {
          ...state,
          O: newO,
          currentTurn: "X",
        };
      }
      throw new Error("No matching state.CurrentTurn in reducer");
    case "check_winner":
      if (state.isGameEnded === false) {
        // Check winner will be called after the turn is passed to second player, but we are checking the player who just made the turn
        let player: "O" | "X";
        let playerScore: number | null = null;
        if (state.currentTurn === "X") {
          player = "O";
          playerScore = state.O_score;
        } else {
          player = "X";
          playerScore = state.X_score;
        }
        const occupiedCells = state[player];

        // Check if player's occupied cells contain winning combination cells; if so - we have a winner!
        for (let i = 0; i < winningCombinations.length; i++) {
          if (containsAll(winningCombinations[i], occupiedCells)) {
            if (player === "O") {
              return {
                ...state,
                O_score: state.O_score + 1,
                isGameEnded: true,
                winner: "O",
                winningCombination: winningCombinations[i],
              };
            } else {
              return {
                ...state,
                X_score: state.X_score + 1,
                isGameEnded: true,
                winner: "X",
                winningCombination: winningCombinations[i],
              };
            }
          }
        }
        // If all cells are filled, but we have no winner - it is a draw
        if (state.X.length + state.O.length === 9) {
          return {
            ...state,
            isGameEnded: true,
            winner: null,
          };
        }
      }
      return state;
    case "new_game":
      // Loser will make the first turn next game
      let firstTurn:"O"|"X"|null = null;
      if (state.winner === "X") {
        firstTurn = "O";
      }
      else if (state.winner === "O") {
        firstTurn = "X";
      }
      else {
        // Draw
        if (flipACoin() === "heads") {
          firstTurn = "X";
        }
        else {
          firstTurn = "O";
        }
      }
      return {
        ...initialState,
        O_score: state.O_score,
        X_score: state.X_score,
        currentTurn: firstTurn
      };
    default:
      throw new Error("Didn't find matching action type");
  }
};

export const GameContext = React.createContext<Context | null>(null);

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GameContext.Provider value={{ dispatch, state }}>
      <div className="main-container">
        <Display />
        <GameGrid />
      </div>
    </GameContext.Provider>
  );
}

export default App;
