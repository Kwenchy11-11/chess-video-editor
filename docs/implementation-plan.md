# Chess Video Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Remotion-based chess video generator that creates TikTok-ready videos from Chess.com URLs

**Architecture:** React + Remotion for video generation, chess.js for game logic, Chess.com API for data fetching, SVG-based 2D board with smooth animations

**Tech Stack:** Remotion, React, TypeScript, chess.js, TailwindCSS, Lucide React

---

## File Structure

```
chess-video-editor/
├── src/
│   ├── components/
│   │   ├── Board.tsx              # Main chess board
│   │   ├── ChessPiece.tsx         # Individual piece component
│   │   ├── PlayerCard.tsx         # Player info display
│   │   ├── MovesList.tsx          # Scrollable moves list
│   │   ├── MoveArrow.tsx          # Arrow indicating moves
│   │   ├── Highlight.tsx          # Square highlighting
│   │   └── Effects/
│   │       ├── CaptureEffect.tsx  # Capture animation
│   │       └── CheckEffect.tsx    # Check/checkmate flash
│   ├── hooks/
│   │   ├── useChessGame.ts        # Game state management
│   │   └── useChessAPI.ts         # Chess.com API integration
│   ├── lib/
│   │   ├── chess.ts               # Chess utilities
│   │   └── constants.ts           # Board colors, sizes
│   ├── compositions/
│   │   └── ChessGame.tsx          # Main Remotion composition
│   └── Root.tsx                   # Remotion root
├── public/
│   └── pieces/                    # SVG chess pieces (Merida set)
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `remotion.config.ts`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "chess-video-editor",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion render ChessGame out/video.mp4",
    "upgrade": "remotion upgrade"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/player": "^4.0.0",
    "chess.js": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create remotion.config.ts**

```typescript
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
```

- [ ] **Step 4: Install dependencies**

```bash
cd /Users/kwanchanokroumsuk/chess-video-editor && npm install
```

Expected: Dependencies installed successfully

- [ ] **Step 5: Commit**

```bash
cd /Users/kwanchanokroumsuk/chess-video-editor
git init
git add package.json tsconfig.json remotion.config.ts
git commit -m "chore: initial project setup"
```

---

## Task 2: Constants and Types

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create constants.ts**

```typescript
// Video dimensions (TikTok 9:16)
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;

// Board settings
export const BOARD_SIZE = 800; // pixels
export const SQUARE_SIZE = BOARD_SIZE / 8;
export const BOARD_MARGIN = (VIDEO_WIDTH - BOARD_SIZE) / 2;

// Timing
export const SECONDS_PER_MOVE = 2;
export const FRAMES_PER_MOVE = SECONDS_PER_MOVE * FPS;

// Colors (Chess.com blue theme)
export const COLORS = {
  lightSquare: '#EBECD0',
  darkSquare: '#779556',
  highlightFrom: 'rgba(130, 180, 70, 0.5)',
  highlightTo: 'rgba(130, 180, 70, 0.3)',
  arrow: 'rgba(130, 180, 70, 0.8)',
  checkFlash: 'rgba(255, 0, 0, 0.3)',
  text: '#FFFFFF',
  background: '#1A1A2E',
  playerCard: '#16213E',
};

// Piece mapping
export const PIECE_SYMBOLS: Record<string, string> = {
  'p': 'pawn',
  'n': 'knight',
  'b': 'bishop',
  'r': 'rook',
  'q': 'queen',
  'k': 'king',
};
```

- [ ] **Step 2: Create types.ts**

```typescript
export interface Player {
  username: string;
  rating: number;
  avatar?: string;
  color: 'white' | 'black';
}

export interface GameData {
  id: string;
  white: Player;
  black: Player;
  moves: string[]; // SAN notation
  opening?: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  pgn: string;
}

export interface MoveAnimation {
  from: string; // e2
  to: string;   // e4
  piece: string; // 'P' or 'p'
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  san: string; // "e4" or "Nf3"
}

export interface ChessCompositionProps {
  gameData: GameData;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants.ts src/lib/types.ts
git commit -m "feat: add constants and types"
```

---

## Task 3: Chess API Hook

**Files:**
- Create: `src/hooks/useChessAPI.ts`

- [ ] **Step 1: Create useChessAPI.ts**

```typescript
import { useState, useEffect } from 'react';
import { GameData, Player } from '../lib/types';

export function useChessAPI(url: string) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Extract game ID from URL
        const match = url.match(/chess\.com\/game\/(?:live|daily)\/(\d+)/);
        if (!match) {
          throw new Error('Invalid Chess.com URL');
        }
        
