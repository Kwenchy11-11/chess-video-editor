import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GameData } from '../lib/types';
import { FRAMES_PER_MOVE, COLORS } from '../lib/constants';

interface MovesListProps {
  gameData: GameData;
}

export const MovesList: React.FC<MovesListProps> = ({ gameData }) => {
  const frame = useCurrentFrame();
  const currentMoveIndex = Math.floor(frame / FRAMES_PER_MOVE);
  
  // Group moves into pairs (white + black)
  const movePairs: { white?: string; black?: string }[] = [];
  for (let i = 0; i < gameData.moves.length; i += 2) {
    movePairs.push({
      white: gameData.moves[i],
      black: gameData.moves[i + 1],
    });
  }
  
  return (
    <div
      style={{
        width: '220px',
        height: '600px',
        backgroundColor: COLORS.playerCard,
        borderRadius: '8px',
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          color: COLORS.text,
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '12px',
          borderBottom: '1px solid #444',
          paddingBottom: '8px',
        }}
      >
        Moves
      </div>
      
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
        }}
      >
        {movePairs.map((pair, i) => {
          const moveNum = i + 1;
          const whiteIndex = (i * 2);
          const blackIndex = (i * 2) + 1;
          
          const isWhiteActive = currentMoveIndex === whiteIndex;
          const isBlackActive = currentMoveIndex === blackIndex;
          
          return (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#666', width: '30px' }}>{moveNum}.</span>
              <span
                style={{
                  color: isWhiteActive ? '#7cb342' : COLORS.text,
                  fontWeight: isWhiteActive ? 'bold' : 'normal',
                  width: '50px',
                }}
              >
                {pair.white || ''}
              </span>
              {pair.black && (
                <span
                  style={{
                    color: isBlackActive ? '#7cb342' : COLORS.text,
                    fontWeight: isBlackActive ? 'bold' : 'normal',
                  }}
                >
                  {pair.black}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
