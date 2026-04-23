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