        const gameId = match[1];
        
        // Fetch from Chess.com public API
        const response = await fetch(`https://api.chess.com/pub/game/${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game');
        }
        
        const data = await response.json();
        
        // Parse PGN to get moves
        const pgn = data.pgn || '';
        const moves = parsePGN(pgn);
        
        const gameData: GameData = {
          id: gameId,
          white: {
            username: data.white?.username || 'White',
            rating: data.white?.rating || 0,
            color: 'white',
          },
          black: {
            username: data.black?.username || 'Black',
            rating: data.black?.rating || 0,
            color: 'black',
          },
          moves,
          opening: extractOpening(pgn),
          result: data.result || '*',
          pgn,
        };
        
        setGameData(gameData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGame();
  }, [url]);

  return { gameData, loading, error };
}

function parsePGN(pgn: string): string[] {
  // Remove headers
  const movesText = pgn.replace(/\[.*?\]/g, '').trim();
  
  // Extract moves (remove move numbers and result)
  const moves = movesText
    .replace(/\d+\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));
  
  return moves;
}

function extractOpening(pgn: string): string | undefined {
  const match = pgn.match(/\[Opening "([^"]+)"\]/);
  return match ? match[1] : undefined;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChessAPI.ts
git commit -m "feat: add Chess.com API hook"
```

---

## Task 4: Chess Game Hook

**Files:**
- Create: `src/hooks/useChessGame.ts`

- [ ] **Step 1: Create useChessGame.ts**

```typescript
import { useMemo } from 'react';
import { Chess } from 'chess.js';
import { GameData, MoveAnimation } from '../lib/types';
import { FRAMES_PER_MOVE } from '../lib/constants';

export function useChessGame(gameData: GameData) {
  return useMemo(() => {
    const chess = new Chess();
    const positions: string[] = [];
    const moveAnimations: MoveAnimation[] = [];
    
    // Initial position
    positions.push(chess.fen());
    
    // Play through all moves
    for (const san of gameData.moves) {
      const move = chess.move(san);
      
      if (move) {
        moveAnimations.push({
          from: move.from,
          to: move.to,
          piece: move.piece,
          isCapture: move.captured !== undefined,
          isCheck: chess.isCheck(),
          isCheckmate: chess.isCheckmate(),
          isCastle: move.flags.includes('k') || move.flags.includes('q'),
          san: move.san,
        });
        
        positions.push(chess.fen());
      }
    }
    
    const totalFrames = (positions.length - 1) * FRAMES_PER_MOVE;
    
    return {
      positions,
      moveAnimations,
      totalFrames,
      getPositionAtFrame: (frame: number) => {
        const moveIndex = Math.floor(frame / FRAMES_PER_MOVE);
        const progress = (frame % FRAMES_PER_MOVE) / FRAMES_PER_MOVE;
        return {
          fen: positions[Math.min(moveIndex, positions.length - 1)],
          currentMove: moveAnimations[moveIndex],
          progress,
          moveIndex,
        };
      },
    };
  }, [gameData]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChessGame.ts
git commit -m "feat: add chess game state hook"
```

---

## Task 5: Chess Piece SVG Assets

**Files:**
- Create: `public/pieces/wP.svg` (white pawn)
- Create: `public/pieces/wN.svg` (white knight)
- Create: `public/pieces/wB.svg` (white bishop)
- Create: `public/pieces/wR.svg` (white rook)
- Create: `public/pieces/wQ.svg` (white queen)
- Create: `public/pieces/wK.svg` (white king)
- Create: `public/pieces/bP.svg` (black pawn)
- Create: `public/pieces/bN.svg` (black knight)
- Create: `public/pieces/bB.svg` (black bishop)
- Create: `public/pieces/bR.svg` (black rook)
- Create: `public/pieces/bQ.svg` (black queen)
- Create: `public/pieces/bK.svg` (black king)

- [ ] **Step 1: Download Merida piece SVGs**

Use these URLs (standard Merida set):
- White: https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg
- Black: https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg

Or create simple SVG placeholders for now:

```svg
<!-- public/pieces/wP.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
  <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Create piece loader utility**

Create `src/lib/pieces.ts`:

```typescript
export function getPieceSvg(piece: string): string {
  const color = piece === piece.toUpperCase() ? 'w' : 'b';
  const type = piece.toLowerCase();
  return `/pieces/${color}${type.toUpperCase()}.svg`;
}
```

- [ ] **Step 3: Commit**

```bash
git add public/pieces/ src/lib/pieces.ts
git commit -m "feat: add chess piece SVG assets"
```

---

## Task 6: ChessPiece Component

**Files:**
- Create: `src/components/ChessPiece.tsx`

- [ ] **Step 1: Create ChessPiece.tsx**

```typescript
import React from 'react';
import { Img } from 'remotion';
import { SQUARE_SIZE } from '../lib/constants';
import { getPieceSvg } from '../lib/pieces';

interface ChessPieceProps {
  piece: string; // 'P', 'N', 'B', 'R', 'Q', 'K' or lowercase
  x: number; // 0-7 (file)
  y: number; // 0-7 (rank, 0 = rank 8, 7 = rank 1)
  isAnimating?: boolean;
  targetX?: number;
  targetY?: number;
  progress?: number; // 0-1 for animation
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  x,
  y,
  isAnimating = false,
  targetX,
  targetY,
  progress = 0,
}) => {
  const pieceSrc = getPieceSvg(piece);
  
  // Calculate position
  let posX = x * SQUARE_SIZE;
  let posY = y * SQUARE_SIZE;
  
  // Interpolate if animating
  if (isAnimating && targetX !== undefined && targetY !== undefined) {
    posX = x * SQUARE_SIZE + (targetX - x) * SQUARE_SIZE * progress;
    posY = y * SQUARE_SIZE + (targetY - y) * SQUARE_SIZE * progress;
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: isAnimating ? 10 : 1,
      }}
    >
      <Img
        src={pieceSrc}
        style={{
          width: SQUARE_SIZE * 0.9,
          height: SQUARE_SIZE * 0.9,
        }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChessPiece.tsx
git commit -m "feat: add ChessPiece component"
```

---

## Task 7: Board Component

**Files:**
- Create: `src/components/Board.tsx`

- [ ] **Step 1: Create Board.tsx**

```typescript
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { Highlight } from './Highlight';
import { MoveArrow } from './MoveArrow';
import { BOARD_SIZE, SQUARE_SIZE, COLORS, FRAMES_PER_MOVE } from '../lib/constants';
import { useChessGame } from '../hooks/useChessGame';
import { GameData } from '../lib/types';

interface BoardProps {
  gameData: GameData;
}

export const Board: React.FC<BoardProps> = ({ gameData }) => {
  const frame = useCurrentFrame();
  const { getPositionAtFrame } = useChessGame(gameData);
  
  const { fen, currentMove, progress, moveIndex } = getPositionAtFrame(frame);
  const chess = new Chess(fen);
  
  // Parse FEN to get piece positions
  const board = chess.board();
  
  // Convert algebraic to coordinates (0-7)
  const fileToX = (file: string) => file.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rankToY = (rank: string) => 8 - parseInt(rank); // rank 8 = y=0, rank 1 = y=7
  
  return (
    <div
      style={{
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        position: 'relative',
        backgroundColor: COLORS.lightSquare,
      }}
    >
      {/* Render squares */}
      {Array.from({ length: 64 }).map((_, i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const isLight = (x + y) % 2 === 0;
        
        return (
          <div
            key={`square-${i}`}
            style={{
              position: 'absolute',
              left: x * SQUARE_SIZE,
              top: y * SQUARE_SIZE,
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              backgroundColor: isLight ? COLORS.lightSquare : COLORS.darkSquare,
            }}
          />
        );
      })}
      
      {/* Highlight squares for current move */}
      {currentMove && progress < 0.5 && (
        <>
          <Highlight 
            x={fileToX(currentMove.from[0])} 
            y={rankToY(currentMove.from[1])} 
            color={COLORS.highlightFrom}
          />
          <Highlight 
            x={fileToX(currentMove.to[0])} 
            y={rankToY(currentMove.to[1])} 
            color={COLORS.highlightTo}
          />
        </>
      )}
      
      {/* Move arrow */}
      {currentMove && progress < 0.8 && (
        <MoveArrow
          fromX={fileToX(currentMove.from[0])}
          fromY={rankToY(currentMove.from[1])}
          toX={fileToX(currentMove.to[0])}
          toY={rankToY(currentMove.to[1])}
          progress={progress}
        />
      )}
      
      {/* Render pieces */}
      {board.flat().map((piece, i) => {
        if (!piece) return null;
        
        const x = i % 8;
        const y = Math.floor(i / 8);
        const pieceSymbol = piece.color === 'w' 
          ? piece.type.toUpperCase() 
          : piece.type.toLowerCase();
        
        // Check if this piece is being animated
        const isMovingPiece = currentMove && 
          currentMove.from === `${String.fromCharCode(97 + x)}${8 - y}`;
        
        // Check if this is the target square (for captures)
        const isTargetSquare = currentMove && 
          currentMove.to === `${String.fromCharCode(97 + x)}${8 - y}`;
        
        if (isMovingPiece && currentMove) {
          return (
            <ChessPiece
              key={`piece-${i}`}
              piece={pieceSymbol}
              x={fileToX(currentMove.from[0])}
              y={rankToY(currentMove.from[1])}
              isAnimating={true}
              targetX={fileToX(currentMove.to[0])}
              targetY={rankToY(currentMove.to[1])}
              progress={progress}
            />
          );
        }
        
        // Don't render piece on target square if it's being captured
        if (isTargetSquare && currentMove?.isCapture) {
          return null;
        }
        
        return (
          <ChessPiece
            key={`piece-${i}`}
            piece={pieceSymbol}
            x={x}
            y={y}
          />
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Board.tsx
git commit -m "feat: add Board component with piece animation"
```

---

## Task 8: Highlight Component

**Files:**
- Create: `src/components/Highlight.tsx`

- [ ] **Step 1: Create Highlight.tsx**

```typescript
import React from 'react';
import { SQUARE_SIZE } from '../lib/constants';

interface HighlightProps {
  x: number; // 0-7
  y: number; // 0-7
  color: string;
}

export const Highlight: React.FC<HighlightProps> = ({ x, y, color }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x * SQUARE_SIZE,
        top: y * SQUARE_SIZE,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        backgroundColor: color,
        pointerEvents: 'none',
      }}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Highlight.tsx
git commit -m "feat: add Highlight component"
```

---

## Task 9: MoveArrow Component

**Files:**
- Create: `src/components/MoveArrow.tsx`

- [ ] **Step 1: Create MoveArrow.tsx**

```typescript
import React from 'react';
import { interpolate } from 'remotion';
import { SQUARE_SIZE, COLORS } from '../lib/constants';

interface MoveArrowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0-1
}

export const MoveArrow: React.FC<MoveArrowProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  progress,
}) => {
  const startX = fromX * SQUARE_SIZE + SQUARE_SIZE / 2;
  const startY = fromY * SQUARE_SIZE + SQUARE_SIZE / 2;
  const endX = toX * SQUARE_SIZE + SQUARE_SIZE / 2;
  const endY = toY * SQUARE_SIZE + SQUARE_SIZE / 2;
  
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  // Calculate arrow head
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowLength = 15;
  const arrowAngle = Math.PI / 6;
  
  const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);
  
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        zIndex: 5,
      }}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={COLORS.arrow}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill={COLORS.arrow}
      />
    </svg>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MoveArrow.tsx
git commit -m "feat: add MoveArrow component"
```

---

## Task 10: PlayerCard Component

**Files:**
- Create: `src/components/PlayerCard.tsx`

- [ ] **Step 1: Create PlayerCard.tsx**

```typescript
import React from 'react';
import { Player } from '../lib/types';
import { COLORS } from '../lib/constants';

interface PlayerCardProps {
  player: Player;
  isTop: boolean; // true = white (top), false = black (bottom)
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isTop }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: COLORS.playerCard,
        borderRadius: '8px',
        flexDirection: isTop ? 'row' : 'row-reverse',
      }}
    >
      {/* Avatar placeholder */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: player.color === 'white' ? '#fff' : '#333',
          border: `2px solid ${player.color === 'white' ? '#ccc' : '#666'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}
      >
        {player.color === 'white' ? '♔' : '♚'}
      </div>
      
      <div style={{ textAlign: isTop ? 'left' : 'right' }}>
        <div
          style={{
            color: COLORS.text,
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          {player.username}
        </div>
        <div
          style={{
            color: '#888',
            fontSize: '14px',
          }}
        >
          {player.rating > 0 ? `(${player.rating})` : ''}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlayerCard.tsx
git commit -m "feat: add PlayerCard component"
```

---

## Task 11: MovesList Component

**Files:**
- Create: `src/components/MovesList.tsx`

- [ ] **Step 1: Create MovesList.tsx**

```typescript
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GameData } from '../lib/types';
import { FRAMES_PER_MOVE, COLORS } from '../lib/constants';

interface MovesListProps {
  gameData: GameData;
}

export const MovesList: React.FC<MovesListProps> = ({ gameData }) => {
  const frame = useCurrentFrame();
  const currentMoveIndex = Math.floor(frame / FRAMES_PER_MOVE);
  
  // Group moves into pairs (white + black)
  const movePairs: { white?: string; black?: string }[] = [];
  for (let i = 0; i < gameData.moves.length; i += 2) {
    movePairs.push({
      white: gameData.moves[i],
      black: gameData.moves[i + 1],
    });
  }
  
  return (
    <div
      style={{
        width: '220px',
        height: '600px',
        backgroundColor: COLORS.playerCard,
        borderRadius: '8px',
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          color: COLORS.text,
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '12px',
          borderBottom: '1px solid #444',
          paddingBottom: '8px',
        }}
      >
        Moves
      </div>
      
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
        }}
      >
        {movePairs.map((pair, i) => {
          const moveNum = i + 1;
          const whiteIndex = (i * 2);
          const blackIndex = (i * 2) + 1;
          
          const isWhiteActive = currentMoveIndex === whiteIndex;
          const isBlackActive = currentMoveIndex === blackIndex;
          
          return (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#666', width: '30px' }}>{moveNum}.</span>
              <span
                style={{
                  color: isWhiteActive ? '#7cb342' : COLORS.text,
                  fontWeight: isWhiteActive ? 'bold' : 'normal',
                  width: '50px',
                }}
              >
                {pair.white || ''}
              </span>
              {pair.black && (
                <span
                  style={{
                    color: isBlackActive ? '#7cb342' : COLORS.text,
                    fontWeight: isBlackActive ? 'bold' : 'normal',
                  }}
                >
                  {pair.black}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MovesList.tsx
git commit -m "feat: add MovesList component"
```

---

## Task 12: Effects Components

**Files:**
- Create: `src/components/Effects/CaptureEffect.tsx`
- Create: `src/components/Effects/CheckEffect.tsx`

- [ ] **Step 1: Create CaptureEffect.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SQUARE_SIZE } from '../../lib/constants';

