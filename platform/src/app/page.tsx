'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
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
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!result?.renderCommand) return;
    
    setRendering(true);
    setRenderOutput('⏳ กำลังสร้างวิดีโอ... อาจใช้เวลา 1-2 นาที\n');
    
    try {
      // Execute render command
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
      
      // Update result with video URL
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
          ใส่ลิงค์เกม Chess.com แล้วกดสร้างคลิปสำหรับ TikTok
        </p>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.chess.com/game/live/148557015936"
            required
            style={{
              padding: '16px 20px',
              fontSize: '16px',
              borderRadius: '12px',
              border: '2px solid #333',
              backgroundColor: '#0f0f23',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#7cb342'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />

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
              transition: 'transform 0.2s, background-color 0.2s',
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
                <strong style={{ color: '#fff' }}>จำนวน moves:</strong> {result.gameData.moves.length}
              </p>
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
                    wordBreak: 'break-all',
                  }}>
                    {renderOutput}
                  </pre>
                )}

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#00000055',
                  borderRadius: '8px',
                }}>
                  <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>
                    หรือรันคำสั่งนี้ใน Terminal:
                  </p>
                  <code style={{
                    display: 'block',
                    padding: '12px',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '6px',
                    color: '#7cb342',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                  }}>
                    {result.renderCommand}
                  </code>
                </div>
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
          <h3 style={{ color: '#fff', marginBottom: '12px' }}>📋 วิธีใช้:</h3>
          <ol style={{ color: '#aaa', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>เข้าไปที่ <a href="https://chess.com" target="_blank" style={{ color: '#7cb342' }}>Chess.com</a></li>
            <li>เปิดเกมที่ต้องการ (ต้องเป็นเกม public)</li>
            <li>คัดลอก URL จาก address bar</li>
            <li>วางลงในช่องด้านบน แล้วกด "เตรียมข้อมูลเกม"</li>
            <li>กด "สร้างวิดีโอ" และรอ 1-2 นาที</li>
            <li>ดาวน์โหลดและอัพโหลดลง TikTok!</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
