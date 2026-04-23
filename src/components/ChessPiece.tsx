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
  opacity?: number; // For capture fade-out effect
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  x,
  y,
  isAnimating = false,
  targetX,
  targetY,
  progress = 0,
  opacity = 1,
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
        zIndex: isAnimating ? 20 : 10,
        opacity,
      }}
    >
      <Img
        src={pieceSrc}
        style={{
          width: SQUARE_SIZE * 0.85,
          height: SQUARE_SIZE * 0.85,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />
    </div>
  );
};
