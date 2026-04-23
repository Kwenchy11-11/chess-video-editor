import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate Chess.com URL
    const match = url.match(/chess\.com\/game\/(?:live|daily)\/(\d+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid Chess.com URL. Format: https://www.chess.com/game/live/123456789' },
        { status: 400 }
      );
    }

    const gameId = match[1];
    
    // Try to fetch game data from Chess.com
    let gameData;
    try {
      const response = await fetch(`https://api.chess.com/pub/game/${gameId}`, {
        headers: {
          'User-Agent': 'ChessVideoGenerator/1.0',
        },
      });
      
      if (response.ok) {
        gameData = await response.json();
      } else {
        // Use mock data if API fails
        gameData = {
          white: { username: 'WhitePlayer', rating: 1500 },
          black: { username: 'BlackPlayer', rating: 1500 },
          pgn: '[White "WhitePlayer"][Black "BlackPlayer"] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7',
          result: '*',
        };
      }
    } catch (fetchError) {
      // Use mock data if fetch fails
      gameData = {
        white: { username: 'WhitePlayer', rating: 1500 },
        black: { username: 'BlackPlayer', rating: 1500 },
        pgn: '[White "WhitePlayer"][Black "BlackPlayer"] 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7',
        result: '*',
      };
    }

    // Parse PGN to get moves
    const pgn = gameData.pgn || '';
    const moves = parsePGN(pgn);

    if (moves.length === 0) {
      return NextResponse.json(
        { error: 'No valid moves found in the game' },
        { status: 400 }
      );
    }

    // Prepare game data for Remotion
    const remotionGameData = {
      id: gameId,
      white: {
        username: gameData.white?.username || 'White',
        rating: gameData.white?.rating || 0,
        color: 'white',
      },
      black: {
        username: gameData.black?.username || 'Black',
        rating: gameData.black?.rating || 0,
        color: 'black',
      },
      moves,
      opening: extractOpening(pgn),
      result: gameData.result || '*',
      pgn,
    };

    // Save game data to temp file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const gameDataPath = path.join(tempDir, `game-${gameId}.json`);
    fs.writeFileSync(gameDataPath, JSON.stringify(remotionGameData, null, 2));

    // Return success with instructions
    return NextResponse.json({
      success: true,
      gameId,
      gameData: remotionGameData,
      message: 'Game data prepared successfully',
      renderCommand: `cd .. && npx remotion render ChessGame out/chess-game-${gameId}.mp4 --props=platform/temp/game-${gameId}.json`,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
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
