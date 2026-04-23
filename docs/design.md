# Chess Video Editor for TikTok - Design Document

**Date:** 2026-04-23  
**Project:** chess-video-editor  
**Approach:** Full TikTok Style (Approach 2)

---

## 1. Overview

สร้าง video chess game จาก Chess.com URL สำหรับลง TikTok โดยอัตโนมัติ

### Key Features
- Auto-extract PGN จาก Chess.com URL
- Premium 2D board ด้วย animations และ effects
- TikTok vertical format (9:16)
- 2 วินาทีต่อ move
- ไม่มี background music (user ใส่เองใน TikTok)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Input Layer                                             │
│  ├─ Chess.com URL → API → PGN Parser                   │
│  └─ Game Metadata (players, ELO, opening, result)        │
├─────────────────────────────────────────────────────────┤
│  Video Engine (Remotion)                                 │
│  ├─ Board Component (SVG pieces, smooth animation)       │
│  ├─ UI Overlay (players, moves list, highlights)         │
│  ├─ Effects (arrows, capture particles, check flash)      │
│  └─ Sequencer (2 sec per move)                           │
├─────────────────────────────────────────────────────────┤
│  Output                                                  │
│  └─ 1080x1920 (9:16) @ 30fps MP4                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Components

### 3.1 Board Component
- **Technology:** SVG-based chessboard
- **Pieces:** Merida SVG set (high-quality, TikTok-friendly)
- **Animation:** CSS transitions + `useCurrentFrame()` interpolation
- **Size:** 80% of video width, centered

### 3.2 UI Overlay Components

| Component | Position | Description |
|-----------|----------|-------------|
| PlayerCard (White) | Top | Avatar + ชื่อ + ELO |
| PlayerCard (Black) | Bottom | Avatar + ชื่อ + ELO |
| MoveCounter | Above board | "Move 12/45" |
| MovesList | Right side | Scrollable list |
| OpeningLabel | Top center | Opening name |
| ResultBadge | Center (end) | "1-0" / "0-1" / "½-½" |

### 3.3 Effects System

| Effect | Trigger | Animation |
|--------|---------|-----------|
| Highlight Squares | Before move | 0.3s fade, green tint |
| Move Arrow | During move | SVG arrow draw 0.2s |
| Capture Effect | Capture move | Particles + red flash |
| Check Animation | Check/Checkmate | Board flash red 0.5s |
| Sound Effects | All moves | Click, capture, check, castle |

---

## 4. Data Flow

```
URL Input
    ↓
Chess.com API (public endpoint)
    ↓
PGN Parser (chess.js)
    ↓
Game Object: { moves[], players, result, opening }
    ↓
Move Sequencer: 2 seconds per move
    ↓
Remotion Frame Calculator: 60 frames = 1 move
    ↓
Render Video
```

---

## 5. Technical Stack

| Layer | Library |
|-------|---------|
| Video Engine | Remotion |
| Chess Logic | chess.js |
| HTTP Client | fetch |
| Styling | TailwindCSS |
| Animations | Remotion interpolate + CSS |
| Icons | Lucide React |

---

## 6. Project Structure

```
chess-video-editor/
├── src/
│   ├── components/
│   │   ├── Board.tsx
│   │   ├── ChessPiece.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── MovesList.tsx
│   │   ├── MoveArrow.tsx
│   │   ├── Highlight.tsx
│   │   └── Effects/
│   │       ├── CaptureEffect.tsx
│   │       └── CheckEffect.tsx
│   ├── hooks/
│   │   ├── useChessGame.ts
│   │   └── useChessAPI.ts
│   ├── lib/
│   │   ├── chess.ts
│   │   └── constants.ts
│   ├── compositions/
│   │   └── ChessGame.tsx
│   └── Root.tsx
├── public/
│   └── pieces/           # SVG chess pieces
├── remotion.config.ts
├── package.json
└── README.md
```

---

## 7. Video Specifications

- **Resolution:** 1080 x 1920 (9:16 aspect ratio)
- **Frame Rate:** 30 fps
- **Duration:** moves.length × 2 seconds
- **Format:** MP4 (H.264)

---

## 8. Success Criteria

- [ ] ใส่ URL Chess.com แล้วดึงเกมได้สำเร็จ
- [ ] Video render ได้ขนาด 1080x1920 (9:16)
- [ ] หมากเดิน smooth ทุก move (2 วิต่อ move)
- [ ] มี highlight + arrow ชี้การเดิน
- [ ] มี sound effects
- [ ] มี players info + moves list

---

## 9. Input/Output

### Input
- Chess.com game URL (e.g., `https://www.chess.com/game/live/148557015936`)

### Output
- MP4 file: `chess-game-{gameId}.mp4`
- 1080x1920 @ 30fps
- No audio track

---

## 10. Notes

- ใช้ Chess.com public API (ไม่ต้อง API key)
- Sound effects ใช้ไฟล์ .mp3 หรือ .wav สั้นๆ
- รองรับ special moves: castling, en passant, promotion
- แสดง opening name จาก PGN tags
