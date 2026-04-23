# Chess Video Editor for TikTok ♟️🎬

สร้างวิดีโอหมากรุกสำหรับ TikTok จากเกม Chess.com โดยอัตโนมัติ

## 🎯 Features

- ✅ ดึงเกมจาก Chess.com URL อัตโนมัติ
- ✅ สร้างวิดีโอ TikTok format (9:16 - 1080x1920)
- ✅ **Animation หมากเดิน smooth** พร้อมปรับความเร็วได้ (slow/medium/fast)
- ✅ **สไตล์ Minimal Clean** - ดูสะอาด ไม่บังบอร์ด
- ✅ **Game Review** - วิเคราะห์เกมด้วย Stockfish engine
  - Move classification: Brilliant, Best, Great, Excellent, Good, Book, Inaccuracy, Mistake, Blunder, Miss
  - Evaluation bar แสดงความได้เปรียบ/เสียเปรียบ
  - Accuracy score สำหรับผู้เล่นทั้งสองฝ่าย
- ✅ **Checkmate/Winner indicators** บนช่องกษัตริย์ (เหมือน Chess.com)
- ✅ **Capture animation** แบบ fade-out (เหมือน Chess.com)
- ✅ **Highlight moves** หลังเดินเสร็จ (เหมือน Chess.com)
- ✅ แสดงชื่อผู้เล่น, ELO, Opening
- ✅ Moves list แบบ scrollable
- ✅ Web Platform ใช้งานง่าย

## 🚀 วิธีใช้งาน

### แบบที่ 1: Web Platform (แนะนำ)

```bash
cd platform
npm install
npm run dev
```

เปิด http://localhost:3003

1. ใส่ URL เกม Chess.com (เช่น `https://www.chess.com/game/live/148557015936`)
2. กด "สร้างวิดีโอ"
3. รอ 30-60 วินาที
4. ดาวน์โหลดและอัพโหลดลง TikTok!

### แบบที่ 2: Remotion Studio (สำหรับพัฒนา)

```bash
npm install
npm run dev
```

เปิด http://localhost:3002

## 📁 โครงสร้างโปรเจค

```
chess-video-editor/
├── 📁 platform/              # Web Platform (Next.js)
│   ├── src/app/page.tsx      # หน้าแรก (ฟอร์มใส่ URL)
│   ├── src/app/api/generate/ # API สร้าง video
│   └── package.json
│
├── 📁 src/                   # Remotion Video Engine
│   ├── components/           # Board, Pieces, UI, Effects
│   ├── compositions/         # ChessGame composition
│   ├── hooks/                # Chess logic (useChessGame, useChessAPI)
│   └── lib/                  # Constants, types, utilities
│
├── 📁 public/pieces/         # SVG chess pieces (Merida style)
├── 📁 docs/                  # Design documents
└── README.md
```

## 🎭 Style System

รองรับหลายสไตล์สำหรับวิดีโอ:

```tsx
// ใช้ใน Remotion
<ChessGame gameData={gameData} styleVariant="minimal-clean" speed="medium" />
```

**Available styles:**
- `minimal-clean` - สะอาด เรียบง่าย (ค่าเริ่มต้น)
- `sporty-esports` - สไตล์กีฬา (เตรียมไว้)
- `retro-pixel` - สไตล์ 8-bit (เตรียมไว้)
- `bold-impact` - ดูเด่นชัด (เตรียมไว้)

## 🧠 Game Review (Stockfish Analysis)

วิเคราะห์เกมอัตโนมัติด้วย Stockfish engine:

**Move Classifications:**
| Classification | ความหมาย | Centipawn Loss |
|----------------|----------|----------------|
| ⭐ Brilliant | ซับซ้อน/สละ material, engine เห็นด้วย | < 50 + tactical |
| ★ Best | Perfect move | 0 |
| 👍 Great | เปลี่ยนผลเกม | < 150 + tactical |
| ✓ Excellent | ใกล้เคียง best | < 50 |
| ✓ Good | ดีแต่ไม่ดีที่สุด | < 100 |
| 📖 Book | Opening theory | < 30 (first 20 moves) |
| ?! Inaccuracy | ไม่ดีเท่าที่ควร | 100-300 |
| ? Mistake | เสียเปรียบชัดเจน | 300-500 |
| ?? Blunder | ผิดพลาดร้ายแรง | > 500 |
| ○ Miss | พลาดโอกาสทาง tactical | - |

**Features:**
- Evaluation bar แสดงความได้เปรียบ (ขาว = บน, ดำ = ล่าง)
- Accuracy score สำหรับผู้เล่นทั้งสองฝ่าย
- Auto-analyze เมื่อโหลดเกม

## 🛠 Tech Stack

- **Video Engine:** Remotion (React-based video creation)
- **Chess Logic:** chess.js
- **Web Framework:** Next.js 14
- **Styling:** TailwindCSS
- **Language:** TypeScript

## 📝 ตัวอย่าง URL ที่รองรับ

- `https://www.chess.com/game/live/148557015936`
- `https://www.chess.com/game/daily/123456789`

## 🎨 สเปควิดีโอ

- **Resolution:** 1080 x 1920 (9:16 aspect ratio)
- **Frame Rate:** 30 FPS
- **Speed Presets:**
  - `slow` - 1.5s/2.0s ต่อ move (สบายตา)
  - `medium` - 0.8s/1.2s ต่อ move (ค่าเริ่มต้น)
  - `fast` - 0.5s/0.8s ต่อ move (เร็ว)
- **Format:** MP4 (H.264)
- **Easing:** Smooth cubic easing สำหรับ animation หมาก

## 🤝 Contributing

Pull requests ยินดีต้อนรับ! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อนเพื่อ discuss สิ่งที่ต้องการเปลี่ยน

## 📄 License

MIT License

---

สร้างด้วย ❤️ สำหรับคนรักหมากรุก