interface CaptureEffectProps {
  x: number;
  y: number;
  startFrame: number;
}

export const CaptureEffect: React.FC<CaptureEffectProps> = ({
  x,
  y,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;
  
  if (relativeFrame < 0 || relativeFrame > 15) return null;
  
  const opacity = interpolate(relativeFrame, [0, 5, 15], [0.8, 0.6, 0]);
  const scale = interpolate(relativeFrame, [0, 15], [1, 1.5]);
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x * SQUARE_SIZE,
        top: y * SQUARE_SIZE,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        backgroundColor: `rgba(255, 50, 50, ${opacity})`,
        borderRadius: '50%',
        transform: `scale(${scale})`,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  );
};
```

- [ ] **Step 2: Create CheckEffect.tsx**

```typescript
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BOARD_SIZE } from '../../lib/constants';

interface CheckEffectProps {
  startFrame: number;
}

export const CheckEffect: React.FC<CheckEffectProps> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;
  
  if (relativeFrame < 0 || relativeFrame > 30) return null;
  
  const opacity = interpolate(
    relativeFrame,
    [0, 5, 10, 15, 20, 25, 30],
    [0, 0.3, 0, 0.3, 0, 0.3, 0]
  );
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundColor: `rgba(255, 0, 0, ${opacity})`,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    />
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Effects/
git commit -m "feat: add capture and check effects"
```

---

## Task 13: Main ChessGame Composition

**Files:**
- Create: `src/compositions/ChessGame.tsx`

- [ ] **Step 1: Create ChessGame.tsx**

```typescript
import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Board } from '../components/Board';
import { PlayerCard } from '../components/PlayerCard';
import { MovesList } from '../components/MovesList';
import { useChessGame } from '../hooks/useChessGame';
import { VIDEO_WIDTH, VIDEO_HEIGHT, COLORS } from '../lib/constants';
import { GameData } from '../lib/types';

