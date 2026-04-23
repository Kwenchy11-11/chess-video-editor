import React from 'react';
import { Composition, getInputProps } from 'remotion';
import { ChessGame } from './compositions/ChessGame';
import { GameData } from './lib/types';

// Default sample data
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
    'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6',
    'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O',
    'h3', 'Nb8', 'd4', 'Nbd7', 'c4', 'c6', 'cxb5', 'axb5'
  ],
  opening: 'Ruy Lopez',
  result: '*',
  pgn: '[White "FunDeeKubTiktok"][Black "zola069"] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5',
};

export const RemotionRoot: React.FC = () => {
  // Get input props from Remotion (for dynamic rendering)
  const inputProps = getInputProps() as { gameData?: GameData };
  const gameData = inputProps?.gameData || defaultGame;
  
  const framesPerMove = 60; // 2 seconds at 30fps
  const totalFrames = gameData.moves.length * framesPerMove;
  
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
          gameData,
        }}
      />
    </>
  );
};
