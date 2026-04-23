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
