import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const platformDir = process.cwd();
    const rootDir = path.join(platformDir, '..');
    const tempDir = path.join(platformDir, 'temp');
    const gameDataPath = path.join(tempDir, `${gameId}.json`);
    const outputDir = path.join(platformDir, 'public', 'videos');
    const outputPath = path.join(outputDir, `chess-game-${gameId}.mp4`);

    // Check if game data exists
    if (!fs.existsSync(gameDataPath)) {
      return NextResponse.json(
        { error: 'Game data not found. Please prepare the game first.' },
        { status: 404 }
      );
    }

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

    // Render video using Remotion CLI
    const renderCommand = `cd "${rootDir}" && npx remotion render ChessGame "${outputPath}" --props="platform/temp/${gameId}.json" 2>&1`;
    
    console.log('Executing:', renderCommand);
    
    try {
      const { stdout, stderr } = await execAsync(renderCommand, { 
        timeout: 300000, // 5 minutes
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });
      
      console.log('Render stdout:', stdout);
      if (stderr) console.log('Render stderr:', stderr);

      // Check if video was created
      if (!fs.existsSync(outputPath)) {
        return NextResponse.json(
          { error: 'Video file was not created', output: stdout, stderr },
          { status: 500 }
        );
      }

      return NextResponse.json({
        videoUrl: `/videos/chess-game-${gameId}.mp4`,
        message: 'Video rendered successfully',
        output: stdout,
      });
    } catch (execError) {
      console.error('Render execution error:', execError);
      return NextResponse.json(
        { 
          error: 'Failed to render video: ' + (execError instanceof Error ? execError.message : 'Unknown error'),
          details: execError instanceof Error ? execError.stack : undefined
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
