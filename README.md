# Chess Video Editor for TikTok ♟️🎬

สร้างวิดีโอหมากรุกสำหรับ TikTok จากเกม Chess.com โดยอัตโนมัติ

## 🎯 Features

- ✅ ดึงเกมจาก Chess.com URL อัตโนมัติ
- ✅ สร้างวิดีโอ TikTok format (9:16 - 1080x1920)
- ✅ Animation หมากเดิน smooth
- ✅ แสดงชื่อผู้เล่น, ELO, Opening
- ✅ Moves list แบบ scrollable
- ✅ Highlight moves + ลูกศรชี้การเดิน
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
- **Duration:** 2 วินาทีต่อ move
- **Format:** MP4 (H.264)

## 🤝 Contributing

Pull requests ยินดีต้อนรับ! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อนเพื่อ discuss สิ่งที่ต้องการเปลี่ยน

## 📄 License

MIT License

---

สร้างด้วย ❤️ สำหรับคนรักหมากรุก
