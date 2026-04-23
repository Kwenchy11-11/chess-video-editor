export interface Player {
  username: string;
  rating: number;
  avatar?: string;
  color: 'white' | 'black';
}

export interface GameData {
  id: string;
  white: Player;
  black: Player;
  moves: string[]; // SAN notation
  opening?: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  pgn: string;
}

export interface MoveAnimation {
  from: string; // e2
  to: string;   // e4
  piece: string; // 'P' or 'p'
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  san: string; // "e4" or "Nf3"
}

export interface ChessCompositionProps {
  gameData: GameData;
}
