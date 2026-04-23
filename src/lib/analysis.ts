import { Chess } from 'chess.js';
import { MoveAnalysis, GameAnalysis, MoveClassification, GameData } from './types';

// Stockfish WASM engine wrapper
let stockfishEngine: any = null;

// Initialize Stockfish engine
export async function initStockfish(): Promise<any> {
  if (stockfishEngine) return stockfishEngine;
  
  try {
    // Dynamic import for stockfish
    const StockfishModule = await import('stockfish-nnue.wasm');
    const Stockfish = StockfishModule.default || StockfishModule;
    
    stockfishEngine = await Stockfish();
    
    // Configure engine
    stockfishEngine.postMessage('uci');
    stockfishEngine.postMessage('setoption name Use NNUE value true');
    stockfishEngine.postMessage('isready');
    
    return stockfishEngine;
  } catch (error) {
    console.error('Failed to initialize Stockfish:', error);
    throw error;
  }
}

// Simple heuristic-based analysis for when Stockfish is not available
// This provides immediate feedback without async engine calls
export function analyzeGameHeuristic(gameData: GameData): GameAnalysis {
  const chess = new Chess();
  const moves: MoveAnalysis[] = [];
  const whiteLosses: number[] = [];
  const blackLosses: number[] = [];
  
  for (let i = 0; i < gameData.moves.length; i++) {
    const san = gameData.moves[i];
    const isWhiteMove = i % 2 === 0;
    
    // Make the move
    const move = chess.move(san);
    if (!move) continue;
    
    // Simple heuristic classification
    const classification = classifyMoveHeuristic(move, i, chess);
    
    // Estimate centipawn loss based on classification
    const centipawnLoss = estimateCentipawnLoss(classification);
    
    // Estimate evaluation (simplified)
    const evaluation = estimateEvaluation(chess, isWhiteMove);
    
    moves.push({
      moveIndex: i,
      san,
      classification,
      evaluation,
      centipawnLoss,
      bestMove: san, // In heuristic mode, assume played move is best
    });
    
    // Track losses
    if (isWhiteMove) {
      whiteLosses.push(centipawnLoss);
    } else {
      blackLosses.push(centipawnLoss);
    }
  }
  
  return {
    moves,
    whiteAccuracy: calculateAccuracy(whiteLosses),
    blackAccuracy: calculateAccuracy(blackLosses),
  };
}

// Heuristic-based move classification
function classifyMoveHeuristic(
  move: any,
  moveIndex: number,
  chess: Chess
): MoveClassification {
  const isCapture = !!move.captured;
  const isCheck = chess.isCheck();
  const isCheckmate = chess.isCheckmate();
  const isCastle = move.flags.includes('k') || move.flags.includes('q');
  
  // Book moves (first 15 moves, especially 1-10)
  if (moveIndex < 10) {
    return 'book';
  }
  if (moveIndex < 20 && !isCapture && !isCheck) {
    return 'book';
  }
  
  // Checkmate is always best
  if (isCheckmate) {
    return 'best';
  }
  
  // Brilliant: sacrifice that leads to check or complex position
  if (isCapture && isCheck && moveIndex > 10) {
    // Check if it's a sacrifice (capturing lower value piece)
    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    if (move.captured && pieceValues[move.captured] < pieceValues[move.piece]) {
      return 'brilliant';
    }
    return 'great';
  }
  
  // Great move: check with capture or castle
  if (isCheck && isCapture) {
    return 'great';
  }
  
  // Castle is generally excellent in opening/middlegame
  if (isCastle && moveIndex < 30) {
    return 'excellent';
  }
  
  // Capture with check
  if (isCapture && isCheck) {
    return 'excellent';
  }
  
  // Good captures
  if (isCapture) {
    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const capturedValue = pieceValues[move.captured] || 0;
    const attackerValue = pieceValues[move.piece] || 0;
    
    // Capturing higher or equal value is good
    if (capturedValue >= attackerValue) {
      return 'good';
    }
    
    // Capturing pawn with piece might be inaccuracy
    if (capturedValue === 1 && attackerValue > 3) {
      return 'inaccuracy';
    }
    
    return 'good';
  }
  
  // Check without capture is good
  if (isCheck) {
    return 'good';
  }
  
  // Default to good for most moves
  return 'good';
}

