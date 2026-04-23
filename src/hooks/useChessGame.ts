import { useMemo } from 'react';
import { Chess } from 'chess.js';
import { GameData, MoveAnimation } from '../lib/types';
import { FPS, SPEED_PRESETS, SpeedPreset, easeInOutCubic } from '../lib/constants';

export function useChessGame(gameData: GameData, speedPreset: SpeedPreset = 'medium') {
  return useMemo(() => {
    const speedConfig = SPEED_PRESETS[speedPreset];
    const framesPerMove = Math.round(speedConfig.normal * FPS);
    const slowMoveFrames = Math.round(speedConfig.slow * FPS);
    
    const chess = new Chess();
    const positions: string[] = [];
    const moveAnimations: MoveAnimation[] = [];
    const moveDurations: number[] = []; // Duration in frames for each move
    
    // Initial position
    positions.push(chess.fen());
    
    // Play through all moves
    for (const san of gameData.moves) {
      const move = chess.move(san);
      
      if (move) {
        const isCheck = chess.isCheck();
        const isCheckmate = chess.isCheckmate();
        const isCapture = move.captured !== undefined;
        
        moveAnimations.push({
          from: move.from,
          to: move.to,
          piece: move.piece,
          isCapture,
          isCheck,
          isCheckmate,
          isCastle: move.flags.includes('k') || move.flags.includes('q'),
          san: move.san,
        });
        
        // Speed ramping: slow down for important moves
        const isImportantMove = isCheck || isCheckmate || isCapture;
        const duration = isImportantMove ? slowMoveFrames : framesPerMove;
        moveDurations.push(duration);
        
        positions.push(chess.fen());
      }
    }
    
    // Calculate cumulative frames for each move
    const cumulativeFrames: number[] = [0];
    for (let i = 0; i < moveDurations.length; i++) {
      cumulativeFrames.push(cumulativeFrames[i] + moveDurations[i]);
    }
    
    const totalFrames = cumulativeFrames[cumulativeFrames.length - 1];
    
    return {
      positions,
      moveAnimations,
      totalFrames,
      getPositionAtFrame: (frame: number) => {
        // Find which move we're on based on cumulative frames
        let moveIndex = 0;
        for (let i = 0; i < cumulativeFrames.length - 1; i++) {
          if (frame >= cumulativeFrames[i] && frame < cumulativeFrames[i + 1]) {
            moveIndex = i;
            break;
          }
        }
        // Handle last frame
        if (frame >= cumulativeFrames[cumulativeFrames.length - 1]) {
          moveIndex = moveAnimations.length;
        }
        
        const currentMoveStart = cumulativeFrames[moveIndex];
        const currentMoveDuration = moveDurations[moveIndex] || framesPerMove;
        const rawProgress = Math.min(1, (frame - currentMoveStart) / currentMoveDuration);
        // Apply easing for smooth animation
        const progress = easeInOutCubic(rawProgress);
        
        return {
          fen: positions[Math.min(moveIndex, positions.length - 1)],
          currentMove: moveAnimations[moveIndex],
          progress,
          moveIndex,
        };
      },
    };
  }, [gameData, speedPreset]);
}
