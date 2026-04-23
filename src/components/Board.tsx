import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { BOARD_SIZE, SQUARE_SIZE, COLORS } from '../lib/constants';
import { useChessGame } from '../hooks/useChessGame';
import { GameData } from '../lib/types';

interface BoardProps {
  gameData: GameData;
  isCheckmate?: boolean;
  showWinner?: boolean;
  winnerColor?: 'w' | 'b' | null;
  endingProgress?: number;
}

export const Board: React.FC<BoardProps> = ({ 
  gameData,
  isCheckmate = false,
  showWinner = false,
  winnerColor = null,
  endingProgress = 0,
}) => {
  const frame = useCurrentFrame();
  const { getPositionAtFrame } = useChessGame(gameData);
  
  const { fen, currentMove, progress } = getPositionAtFrame(frame);
  const chess = new Chess(fen);
  
  // Parse FEN to get piece positions
  const board = chess.board();
  
  // Convert algebraic to coordinates (0-7)
  const fileToX = (file: string) => file.charCodeAt(0) - 97;
  const rankToY = (rank: string) => 8 - parseInt(rank);
  
  // Find king positions for checkmate/winner display
  const findKingPosition = (color: 'w' | 'b') => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = board[y][x];
        if (piece && piece.type === 'k' && piece.color === color) {
          return { x, y };
        }
      }
    }
    return null;
  };
  
  const losingKingPos = isCheckmate ? findKingPosition(winnerColor === 'w' ? 'b' : 'w') : null;
  const winningKingPos = showWinner ? findKingPosition(winnerColor || 'w') : null;
  
  return (
    <div
      style={{
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        position: 'relative',
        backgroundColor: COLORS.lightSquare,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
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
              zIndex: 1,
            }}
          />
        );
      })}
      
      {/* Highlight squares for last move - show AFTER move completes like chess.com */}
      {currentMove && progress >= 1 && (
        <>
          {/* From square - bright yellow */}
          <div style={{
            position: 'absolute',
            left: fileToX(currentMove.from[0]) * SQUARE_SIZE,
            top: rankToY(currentMove.from[1]) * SQUARE_SIZE,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            backgroundColor: 'rgba(255, 235, 100, 0.6)',
            zIndex: 15,
            pointerEvents: 'none',
          }} />
          {/* To square - bright yellow */}
          <div style={{
            position: 'absolute',
            left: fileToX(currentMove.to[0]) * SQUARE_SIZE,
            top: rankToY(currentMove.to[1]) * SQUARE_SIZE,
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            backgroundColor: 'rgba(255, 235, 100, 0.6)',
            zIndex: 15,
            pointerEvents: 'none',
          }} />
        </>
      )}


      
      {/* Render pieces */}
      {board.flat().map((piece, i) => {
        if (!piece) return null;
        
        const x = i % 8;
        const y = Math.floor(i / 8);
        const pieceSymbol = piece.color === 'w' 
          ? piece.type.toUpperCase() 
          : piece.type.toLowerCase();
        
        const isMovingPiece = currentMove && 
          currentMove.from === `${String.fromCharCode(97 + x)}${8 - y}`;
        
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
        
        // Captured piece: show until animation completes (like chess.com)
        if (isTargetSquare && currentMove?.isCapture) {
          // Fade out in the last 20% of animation
          const fadeOutProgress = Math.max(0, (progress - 0.8) / 0.2);
          const opacity = 1 - fadeOutProgress;
          
          if (opacity <= 0) return null;
          
          return (
            <ChessPiece
              key={`piece-${i}`}
              piece={pieceSymbol}
              x={x}
              y={y}
              opacity={opacity}
            />
          );
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
      
      {/* Checkmate indicator - red border on losing king's square */}
      {isCheckmate && losingKingPos && (
        <div style={{
          position: 'absolute',
          left: losingKingPos.x * SQUARE_SIZE,
          top: losingKingPos.y * SQUARE_SIZE,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
          border: `${4 * endingProgress}px solid #dc2626`,
          backgroundColor: `rgba(220, 38, 38, ${0.3 * endingProgress})`,
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Checkmate # symbol */}
          <span style={{
            fontSize: `${SQUARE_SIZE * 0.5}px`,
            fontWeight: 'bold',
            color: '#dc2626',
            opacity: endingProgress,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>
            #
          </span>
        </div>
      )}
      
      {/* Winner indicator - green border with crown on winning king's square */}
      {showWinner && winningKingPos && (
        <div style={{
          position: 'absolute',
          left: winningKingPos.x * SQUARE_SIZE,
          top: winningKingPos.y * SQUARE_SIZE,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
          border: `${4 * endingProgress}px solid #16a34a`,
          backgroundColor: `rgba(22, 163, 74, ${0.2 * endingProgress})`,
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Crown icon */}
          <span style={{
            fontSize: `${SQUARE_SIZE * 0.6}px`,
            opacity: endingProgress,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}>
            👑
          </span>
        </div>
      )}
    </div>
  );
};
