'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [pgn, setPgn] = useState('');
  const [mode, setMode] = useState<'url' | 'pgn'>('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderOutput, setRenderOutput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let gameData;
      
      if (mode === 'pgn') {
        // Parse PGN directly
        if (!pgn.trim()) {
          throw new Error('Please enter PGN');
        }
        gameData = parsePGNData(pgn);
      } else {
        // Try to fetch from URL
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to prepare game data');
        }

        const data = await response.json();
        gameData = data.gameData;
      }

      // Save game data via API
      const saveResponse = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameData }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save game data');
      }

      const saveData = await saveResponse.json();
      
      setResult({
        ...saveData,
        gameData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!result?.gameId) return;
    
    setRendering(true);
    setRenderOutput('⏳ กำลังสร้างวิดีโอ... อาจใช้เวลา 1-2 นาที\n');
    
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: result.gameId }),
      });
      
      if (!response.ok) {
        throw new Error('Render failed');
      }
      
      const data = await response.json();
      setRenderOutput(prev => prev + '\n✅ สร้างวิดีโอสำเร็จ!\n');
      
      setResult((prev: any) => ({
        ...prev,
        videoUrl: data.videoUrl,
      }));
    } catch (err) {
      setRenderOutput(prev => prev + '\n❌ เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'Unknown error') + '\n');
    } finally {
      setRendering(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '10px',
        }}>
          ♟️ Chess Video Generator
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#888',
          marginBottom: '40px',
        }}>
          สร้างคลิป TikTok จากเกมหมากรุก
        </p>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setMode('url')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'url' ? '#7cb342' : '#333',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🔗 ใช้ URL
          </button>
          <button
            onClick={() => setMode('pgn')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: mode === 'pgn' ? '#7cb342' : '#333',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            📋 ใช้ PGN
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {mode === 'url' ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.chess.com/game/live/148557015936"
              style={{
                padding: '16px 20px',
                fontSize: '16px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#0f0f23',
                color: '#fff',
                outline: 'none',
              }}
            />
          ) : (
            <textarea
              value={pgn}
              onChange={(e) => setPgn(e.target.value)}
              placeholder="[White &quot;Player1&quot;][Black &quot;Player2&quot;] 1. e4 e5 2. Nf3 Nc6..."
              rows={6}
              style={{
                padding: '16px 20px',
                fontSize: '14px',
                borderRadius: '12px',
                border: '2px solid #333',
                backgroundColor: '#0f0f23',
                color: '#fff',
                outline: 'none',
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: loading ? '#555' : '#7cb342',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ กำลังเตรียมข้อมูล...' : '📥 เตรียมข้อมูลเกม'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#ff444433',
            borderRadius: '12px',
            color: '#ff6666',
          }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '30px',
            padding: '24px',
            backgroundColor: '#ffffff11',
            borderRadius: '16px',
            textAlign: 'left',
          }}>
            <h2 style={{ color: '#7cb342', marginBottom: '16px', textAlign: 'center' }}>
              ✅ เตรียมข้อมูลสำเร็จ!
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>ผู้เล่นขาว:</strong> {result.gameData.white.username} ({result.gameData.white.rating})
              </p>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>ผู้เล่นดำ:</strong> {result.gameData.black.username} ({result.gameData.black.rating})
              </p>
              <p style={{ color: '#aaa', marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>จำนวน moves:</strong> {Math.ceil(result.gameData.moves.length / 2)} (ทั้งหมด {result.gameData.moves.length} ครั้งเดิน)
              </p>
              {result.gameData.gameType && (
                <p style={{ color: '#aaa', marginBottom: '8px' }}>
                  <strong style={{ color: '#fff' }}>ชนิดเกม:</strong> {result.gameData.gameType}
                  {result.gameData.timeControl && (
                    <span style={{ color: '#666', fontSize: '14px' }}> ({result.gameData.timeControl})</span>
                  )}
                </p>
              )}
              {result.gameData.opening && (
                <p style={{ color: '#aaa' }}>
                  <strong style={{ color: '#fff' }}>Opening:</strong> {result.gameData.opening}
                </p>
              )}
            </div>

            {!result.videoUrl ? (
              <>
                <button
                  onClick={handleRender}
                  disabled={rendering}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: rendering ? '#555' : '#ff6b6b',
                    color: '#fff',
                    cursor: rendering ? 'not-allowed' : 'pointer',
                    marginBottom: '20px',
                  }}
                >
                  {rendering ? '⏳ กำลังสร้างวิดีโอ...' : '🎬 สร้างวิดีโอ'}
                </button>

                {renderOutput && (
                  <pre style={{
                    backgroundColor: '#000',
                    padding: '16px',
                    borderRadius: '8px',
                    color: '#0f0',
                    fontSize: '14px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {renderOutput}
                  </pre>
                )}
              </>
            ) : (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#7cb34233',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <h3 style={{ color: '#7cb342', marginBottom: '16px' }}>
                  🎉 สร้างวิดีโอสำเร็จ!
                </h3>
                <a
                  href={result.videoUrl}
                  download
                  style={{
                    display: 'inline-block',
                    padding: '16px 32px',
                    backgroundColor: '#7cb342',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                  }}
                >
                  ⬇️ ดาวน์โหลดวิดีโอ
                </a>
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#ffffff11',
          borderRadius: '12px',
          textAlign: 'left',
        }}>
          <h3 style={{ color: '#fff', marginBottom: '12px' }}>📋 วิธีใช้ (แบบ PGN - แนะนำ):</h3>
          <ol style={{ color: '#aaa', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>เข้าไปที่ <a href="https://chess.com" target="_blank" style={{ color: '#7cb342' }}>Chess.com</a></li>
            <li>เปิดเกมที่ต้องการ</li>
            <li>กดปุ่ม "Share" หรือ "Download PGN"</li>
            <li>คัดลอก PGN ที่ได้</li>
            <li>กลับมาที่นี่ เลือก "ใช้ PGN" แล้ววาง</li>
            <li>กด "เตรียมข้อมูลเกม" แล้ว "สร้างวิดีโอ"</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

// Parse PGN data on client side
function parsePGNData(pgn: string) {
  // Extract headers
  const whiteMatch = pgn.match(/\[White "([^"]+)"\]/);
  const blackMatch = pgn.match(/\[Black "([^"]+)"\]/);
  const whiteEloMatch = pgn.match(/\[WhiteElo "(\d+)"\]/);
  const blackEloMatch = pgn.match(/\[BlackElo "(\d+)"\]/);
  const openingMatch = pgn.match(/\[Opening "([^"]+)"\]/);
  const resultMatch = pgn.match(/\[Result "([^"]+)"\]/);
  const timeControlMatch = pgn.match(/\[TimeControl "([^"]+)"\]/);
  const eventMatch = pgn.match(/\[Event "([^"]+)"\]/);
  
  // Parse TimeControl to determine game type and format
  let gameType = 'Standard';
  let timeDisplay = '';
  
  if (timeControlMatch) {
    const tc = timeControlMatch[1];
    // Parse time control like "180+2" or "600+5"
    const [seconds, increment] = tc.split('+');
    const minutes = Math.floor(parseInt(seconds) / 60);
    const inc = increment ? parseInt(increment) : 0;
    
    timeDisplay = inc > 0 ? `${minutes}+${inc}` : `${minutes}`;
    
    // Determine game type
    const totalSeconds = parseInt(seconds);
    if (totalSeconds <= 180) {
      gameType = '🔥 Bullet';
    } else if (totalSeconds <= 600) {
      gameType = '⚡ Blitz';
    } else if (totalSeconds <= 1800) {
      gameType = '⏱️ Rapid';
    } else if (totalSeconds >= 86400) {
      gameType = '📅 Daily';
    }
  }
  
  // Also check Event field
  if (eventMatch) {
    const event = eventMatch[1].toLowerCase();
    if (event.includes('blitz')) gameType = '⚡ Blitz';
    else if (event.includes('rapid')) gameType = '⏱️ Rapid';
    else if (event.includes('bullet')) gameType = '🔥 Bullet';
    else if (event.includes('daily')) gameType = '📅 Daily';
  }
  
  // Remove headers to get moves
  const movesText = pgn.replace(/\[.*?\]/g, '').trim();
  
  // Parse moves
  const moves = movesText
    .replace(/\d+\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(m => m && !['1-0', '0-1', '1/2-1/2', '*'].includes(m));
  
  return {
    id: 'pgn-' + Date.now(),
    white: {
      username: whiteMatch ? whiteMatch[1] : 'White',
      rating: whiteEloMatch ? parseInt(whiteEloMatch[1]) : 0,
      color: 'white',
    },
    black: {
      username: blackMatch ? blackMatch[1] : 'Black',
      rating: blackEloMatch ? parseInt(blackEloMatch[1]) : 0,
      color: 'black',
    },
    moves,
    opening: openingMatch ? openingMatch[1] : undefined,
    result: resultMatch ? resultMatch[1] : '*',
    gameType,
    timeControl: timeDisplay || (timeControlMatch ? timeControlMatch[1] : undefined),
    pgn,
  };
}
