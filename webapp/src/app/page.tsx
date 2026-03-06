'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import VideoCard from '@/components/VideoCard';

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  created_at: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
      } else {
        setVideos(data || []);
      }
      setLoading(false);
    }

    fetchVideos();
  }, []);

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{
        marginTop: 0,
        textAlign: 'center',
        borderBottom: '6px solid #333',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* 1. サイトヘッダー画像 & ロゴのオーバーレイ */}
        <div style={{ position: 'relative', width: '100%', backgroundColor: 'var(--primary-color)' }}>
          <img
            src="/header_bannerver2.png"
            alt="サイトヘッダー画像"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderBottom: '4px solid var(--border-color)'
            }}
          />

          {/* ロゴ画像をヘッダーの下部中央に重なるように配置（相対サイズを維持） */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 25%)', /* ロゴ自身の高さの25%分だけ枠からはみ出させる */
            width: '60%', /* 背景画像に対して常に一定の割合の幅を維持し、相対的な拡大を防ぐ */
            zIndex: 10,
            pointerEvents: 'none' as const
          }}>
            <img
              src="/somosan_logo.png"
              alt="金曜日のソモさん"
              style={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(2px 4px 0px rgba(0,0,0,0.2))'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '50px 20px 30px', backgroundColor: 'var(--primary-color)' }}>
          {/* タイトルテキストはロゴ画像に置き換わったため削除 */}

          {/* 3. お悩み募集ボタン */}
          <a href="https://forms.gle/ZQcRCmsWrod1jUC88" target="_blank" rel="noopener noreferrer" className="neo-button-3d btn-red" style={{
            marginBottom: '40px',
            width: '90%',
            maxWidth: '400px'
          }}>
            お悩み募集中！！（相談フォームへ）
          </a>

          {/* 4. 番組概要 */}
          <div className="neo-card" style={{
            padding: '24px',
            margin: '0 auto 40px auto',
            maxWidth: '500px',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '16px', color: 'var(--text-main)', display: 'inline-block', borderBottom: '4px solid var(--primary-color)' }}>番組概要</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: 700 }}>
              「金曜日のソモさん」は、地域のリアルなお悩みから新たな知見を手に入れるローカルバラエティ番組。毎回登場するゲストの「これってどうすれば？」という問いに対して、大人たちがそれぞれのアイデアで回答していきます。
            </p>
          </div>

          {/* 5. 公式SNSボタン */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '10px'
          }}>
            <a href="https://x.com/GakuseiPlace" target="_blank" rel="noopener noreferrer" className="neo-button-3d btn-black" style={{ flex: '1', maxWidth: '180px', padding: '14px 20px', borderColor: '#fff' }}>
              𝕏
            </a>
            <a href="https://www.youtube.com/@place8352" target="_blank" rel="noopener noreferrer" className="neo-button-3d btn-red" style={{ flex: '1', maxWidth: '180px', padding: '14px 20px' }}>
              YouTube
            </a>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase' }}>
            動画リスト
          </h2>
          <span style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '4px 16px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            {videos.length} VIDEOS
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#aaa', fontWeight: 700 }}>読み込み中...</p>
          </div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnailUrl={video.thumbnail_url}
              broadcastDate={new Date(video.created_at).toLocaleDateString()}
              isAnalyzed={true}
            />
          ))
        ) : (
          <div className="neo-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
            <p style={{ color: '#888', fontWeight: 700 }}>まだ分析済みの動画がありません。</p>
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '12px' }}>分析スクリプトを実行してデータを追加してください。</p>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '60px', padding: '40px 0', borderTop: '4px solid #333', textAlign: 'center', fontSize: '0.9rem', color: '#333', fontWeight: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>この番組は、京都の大学生を応援する交流スペース「学生PLACE+」が制作しています。</span>
          <a
            href="https://www.gakusei-place.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="neo-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#333',
              textDecoration: 'none',
              background: '#FFD600',
              border: '3px solid #333',
              cursor: 'pointer',
            }}
          >
            学生PLACE+ のサイトへ
            <span style={{ fontSize: '1rem' }}>&#8599;</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
