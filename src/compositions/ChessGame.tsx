import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Board } from '../components/Board';
import { useChessGame } from '../hooks/useChessGame';
import { VIDEO_WIDTH, VIDEO_HEIGHT, BOARD_SIZE, ENDING_PAUSE_FRAMES, SpeedPreset } from '../lib/constants';
import { GameData, MoveAnalysis } from '../lib/types';
import { useGameAnalysis, useMoveAnalysis } from '../hooks/useGameAnalysis';

// Style variants - easy to add more later (Sporty, Retro, Bold)
type StyleVariant = 'minimal-clean' | 'sporty-esports' | 'retro-pixel' | 'bold-impact';

interface StyleConfig {
  fontFamily: string;
  backgroundColor: string;
  checkmateBadge: {
    backgroundColor: string;
    color: string;
    fontSize: string;
    fontWeight: string;
    textTransform: string;
    letterSpacing: string;
    boxShadow: string;
    borderRadius: string;
    padding: string;
  };
  winnerBadge: {
    backgroundColor: string;
    color: string;
    fontSize: string;
    fontWeight: string;
    boxShadow: string;
    borderRadius: string;
    padding: string;
  };
  overlay: {
    backgroundColor: string;
  };
}

const styleConfigs: Record<StyleVariant, StyleConfig> = {
  'minimal-clean': {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0a0a0a',
    checkmateBadge: {
      backgroundColor: '#dc2626', // Clean red
      color: '#ffffff',
      fontSize: '44px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      padding: '14px 36px',
    },
    winnerBadge: {
      backgroundColor: '#16a34a', // Clean green
      color: '#ffffff',
      fontSize: '26px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '6px',
      padding: '10px 28px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
  // Placeholders for future styles
  'sporty-esports': {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#0a0a0a',
    checkmateBadge: {
      backgroundColor: '#e74c3c',
      color: '#ffffff',
      fontSize: '48px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '4px',
      boxShadow: '0 8px 32px rgba(231, 76, 60, 0.5)',
      borderRadius: '12px',
      padding: '16px 40px',
    },
    winnerBadge: {
      backgroundColor: '#27ae60',
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: 'bold',
      boxShadow: '0 4px 16px rgba(39, 174, 96, 0.4)',
      borderRadius: '8px',
      padding: '12px 32px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  },
  'retro-pixel': {
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: '#0a0a0a',
    checkmateBadge: {
      backgroundColor: '#e74c3c',
      color: '#ffffff',
      fontSize: '48px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '4px',
      boxShadow: '0 8px 32px rgba(231, 76, 60, 0.5)',
      borderRadius: '12px',
      padding: '16px 40px',
    },
    winnerBadge: {
      backgroundColor: '#27ae60',
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: 'bold',
      boxShadow: '0 4px 16px rgba(39, 174, 96, 0.4)',
      borderRadius: '8px',
      padding: '12px 32px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  },
  'bold-impact': {
    fontFamily: 'Inter, system-ui, sans-serif',
    backgroundColor: '#0a0a0a',
    checkmateBadge: {
      backgroundColor: '#e74c3c',
      color: '#ffffff',
      fontSize: '48px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '4px',
      boxShadow: '0 8px 32px rgba(231, 76, 60, 0.5)',
      borderRadius: '12px',
      padding: '16px 40px',
    },
    winnerBadge: {
      backgroundColor: '#27ae60',
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: 'bold',
      boxShadow: '0 4px 16px rgba(39, 174, 96, 0.4)',
      borderRadius: '8px',
      padding: '12px 32px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  },
};

interface ChessGameProps {
  gameData: GameData;
  styleVariant?: StyleVariant; // Optional - defaults to minimal-clean
  speed?: SpeedPreset; // Optional - defaults to medium
}

export const ChessGame: React.FC<ChessGameProps> = ({ 
  gameData, 
  styleVariant = 'minimal-clean', // Default to minimal clean
  speed = 'medium', // Default speed
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { totalFrames, moveAnimations, getPositionAtFrame } = useChessGame(gameData, speed);
  
  // Get game analysis
  const { analysis, isAnalyzing, progress: analysisProgress } = useGameAnalysis(gameData);
  
  // Get current move index
  const { moveIndex } = getPositionAtFrame(frame);
  
  // Get analysis for current move
  const currentMoveAnalysis = analysis?.moves[moveIndex] || null;
  
  // Get style config based on variant
  const style = styleConfigs[styleVariant];
  
  // Check if we're in the ending pause period
  const isEndingPause = frame >= totalFrames;
  const endingProgress = isEndingPause ? Math.min(1, (frame - totalFrames) / (ENDING_PAUSE_FRAMES * 0.5)) : 0;
  
  // Check if the game ended with checkmate
  const lastMove = moveAnimations[moveAnimations.length - 1];
  const isCheckmate = lastMove?.isCheckmate || false;
  const winner = gameData.result === '1-0' ? gameData.white.username : 
                 gameData.result === '0-1' ? gameData.black.username : null;
  const winnerColor = gameData.result === '1-0' ? 'w' : 
                      gameData.result === '0-1' ? 'b' : null;
  
  // TikTok style - board fills most of the screen
  const boardScale = 0.95; // 95% of screen width
  const scaledBoardSize = VIDEO_WIDTH * boardScale;
  
  return (
    <div
      style={{
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        backgroundColor: style.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: style.fontFamily,
      }}
    >
      {/* Analysis loading indicator */}
      {isAnalyzing && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          padding: '8px 16px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '20px',
          color: '#fff',
          fontSize: '12px',
          zIndex: 100,
        }}>
          Analyzing... {analysisProgress}%
        </div>
      )}
      
      {/* Board with game end indicators */}
      <div style={{ 
        position: 'relative',
        transform: `scale(${scaledBoardSize / BOARD_SIZE})`,
        transformOrigin: 'center center',
      }}>
        <Board 
          gameData={gameData} 
          isCheckmate={isEndingPause && isCheckmate}
          showWinner={isEndingPause && winner !== null}
          winnerColor={winnerColor}
          endingProgress={endingProgress}
          currentMoveAnalysis={currentMoveAnalysis}
          showEvaluation={true}
        />
      </div>
    </div>
  );
};
