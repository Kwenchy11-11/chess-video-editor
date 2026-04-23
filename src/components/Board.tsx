import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { BOARD_SIZE, SQUARE_SIZE, COLORS } from '../lib/constants';
import { useChessGame } from '../hooks/useChessGame';
import { GameData, MoveAnalysis } from '../lib/types';

interface BoardProps {
  gameData: GameData;
  isCheckmate?: boolean;
  showWinner?: boolean;
  winnerColor?: 'w' | 'b' | null;
  endingProgress?: number;
  currentMoveAnalysis?: MoveAnalysis | null;
  showEvaluation?: boolean;
}

export const Board: React.FC<BoardProps> = ({ 
  gameData,
  isCheckmate = false,
  showWinner = false,
  winnerColor = null,
  endingProgress = 0,
  currentMoveAnalysis = null,
  showEvaluation = true,
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
      
      {/* Evaluation Bar - shows current position evaluation */}
      {showEvaluation && currentMoveAnalysis && (
        <div style={{
          position: 'absolute',
          right: -20,
          top: 0,
          width: 16,
          height: BOARD_SIZE,
          backgroundColor: '#333',
          borderRadius: '4px',
          overflow: 'hidden',
          zIndex: 60,
        }}>
          {/* White advantage (top portion) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.max(5, Math.min(95, 50 + (currentMoveAnalysis.evaluation / 100)))}%`,
            backgroundColor: '#fff',
            transition: 'height 0.3s ease',
          }} />
          {/* Evaluation text */}
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: Math.abs(currentMoveAnalysis.evaluation) > 500 ? '#fff' : '#333',
            whiteSpace: 'nowrap',
          }}>
            {currentMoveAnalysis.evaluation > 9000 
              ? `M${Math.round((10000 - currentMoveAnalysis.evaluation) / 100)}` 
              : currentMoveAnalysis.evaluation < -9000
              ? `-M${Math.round((10000 + currentMoveAnalysis.evaluation) / 100)}`
              : (currentMoveAnalysis.evaluation / 100).toFixed(1)}
          </div>
        </div>
      )}
      
      {/* Move Classification Badge */}
      {currentMoveAnalysis && progress >= 1 && (
        <div style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 70,
        }}>
          {/* Classification icon */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: getClassificationColor(currentMoveAnalysis.classification),
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {getClassificationIcon(currentMoveAnalysis.classification)}
          </div>
          {/* Classification text */}
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
            textTransform: 'capitalize',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {currentMoveAnalysis.classification}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper functions for classification display
function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    'brilliant': '#1e88e5', // Blue
    'best': '#4caf50',      // Green
    'great': '#8bc34a',     // Light green
    'excellent': '#9ccc65', // Yellow-green
    'good': '#c0ca33',      // Yellow
    'book': '#8d6e63',      // Brown
    'inaccuracy': '#ff9800', // Orange
    'mistake': '#f57c00',    // Dark orange
    'blunder': '#e53935',    // Red
    'miss': '#d32f2f',       // Dark red
  };
  return colors[classification] || '#757575';
}

function getClassificationIcon(classification: string): string {
  const icons: Record<string, string> = {
    'brilliant': '!!',
    'best': '★',
    'great': '!',
    'excellent': '✓',
    'good': '✓',
    'book': '📖',
    'inaccuracy': '?!',
    'mistake': '?',
    'blunder': '??',
    'miss': '○',
  };
  return icons[classification] || '•';
}