interface ChessGameProps {
  gameData: GameData;
}

export const ChessGame: React.FC<ChessGameProps> = ({ gameData }) => {
  const { totalFrames } = useChessGame(gameData);
  
  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Opening label */}
      {gameData.opening && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            color: COLORS.text,
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {gameData.opening}
        </div>
      )}
      
      {/* White player (top) */}
      <div style={{ position: 'absolute', top: '100px' }}>
        <PlayerCard player={gameData.white} isTop={true} />
      </div>
      
      {/* Board */}
      <div style={{ position: 'relative' }}>
        <Board gameData={gameData} />
      </div>
      
      {/* Black player (bottom) */}
      <div style={{ position: 'absolute', bottom: '100px' }}>
        <PlayerCard player={gameData.black} isTop={false} />
      </div>
      
      {/* Moves list (right side) */}
      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
        <MovesList gameData={gameData} />
      </div>
    </div>
  );
};

// Export composition config
export const ChessGameComposition = () => {
  // Sample game data for preview
  const sampleGame: GameData = {
    id: 'sample',
    white: { username: 'WhitePlayer', rating: 1500, color: 'white' },
    black: { username: 'BlackPlayer', rating: 1500, color: 'black' },
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'],
    result: '*',
    pgn: '[White "WhitePlayer"][Black "BlackPlayer"] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',
  };
  
  return (
    <Composition
      id="ChessGame"
      component={ChessGame}
      durationInFrames={sampleGame.moves.length * 60}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        gameData: sampleGame,
      }}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/compositions/ChessGame.tsx