// Estimate centipawn loss from classification
function estimateCentipawnLoss(classification: MoveClassification): number {
  const estimates: Record<MoveClassification, number> = {
    'brilliant': 0,
    'best': 0,
    'great': 20,
    'excellent': 30,
    'good': 60,
    'book': 10,
    'inaccuracy': 150,
    'mistake': 400,
    'blunder': 600,
    'miss': 300,
  };
  return estimates[classification] || 50;
}

// Estimate position evaluation (simplified)
function estimateEvaluation(chess: Chess, isWhiteMove: boolean): number {
  // Simple material count
  const board = chess.board();
  let whiteMaterial = 0;
  let blackMaterial = 0;
  
  const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece) {
        const value = pieceValues[piece.type] || 0;
        if (piece.color === 'w') {
          whiteMaterial += value;
        } else {
          blackMaterial += value;
        }
      }
    }
  }
  
  // Return evaluation from white's perspective
  return whiteMaterial - blackMaterial;
}

// Evaluate a single position (FEN)
export function evaluatePosition(engine: any, fen: string, depth: number = 15): Promise<number> {
  return new Promise((resolve) => {
    let bestEval = 0;
    let messageCount = 0;
    
    const handleMessage = (msg: string) => {
      messageCount++;
      
      // Parse evaluation from Stockfish output
      // Format: "info depth 15 score cp 35 ..." (centipawns)
      // Format: "info depth 15 score mate 3 ..." (mate in N)
      if (msg.includes('score cp')) {
        const match = msg.match(/score cp (-?\d+)/);
        if (match) {
          bestEval = parseInt(match[1], 10);
        }
      } else if (msg.includes('score mate')) {
        const match = msg.match(/score mate (-?\d+)/);
        if (match) {
          const mateIn = parseInt(match[1], 10);
          // Assign high value for mate (positive = white mates, negative = black mates)
          bestEval = mateIn > 0 ? 10000 - mateIn * 100 : -10000 - mateIn * 100;
        }
      }
      
      // Stop when we reach target depth
      if (msg.includes(`depth ${depth}`) || msg.includes('bestmove')) {
        engine.removeMessageListener?.(handleMessage);
        resolve(bestEval);
      }
      
      // Timeout fallback
      if (messageCount > 1000) {
        engine.removeMessageListener?.(handleMessage);
        resolve(bestEval);
      }
    };
    
    // Set up message listener
    if (engine.onMessage) {
      engine.onMessage = handleMessage;
    }
    
    // Send position and search
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
    
    // Fallback timeout
    setTimeout(() => {
      engine.removeMessageListener?.(handleMessage);
      resolve(bestEval);
    }, 5000);
  });
}

// Get best move for a position
export function getBestMove(engine: any, fen: string, depth: number = 15): Promise<string> {
  return new Promise((resolve) => {
    let bestMove = '';
    
    const handleMessage = (msg: string) => {
      if (msg.includes('bestmove')) {
        const match = msg.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (match) {
          bestMove = match[1];
        }
        engine.removeMessageListener?.(handleMessage);
        resolve(bestMove);
      }
    };
    
    if (engine.onMessage) {
      engine.onMessage = handleMessage;
    }
    
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
    
    setTimeout(() => {
      engine.removeMessageListener?.(handleMessage);
      resolve(bestMove);
    }, 5000);
  });
}

