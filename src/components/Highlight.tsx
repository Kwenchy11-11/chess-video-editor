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
