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
      
      {/* Evaluation Bar - outside scaled board */}
      {currentMoveAnalysis && (
        <div style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 20,
          height: scaledBoardSize * 0.8,
          backgroundColor: '#222',
          borderRadius: '4px',
          overflow: 'hidden',
          zIndex: 60,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {/* White advantage (top portion) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${Math.max(5, Math.min(95, 50 + (currentMoveAnalysis.evaluation / 100)))}%`,
            backgroundColor: '#fff',
            transition: 'height 0.3s ease',
          }} />
          {/* Evaluation text */}
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            color: Math.abs(currentMoveAnalysis.evaluation) > 500 ? '#fff' : '#333',
            whiteSpace: 'nowrap',
          }}>
            {currentMoveAnalysis.evaluation > 9000 
              ? `M${Math.round((10000 - currentMoveAnalysis.evaluation) / 100)}` 
              : currentMoveAnalysis.evaluation < -9000
              ? `-M${Math.round((10000 + currentMoveAnalysis.evaluation) / 100)}`
              : (currentMoveAnalysis.evaluation / 100).toFixed(1)}
          </div>
        </div>
      )}
      
      {/* Move Classification Badge - outside scaled board */}
      {currentMoveAnalysis && (
        <div style={{
          position: 'absolute',
          top: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 70,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '8px 16px',
          borderRadius: '24px',
        }}>
          {/* Classification icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: getClassificationColor(currentMoveAnalysis.classification),
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {getClassificationIcon(currentMoveAnalysis.classification)}
          </div>
          {/* Classification text */}
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            textTransform: 'capitalize',
          }}>
            {currentMoveAnalysis.classification}
          </span>
          {/* Evaluation */}
          <span style={{
            fontSize: '14px',
            color: currentMoveAnalysis.evaluation > 0 ? '#4caf50' : currentMoveAnalysis.evaluation < 0 ? '#e53935' : '#aaa',
            fontWeight: '500',
          }}>
            {currentMoveAnalysis.evaluation > 0 ? '+' : ''}{(currentMoveAnalysis.evaluation / 100).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};

// Helper functions for classification display
function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    'brilliant': '#1e88e5', // Blue
    'best': '#4caf50',      // Green
    'great': '#8bc34a',     // Light green
    'excellent': '#9ccc65', // Yellow-green
    'good': '#c0ca33',      // Yellow
    'book': '#8d6e63',      // Brown
    'inaccuracy': '#ff9800', // Orange
    'mistake': '#f57c00',    // Dark orange
    'blunder': '#e53935',    // Red
    'miss': '#d32f2f',       // Dark red
  };
  return colors[classification] || '#757575';
}

function getClassificationIcon(classification: string): string {
  const icons: Record<string, string> = {
    'brilliant': '!!',
    'best': '★',
    'great': '!',
    'excellent': '✓',
    'good': '✓',
    'book': '📖',
    'inaccuracy': '?!',
    'mistake': '?',
    'blunder': '??',
    'miss': '○',
  };
  return icons[classification] || '•';
}
