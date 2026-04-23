import React from 'react';
import { Composition } from 'remotion';
import { ChessGame } from './compositions/ChessGame';
import { GameData } from './lib/types';

// Sample data for development
const sampleGame: GameData = {
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
    'e4', 'e5', 'Nc3', 'c5', 'Bc4', 'd6', 'd3', 'Nf6',
    'a4', 'Nc6', 'Nxc5', 'dxc5', 'Ne2', 'O-O', 'O-O', 'h6',
    'c3', 'Qe7', 'Kh1', 'a6', 'f4', 'Be6', 'fxe6', 'fxe6'
  ],
  opening: 'Vienna Game',
  result: '*',
  pgn: '[White "FunDeeKubTiktok"][Black "zola069"] 1. e4 e5 2. Nc3 c5 3. Bc4 d6 4. d3 Nf6 5. a4 Nc6 6. Nxc5 dxc5 7. Ne2 O-O 8. O-O h6 9. c3 Qe7 10. Kh1 a6 11. f4 Be6 12. fxe6 fxe6',
};

export const RemotionRoot: React.FC = () => {
  const framesPerMove = 60; // 2 seconds at 30fps
  const totalFrames = sampleGame.moves.length * framesPerMove;
  
  return (
    <>
      <Composition
        id="ChessGame"
        component={ChessGame}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          gameData: sampleGame,
        }}
      />
    </>
  );
};
