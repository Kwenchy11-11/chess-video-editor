import React from 'react';
import { Board } from '../components/Board';
import { PlayerCard } from '../components/PlayerCard';
import { MovesList } from '../components/MovesList';
import { useChessGame } from '../hooks/useChessGame';
import { VIDEO_WIDTH, VIDEO_HEIGHT, COLORS } from '../lib/constants';
import { GameData } from '../lib/types';

interface ChessGameProps {
  gameData: GameData;
}

export const ChessGame: React.FC<ChessGameProps> = ({ gameData }) => {
  const { totalFrames } = useChessGame(gameData);
  
  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Opening label */}
      {gameData.opening && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            color: COLORS.text,
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {gameData.opening}
        </div>
      )}
      
      {/* White player (top) */}
      <div style={{ position: 'absolute', top: '100px' }}>
        <PlayerCard player={gameData.white} isTop={true} />
      </div>
      
      {/* Board */}
      <div style={{ position: 'relative' }}>
        <Board gameData={gameData} />
      </div>
      
      {/* Black player (bottom) */}
      <div style={{ position: 'absolute', bottom: '100px' }}>
        <PlayerCard player={gameData.black} isTop={false} />
      </div>
      
      {/* Moves list (right side) */}
      <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
        <MovesList gameData={gameData} />
      </div>
    </div>
  );
};