// Classify move based on centipawn loss
function classifyMove(
  centipawnLoss: number,
  moveIndex: number,
  isCapture: boolean,
  isCheck: boolean,
  isTactical: boolean
): MoveClassification {
  // Book moves (first 10-15 moves with low loss)
  if (moveIndex < 20 && centipawnLoss < 30) {
    return 'book';
  }
  
  // Brilliant: low loss + tactical complexity (sacrifice or complex move)
  if (centipawnLoss < 50 && isTactical && (isCapture || isCheck)) {
    return 'brilliant';
  }
  
  // Best move
  if (centipawnLoss === 0) {
    return 'best';
  }
  
  // Excellent
  if (centipawnLoss < 50) {
    return 'excellent';
  }
  
  // Good
  if (centipawnLoss < 100) {
    return 'good';
  }
  
  // Great: changes game course (high loss avoided)
  if (centipawnLoss < 150 && isTactical) {
    return 'great';
  }
  
  // Inaccuracy
  if (centipawnLoss < 300) {
    return 'inaccuracy';
  }
  
  // Mistake
  if (centipawnLoss < 500) {
    return 'mistake';
  }
  
  // Blunder
  return 'blunder';
}

// Calculate accuracy percentage from centipawn losses
function calculateAccuracy(losses: number[]): number {
  if (losses.length === 0) return 0;
  
  // Chess.com accuracy formula based on average centipawn loss
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
  
  // Convert to accuracy percentage (lower loss = higher accuracy)
  // Formula: 100 - (avgLoss / 10) but capped at 0-100
  const accuracy = Math.max(0, Math.min(100, 100 - (avgLoss / 10)));
  
  return Math.round(accuracy);
}

// Analyze full game
export async function analyzeGame(
  engine: any,
  moves: string[],
  onProgress?: (progress: number) => void
): Promise<GameAnalysis> {
  const chess = new Chess();
  const moveAnalysis: MoveAnalysis[] = [];
  const whiteLosses: number[] = [];
  const blackLosses: number[] = [];
  
  // Evaluate initial position
  let prevEval = await evaluatePosition(engine, chess.fen());
  
  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const isWhiteMove = i % 2 === 0;
    
    // Make the move
    const move = chess.move(san);
    if (!move) continue;
    
    // Get position after move
    const currentFen = chess.fen();
    
    // Evaluate new position
    const currentEval = await evaluatePosition(engine, currentFen);
    
    // Calculate centipawn loss
    // For white: if eval drops, that's a loss
    // For black: if eval rises, that's a loss (black wants negative eval)
    let centipawnLoss = 0;
    if (isWhiteMove) {
      // White wants positive eval
      centipawnLoss = Math.max(0, prevEval - currentEval);
    } else {
      // Black wants negative eval
      centipawnLoss = Math.max(0, currentEval - prevEval);
    }
    
    // Get best move for previous position (what should have been played)
    chess.undo();
    const bestMove = await getBestMove(engine, chess.fen());
    chess.move(san); // Redo the move
    
    // Detect tactical elements
    const isTactical = move.captured || move.flags.includes('k') || move.flags.includes('q') || chess.isCheck();
    
    // Classify the move
    const classification = classifyMove(
      centipawnLoss,
      i,
      !!move.captured,
      chess.isCheck(),
      isTactical
    );
    
    // Store analysis
    moveAnalysis.push({
      moveIndex: i,
      san,
      classification,
      evaluation: currentEval,
      centipawnLoss,
      bestMove,
    });
    
    // Track losses by color
    if (isWhiteMove) {
      whiteLosses.push(centipawnLoss);
    } else {
      blackLosses.push(centipawnLoss);
    }
    
    // Update for next iteration
    prevEval = currentEval;
    
    // Report progress
    onProgress?.((i + 1) / moves.length);
  }
  
  return {
    moves: moveAnalysis,
    whiteAccuracy: calculateAccuracy(whiteLosses),
    blackAccuracy: calculateAccuracy(blackLosses),
  };
}

// Quick analysis without engine (for testing/fallback)
export function quickClassifyMove(
  moveIndex: number,
  isCapture: boolean,
  isCheck: boolean,
  isCheckmate: boolean
): MoveClassification {
  // Simple heuristic-based classification for when engine is not available
  if (moveIndex < 10) return 'book';
  if (isCheckmate) return 'best';
  if (isCapture && isCheck) return 'great';
  if (isCapture) return 'good';
  return 'good';
}
