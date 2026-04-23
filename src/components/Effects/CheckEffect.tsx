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
