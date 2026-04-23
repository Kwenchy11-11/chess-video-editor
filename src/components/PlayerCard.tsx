import React from 'react';
import { Player } from '../lib/types';
import { COLORS } from '../lib/constants';

interface PlayerCardProps {
  player: Player;
  isTop: boolean; // true = white (top), false = black (bottom)
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isTop }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: COLORS.playerCard,
        borderRadius: '8px',
        flexDirection: isTop ? 'row' : 'row-reverse',
      }}
    >
      {/* Avatar placeholder */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: player.color === 'white' ? '#fff' : '#333',
          border: `2px solid ${player.color === 'white' ? '#ccc' : '#666'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}
      >
        {player.color === 'white' ? '♔' : '♚'}
      </div>
      
      <div style={{ textAlign: isTop ? 'left' : 'right' }}>
        <div
          style={{
            color: COLORS.text,
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          {player.username}
        </div>
        <div
          style={{
            color: '#888',
            fontSize: '14px',
          }}
        >
          {player.rating > 0 ? `(${player.rating})` : ''}
        </div>
      </div>
    </div>
  );
};
