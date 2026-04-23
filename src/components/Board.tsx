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
