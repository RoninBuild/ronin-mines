"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Difficulty = "easy" | "medium" | "hard";

type Config = {
  rows: number;
  cols: number;
  mines: number;
};

type Cell = {
  mine: boolean;
  adjacent: number;
};

type Board = Cell[][];

type Coord = { row: number; col: number };

type GameStatus = "ready" | "playing" | "won" | "lost";

const difficultyConfig: Record<Difficulty, Config> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

function coordKey(row: number, col: number) {
  return `${row},${col}`;
}

function buildBoard({ rows, cols, mines }: Config, safeCell?: Coord): Board {
  const board: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0 }))
  );

  const total = rows * cols;
  const positions = Array.from({ length: total }, (_, index) => index);

  if (safeCell) {
    const safeIndex = safeCell.row * cols + safeCell.col;
    const safePosIndex = positions.indexOf(safeIndex);
    if (safePosIndex >= 0) {
      positions.splice(safePosIndex, 1);
    }
  }

  for (let i = positions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  positions.slice(0, mines).forEach((pos) => {
    const row = Math.floor(pos / cols);
    const col = pos % cols;
    board[row][col].mine = true;
  });

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].mine) {
            count += 1;
          }
        }
      }
      board[row][col].adjacent = count;
    }
  }

  return board;
}

function revealFlood(
  board: Board,
  start: Coord,
  opened: Set<string>,
  flags: Set<string>
) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const queue: Coord[] = [start];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const key = coordKey(current.row, current.col);
    if (opened.has(key) || flags.has(key)) continue;
    opened.add(key);

    const cell = board[current.row][current.col];
    if (cell.adjacent !== 0) continue;

    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        const r = current.row + dr;
        const c = current.col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          const neighborKey = coordKey(r, c);
          if (!opened.has(neighborKey) && !flags.has(neighborKey)) {
            queue.push({ row: r, col: c });
          }
        }
      }
    }
  }
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default function GamePage() {
  const router = useRouter();
  const params = useSearchParams();
  const difficultyParam = (params.get("d") ?? "easy") as Difficulty;
  const difficulty: Difficulty = useMemo(() => {
    return ["easy", "medium", "hard"].includes(difficultyParam)
      ? difficultyParam
      : "easy";
  }, [difficultyParam]);

  const config = difficultyConfig[difficulty];
  const [board, setBoard] = useState<Board | null>(null);
  const [openedCells, setOpenedCells] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<GameStatus>("ready");
  const [timeMs, setTimeMs] = useState(0);
  const [mode, setMode] = useState<"open" | "flag">("open");
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const resetGame = useCallback(() => {
    setBoard(null);
    setOpenedCells(new Set());
    setFlags(new Set());
    setStatus("ready");
    setTimeMs(0);
    setMode("open");
  }, []);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  const startGame = useCallback(() => {
    if (status === "ready") {
      setStatus("playing");
    }
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return undefined;
    const interval = setInterval(() => {
      setTimeMs((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const ensureBoard = useCallback(
    (safeCell: Coord) => {
      if (board) return board;
      const nextBoard = buildBoard(config, safeCell);
      setBoard(nextBoard);
      return nextBoard;
    },
    [board, config]
  );

  const revealMinefield = useCallback((currentBoard: Board) => {
    const mines = new Set<string>();
    currentBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.mine) {
          mines.add(coordKey(rowIndex, colIndex));
        }
      });
    });
    setOpenedCells(mines);
  }, []);

  const checkWin = useCallback(
    (nextOpened: Set<string>) => {
      const totalSafe = config.rows * config.cols - config.mines;
      if (nextOpened.size >= totalSafe) {
        setStatus("won");
      }
    },
    [config]
  );

  const openCell = useCallback(
    (row: number, col: number) => {
      if (status === "lost" || status === "won") return;
      const key = coordKey(row, col);
      if (flags.has(key) || openedCells.has(key)) return;

      startGame();
      const currentBoard = ensureBoard({ row, col });
      const cell = currentBoard[row][col];
      if (cell.mine) {
        setStatus("lost");
        revealMinefield(currentBoard);
        return;
      }

      const nextOpened = new Set(openedCells);
      revealFlood(currentBoard, { row, col }, nextOpened, flags);
      setOpenedCells(nextOpened);
      checkWin(nextOpened);
    },
    [
      status,
      flags,
      openedCells,
      startGame,
      ensureBoard,
      revealMinefield,
      checkWin
    ]
  );

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      if (status === "lost" || status === "won") return;
      const key = coordKey(row, col);
      if (openedCells.has(key)) return;
      startGame();
      const nextFlags = new Set(flags);
      if (nextFlags.has(key)) {
        nextFlags.delete(key);
      } else {
        nextFlags.add(key);
      }
      setFlags(nextFlags);
    },
    [flags, openedCells, startGame, status]
  );

  const handleCellAction = useCallback(
    (row: number, col: number) => {
      if (mode === "flag") {
        toggleFlag(row, col);
      } else {
        openCell(row, col);
      }
    },
    [mode, openCell, toggleFlag]
  );

  const handlePointerDown = (row: number, col: number) => {
    longPressTriggered.current = false;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleFlag(row, col);
    }, 450);
  };

  const handlePointerUp = (row: number, col: number) => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (!longPressTriggered.current) {
      handleCellAction(row, col);
    }
  };

  const gridStyle = {
    gridTemplateColumns: `repeat(${config.cols}, var(--cell-size))`
  };

  const minesRemaining = config.mines - flags.size;

  const debugData = {
    difficulty,
    openedCells: Array.from(openedCells),
    flags: Array.from(flags),
    timeMs
  };

  const handleDifficultyChange = useCallback(
    (nextDifficulty: Difficulty) => {
      const nextParams = new URLSearchParams(params.toString());
      nextParams.set("d", nextDifficulty);
      router.replace(`/game?${nextParams.toString()}`);
    },
    [params, router]
  );

  const canShare = status === "won" || status === "lost";
  const shareLabel =
    status === "won"
      ? "I survived Ronin Mines!"
      : `Blew up in ${Math.max(1, Math.floor(timeMs / 1000))}s`;
  const shareMessage = `${shareLabel} Difficulty: ${difficulty.toUpperCase()} | Time: ${formatTime(
    timeMs
  )} | Play: https://roninmines.example/game?d=${difficulty}`;
  const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    shareMessage
  )}`;

  return (
    <section className="game-shell">
      <div className="game-header">
        <div>
          <h1>RONIN MINES — OFFCHAIN CORE</h1>
          <p className="game-subtitle">
            Difficulty: {difficulty.toUpperCase()} ({config.rows}x{config.cols}
            , {config.mines} mines)
          </p>
        </div>
        <button className="reset-button" type="button" onClick={resetGame}>
          Reset
        </button>
      </div>

      <div className="difficulty-toggle">
        <span>DIFFICULTY</span>
        {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            type="button"
            className={difficulty === level ? "active" : ""}
            onClick={() => handleDifficultyChange(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="game-stats">
        <div className="stat">
          <span>MINES</span>
          <strong>{minesRemaining}</strong>
        </div>
        <div className="stat">
          <span>TIME</span>
          <strong>{formatTime(timeMs)}</strong>
        </div>
        <div className="stat">
          <span>STATUS</span>
          <strong>{status.toUpperCase()}</strong>
        </div>
      </div>

      {canShare ? (
        <div className="share-row">
          <a
            className="share-button"
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
          >
            Share Result
          </a>
        </div>
      ) : null}

      <div className="mode-toggle">
        <span>MODE</span>
        <button
          type="button"
          className={mode === "open" ? "active" : ""}
          onClick={() => setMode("open")}
        >
          Open
        </button>
        <button
          type="button"
          className={mode === "flag" ? "active" : ""}
          onClick={() => setMode("flag")}
        >
          Flag
        </button>
        <p className="mode-hint">
          Tap/click to open. Long-press to toggle a flag.
        </p>
      </div>

      <div className="grid-wrap">
        <div className="grid" style={gridStyle}>
          {Array.from({ length: config.rows }).map((_, row) =>
            Array.from({ length: config.cols }).map((_, col) => {
              const key = coordKey(row, col);
              const isOpen = openedCells.has(key);
              const isFlag = flags.has(key);
              const cell = board?.[row]?.[col];
              const isMine = cell?.mine && isOpen;
              const number = cell?.adjacent ?? 0;
              const showNumber = isOpen && number > 0 && !isMine;
              return (
                <button
                  key={key}
                  className={[
                    "cell",
                    isOpen ? "open" : "",
                    isFlag ? "flag" : "",
                    isMine ? "mine" : "",
                    showNumber ? `n${number}` : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="button"
                  onPointerDown={() => handlePointerDown(row, col)}
                  onPointerUp={() => handlePointerUp(row, col)}
                  onPointerLeave={() => handlePointerUp(row, col)}
                  disabled={status === "lost" || status === "won"}
                  aria-label={`cell ${row + 1}-${col + 1}`}
                >
                  {isFlag ? "⚑" : null}
                  {isMine ? "✹" : null}
                  {showNumber ? number : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="debug">
        <h2>DEBUG (OFFCHAIN STATE)</h2>
        <pre>{JSON.stringify(debugData, null, 2)}</pre>
      </div>
    </section>
  );
}
