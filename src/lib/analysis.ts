import { Chess } from 'chess.js';
import { MoveAnalysis, GameAnalysis, MoveClassification } from './types';

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
