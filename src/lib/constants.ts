// Video dimensions (TikTok 9:16)
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;

// Board settings
export const BOARD_SIZE = 800; // pixels
export const SQUARE_SIZE = BOARD_SIZE / 8;
export const BOARD_MARGIN = (VIDEO_WIDTH - BOARD_SIZE) / 2;

// Timing - Adjustable speed settings
export const SECONDS_PER_MOVE = 0.8; // 0.8s = 24 frames per move (slower, smoother)
export const FRAMES_PER_MOVE = Math.round(SECONDS_PER_MOVE * FPS);

// Speed ramping: slow down for important moves
export const SLOW_MOVE_SECONDS = 1.2; // 1.2s for check, capture, checkmate
export const SLOW_MOVE_FRAMES = Math.round(SLOW_MOVE_SECONDS * FPS);

// Speed presets for user selection
export const SPEED_PRESETS = {
  slow: { normal: 1.5, slow: 2.0 },    // 45fps / 60fps per move
  medium: { normal: 0.8, slow: 1.2 },  // 24fps / 36fps per move (default)
  fast: { normal: 0.5, slow: 0.8 },    // 15fps / 24fps per move
} as const;

export type SpeedPreset = keyof typeof SPEED_PRESETS;

// Easing function for smooth animation (ease-out-cubic)
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Smooth easing for piece movement
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Ending pause - show checkmate overlay for 3 seconds
export const ENDING_PAUSE_SECONDS = 3;
export const ENDING_PAUSE_FRAMES = Math.round(ENDING_PAUSE_SECONDS * FPS);

// Colors (Chess.com blue theme)
export const COLORS = {
  lightSquare: '#EBECD0',
  darkSquare: '#779556',
  highlightFrom: 'rgba(130, 180, 70, 0.5)',
  highlightTo: 'rgba(130, 180, 70, 0.3)',
  arrow: 'rgba(130, 180, 70, 0.8)',
  checkFlash: 'rgba(255, 0, 0, 0.3)',
  text: '#FFFFFF',
  background: '#1A1A2E',
  playerCard: '#16213E',
};

// Piece mapping
export const PIECE_SYMBOLS: Record<string, string> = {
  'p': 'pawn',
  'n': 'knight',
  'b': 'bishop',
  'r': 'rook',
  'q': 'queen',
  'k': 'king',
};
