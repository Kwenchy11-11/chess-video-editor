import { useState, useEffect, useCallback } from 'react';
import { GameData, GameAnalysis, MoveAnalysis } from '../lib/types';
import { initStockfish, analyzeGame } from '../lib/analysis';

interface UseGameAnalysisReturn {
  analysis: GameAnalysis | null;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
  analyze: () => Promise<void>;
}

export function useGameAnalysis(gameData: GameData): UseGameAnalysisReturn {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<any>(null);
  
  // Initialize engine on mount
  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        const sf = await initStockfish();
        if (mounted) {
          setEngine(sf);
        }
      } catch (err) {
        console.error('Failed to init Stockfish:', err);
        if (mounted) {
          setError('Failed to initialize chess engine');
        }
      }
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Analyze game
  const analyze = useCallback(async () => {
    if (!engine) {
      setError('Engine not ready');
      return;
    }
    
    if (!gameData.moves.length) {
      setError('No moves to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      const result = await analyzeGame(
        engine,
        gameData.moves,
        (p) => setProgress(Math.round(p * 100))
      );
      
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [engine, gameData.moves]);
  
  // Auto-analyze when engine is ready
  useEffect(() => {
    if (engine && !analysis && !isAnalyzing && gameData.moves.length > 0) {
      analyze();
    }
  }, [engine, analysis, isAnalyzing, gameData.moves, analyze]);
  
  return {
    analysis,
    isAnalyzing,
    progress,
    error,
    analyze,
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
