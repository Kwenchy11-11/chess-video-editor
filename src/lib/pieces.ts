import { staticFile } from 'remotion';

export function getPieceSvg(piece: string): string {
  const color = piece === piece.toUpperCase() ? 'w' : 'b';
  const type = piece.toLowerCase();
  return staticFile(`pieces/${color}${type.toUpperCase()}.svg`);
}
