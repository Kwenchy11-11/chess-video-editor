import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
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
