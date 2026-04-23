import React from 'react';
import { Composition, getInputProps } from 'remotion';
import { Chess } from 'chess.js';
import { ChessGame } from './compositions/ChessGame';
import { GameData } from './lib/types';
import { FRAMES_PER_MOVE, SLOW_MOVE_FRAMES, ENDING_PAUSE_FRAMES } from './lib/constants';

// Default sample data - complete game with checkmate (Opera Game - Morphy vs Duke)
const defaultGame: GameData = {
  id: 'sample',
  white: { 
    username: 'FunDeeKubTiktok', 
    rating: 1714, 
    color: 'white' 
  },
  black: { 
    username: 'zola069', 
    rating: 1717, 
    color: 'black' 
  },
  moves: [
    'e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3',
    'Qxf3', 'dxe5', 'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3',
    'c6', 'Bg5', 'b5', 'Nxb5', 'cxb5', 'Bxb5+', 'Nbd7',
    'O-O-O', 'Rd8', 'Rxd7', 'Rxd7', 'Rd1', 'Qe6',
    'Bxd7+', 'Nxd7', 'Qb8+', 'Nxb8', 'Rd8#'
  ],
  opening: 'Philidor Defense',
  result: '1-0',
  pgn: '[White "FunDeeKubTiktok"][Black "zola069"][Result "1-0"] 1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#',
};

// Calculate total frames with speed ramping and ending pause
function calculateTotalFrames(gameData: GameData): number {
  const chess = new Chess();
  let totalFrames = 0;
  let isCheckmate = false;
  
  for (const san of gameData.moves) {
    const move = chess.move(san);
    if (move) {
      const isImportant = chess.isCheck() || chess.isCheckmate() || move.captured !== undefined;
      totalFrames += isImportant ? SLOW_MOVE_FRAMES : FRAMES_PER_MOVE;
      if (chess.isCheckmate()) {
        isCheckmate = true;
      }
    }
  }
  
  // Add ending pause for checkmate
  if (isCheckmate) {
    totalFrames += ENDING_PAUSE_FRAMES;
  }
  
  return totalFrames;
}

export const RemotionRoot: React.FC = () => {
  // Get input props from Remotion (for dynamic rendering)
  const inputProps = getInputProps() as { gameData?: GameData };
  const gameData = inputProps?.gameData || defaultGame;
  
  const totalFrames = calculateTotalFrames(gameData);
  
  return (
    <>
      <Composition
        id="ChessGame"
        component={ChessGame as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          gameData,
        }}
      />
    </>
  );
};
