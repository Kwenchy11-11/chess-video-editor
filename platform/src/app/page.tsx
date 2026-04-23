'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate video');
      }

      const data = await response.json();
      setVideoUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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
        maxWidth: '600px',
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
            {loading ? '⏳ กำลังสร้างวิดีโอ...' : '🎬 สร้างวิดีโอ'}
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

        {videoUrl && (
          <div style={{
            marginTop: '30px',
            padding: '24px',
            backgroundColor: '#7cb34233',
            borderRadius: '16px',
          }}>
            <h2 style={{ color: '#7cb342', marginBottom: '16px' }}>
              ✅ สร้างวิดีโอสำเร็จ!
            </h2>
            <video
              src={videoUrl}
              controls
              style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            />
            <br />
            <a
              href={videoUrl}
              download
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#7cb342',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            >
              ⬇️ ดาวน์โหลดวิดีโอ
            </a>
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
            <li>วางลงในช่องด้านบน แล้วกด "สร้างวิดีโอ"</li>
            <li>รอประมาณ 30-60 วินาที</li>
            <li>ดาวน์โหลดและอัพโหลดลง TikTok!</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
