import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const { gameData } = await request.json();

    if (!gameData || !gameData.moves || gameData.moves.length === 0) {
      return NextResponse.json(
        { error: 'Invalid game data' },
        { status: 400 }
      );
    }

    const gameId = gameData.id || `game-${Date.now()}`;
    
    // Save game data to temp file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const gameDataPath = path.join(tempDir, `${gameId}.json`);
    fs.writeFileSync(gameDataPath, JSON.stringify(gameData, null, 2));

    return NextResponse.json({
      success: true,
      gameId,
      message: 'Game data saved successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
