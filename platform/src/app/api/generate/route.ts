import { NextResponse } from 'next/server';
import { renderMedia, selectComposition } from '@remotion/renderer';
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
    const outputDir = path.join(process.cwd(), 'public', 'videos');
    const outputPath = path.join(outputDir, `chess-game-${gameId}.mp4`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if video already exists
    if (fs.existsSync(outputPath)) {
      return NextResponse.json({
        videoUrl: `/videos/chess-game-${gameId}.mp4`,
        message: 'Video already exists',
      });
    }

    // Fetch game data from Chess.com
    const response = await fetch(`https://api.chess.com/pub/game/${gameId}`);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch game from Chess.com' },
        { status: 404 }
      );
    }

    const gameData = await response.json();

    // Parse PGN to get moves
    const pgn = gameData.pgn || '';
    const moves = parsePGN(pgn);

    // Prepare input props for Remotion
    const inputProps = {
      gameData: {
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
      }
    };

    // Get the entry point
    const entryPoint = path.join(process.cwd(), '..', 'src', 'index.ts');

    // Select composition
    const composition = await selectComposition({
      serveUrl: entryPoint,
      id: 'ChessGame',
      inputProps,
    });

    if (!composition) {
      return NextResponse.json(
        { error: 'Composition not found' },
        { status: 500 }
      );
    }

    // Render video
    await renderMedia({
      composition,
      serveUrl: entryPoint,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    });

    return NextResponse.json({
      videoUrl: `/videos/chess-game-${gameId}.mp4`,
      message: 'Video generated successfully',
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
