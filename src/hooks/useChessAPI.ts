import { useState, useEffect } from 'react';
import { GameData } from '../lib/types';

export function useChessAPI(url: string) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Extract game ID from URL
        const match = url.match(/chess\.com\/game\/(?:live|daily)\/(\d+)/);
        if (!match) {
          throw new Error('Invalid Chess.com URL');
        }
        
        const gameId = match[1];
        
        // Fetch from Chess.com public API
        const response = await fetch(`https://api.chess.com/pub/game/${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game');
        }
        
        const data = await response.json();
        
        // Parse PGN to get moves
        const pgn = data.pgn || '';
        const moves = parsePGN(pgn);
        
        const gameData: GameData = {
          id: gameId,
          white: {
            username: data.white?.username || 'White',
            rating: data.white?.rating || 0,
            color: 'white',
          },
          black: {
            username: data.black?.username || 'Black',
            rating: data.black?.rating || 0,
            color: 'black',
          },
          moves,
          opening: extractOpening(pgn),
          result: data.result || '*',
          pgn,
        };
        
        setGameData(gameData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGame();
  }, [url]);

  return { gameData, loading, error };
}

function parsePGN(pgn: string): string[] {
  // Remove headers
  const movesText = pgn.replace(/\[.*?\]/g, '').trim();
  
  // Extract moves (remove move numbers and result)
  const moves = movesText
    .replace(/\d+\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));
  
  return moves;
}

function extractOpening(pgn: string): string | undefined {
  const match = pgn.match(/\[Opening "([^"]+)"\]/);
  return match ? match[1] : undefined;
}
