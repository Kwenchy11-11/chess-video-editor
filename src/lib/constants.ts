// Video dimensions (TikTok 9:16)
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FPS = 30;

// Board settings
export const BOARD_SIZE = 800; // pixels
export const SQUARE_SIZE = BOARD_SIZE / 8;
export const BOARD_MARGIN = (VIDEO_WIDTH - BOARD_SIZE) / 2;

// Timing
export const SECONDS_PER_MOVE = 2;
export const FRAMES_PER_MOVE = SECONDS_PER_MOVE * FPS;

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
