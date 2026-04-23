import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

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

    // Read game data to pass as props
    const gameData = JSON.parse(fs.readFileSync(gameDataPath, 'utf-8'));
    
    // Create a temporary props file in the root directory for Remotion
    // The props file should have the gameData at the root level
    const propsFilePath = path.join(rootDir, `temp-props-${gameId}.json`);
    fs.writeFileSync(propsFilePath, JSON.stringify({ gameData }));

    // Render video using Remotion CLI with spawn for better control
    return new Promise((resolve) => {
      const renderProcess = spawn(
        'npx',
        [
          'remotion',
          'render',
          'ChessGame',
          outputPath,
          `--props=${propsFilePath}`,
          '--log=verbose'
        ],
        {
          cwd: rootDir,
          timeout: 300000, // 5 minutes
        }
      );

      let stdout = '';
      let stderr = '';

      renderProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Render stdout:', data.toString());
      });

      renderProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('Render stderr:', data.toString());
      });

      renderProcess.on('close', (code) => {
        // Clean up temp props file
        try {
          if (fs.existsSync(propsFilePath)) {
            fs.unlinkSync(propsFilePath);
          }
        } catch (e) {
          console.error('Failed to clean up props file:', e);
        }

        if (code !== 0) {
          resolve(
            NextResponse.json(
              { 
                error: 'Video rendering failed',
                exitCode: code,
                stderr: stderr.slice(-2000), // Last 2000 chars
                stdout: stdout.slice(-2000),
              },
              { status: 500 }
            )
          );
          return;
        }

        // Check if video was created
        if (!fs.existsSync(outputPath)) {
          resolve(
            NextResponse.json(
              { 
                error: 'Video file was not created',
                output: stdout,
                stderr 
              },
              { status: 500 }
            )
          );
          return;
        }

        resolve(
          NextResponse.json({
            videoUrl: `/videos/chess-game-${gameId}.mp4`,
            message: 'Video rendered successfully',
          })
        );
      });

      renderProcess.on('error', (error) => {
        // Clean up temp props file
        try {
          if (fs.existsSync(propsFilePath)) {
            fs.unlinkSync(propsFilePath);
          }
        } catch (e) {
          console.error('Failed to clean up props file:', e);
        }

        resolve(
          NextResponse.json(
            { 
              error: 'Failed to start render process: ' + error.message,
            },
            { status: 500 }
          )
        );
      });
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
