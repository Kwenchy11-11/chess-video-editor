import { useState, useEffect, useMemo } from 'react';
import { GameData, GameAnalysis, MoveAnalysis } from '../lib/types';
import { analyzeGameHeuristic } from '../lib/analysis';

interface UseGameAnalysisReturn {
  analysis: GameAnalysis | null;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
}

// Hook for game analysis - uses heuristic-based analysis for immediate results
// This works synchronously for Remotion video rendering
export function useGameAnalysis(gameData: GameData): UseGameAnalysisReturn {
  // Use memo to compute analysis immediately (synchronous)
  const analysis = useMemo(() => {
    if (!gameData.moves.length) return null;
    
    try {
      // Use heuristic-based analysis for instant results
      return analyzeGameHeuristic(gameData);
    } catch (err) {
      console.error('Analysis computation failed:', err);
      return null;
    }
  }, [gameData]);
  
  // Since heuristic analysis is instant, we don't show loading state
  return {
    analysis,
    isAnalyzing: false,
    progress: 100,
    error: null,
  };
}

// Hook for getting analysis of a specific move
export function useMoveAnalysis(
  analysis: GameAnalysis | null,
  moveIndex: number
): MoveAnalysis | null {
  if (!analysis) return null;
  return analysis.moves[moveIndex] || null;
}