git commit -m "feat: add main ChessGame composition"
```

---

## Task 14: Root Component

**Files:**
- Create: `src/Root.tsx`
- Modify: `src/index.ts` (if needed)

- [ ] **Step 1: Create Root.tsx**

```typescript
import React from 'react';
import { Composition } from 'remotion';
import { ChessGame } from './compositions/ChessGame';
import { GameData } from './lib/types';

// Sample data for development
const sampleGame: GameData = {
  id: 'sample',
  white: { 
    username: 'FunDeeKubTiktok', 
    rating: 1714, 
    color: 'white' 
  },
  black: { 
    username: 'zola069', 
    rating: 1717, 
    color: 'black' 
  },
  moves: [
    'e4', 'e5', 'Nc3', 'c5', 'Bc4', 'd6', 'd3', 'Nf6',
    'a4', 'Nc6', 'Nxc5', 'dxc5', 'Ne2', 'O-O', 'O-O', 'h6',
    'c3', 'Qe7', 'Kh1', 'a6', 'f4', 'Be6', 'fxe6', 'fxe6'
  ],
  opening: 'Vienna Game',
  result: '*',
  pgn: '[White "FunDeeKubTiktok"][Black "zola069"] 1. e4 e5 2. Nc3 c5 3. Bc4 d6 4. d3 Nf6 5. a4 Nc6 6. Nxc5 dxc5 7. Ne2 O-O 8. O-O h6 9. c3 Qe7 10. Kh1 a6 11. f4 Be6 12. fxe6 fxe6',
};

export const RemotionRoot: React.FC = () => {
  const framesPerMove = 60; // 2 seconds at 30fps
  const totalFrames = sampleGame.moves.length * framesPerMove;
  
  return (
    <>
      <Composition
        id="ChessGame"
        component={ChessGame}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          gameData: sampleGame,
        }}
      />
    </>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/Root.tsx
git commit -m "feat: add Remotion Root component"
```

---

## Task 15: Tailwind Config

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`

- [ ] **Step 1: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 2: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js postcss.config.js
git commit -m "chore: add tailwind config"
```

---

## Task 16: Test and Run

**Files:**
- Run: `npm run dev`

- [ ] **Step 1: Start Remotion Studio**

```bash
cd /Users/kwanchanokroumsuk/chess-video-editor
npm run dev
```

Expected: Remotion Studio starts at http://localhost:3000

- [ ] **Step 2: Verify composition renders**

Check that:
- Board displays with pieces
- Pieces animate between moves
- Player cards show
- Moves list displays

- [ ] **Step 3: Commit final changes**

```bash
git add .
git commit -m "feat: complete chess video editor v1"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Auto-extract PGN from Chess.com URL | Task 3 (useChessAPI) |
| 1080x1920 vertical format | Task 2 (constants) |
| 2 seconds per move | Task 2 (constants) |
| Smooth piece animation | Task 6, 7 (ChessPiece, Board) |
| Highlight squares | Task 8 (Highlight) |
| Move arrows | Task 9 (MoveArrow) |
| Player info display | Task 10 (PlayerCard) |
| Moves list | Task 11 (MovesList) |
| Capture/Check effects | Task 12 (Effects) |
| No audio | N/A (intentional) |

---

## Post-Implementation Notes

### Future Enhancements (not in v1):
- Sound effects integration
- 3D board option
- Custom themes/colors
- Batch processing multiple games
- Opening name auto-detection from API
- Result display at end of game

### Known Limitations:
- Uses sample data for now (URL input needs UI)
- Chess pieces are basic SVGs (can upgrade to better set)
- No sound effects yet
