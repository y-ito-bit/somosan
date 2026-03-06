'use client';

import { useState } from 'react';

export default function AdminPage() {
    const [videoId, setVideoId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoId) return;

        setLoading(true);
        setResult(null);

        try {
            // URLからIDを抽出する簡易ロジック
            let targetId = videoId;
            if (videoId.includes('v=')) {
                targetId = videoId.split('v=')[1].split('&')[0];
            } else if (videoId.includes('youtu.be/')) {
                targetId = videoId.split('youtu.be/')[1].split('?')[0];
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: targetId }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult({
                    success: true,
                    message: '分析が完了しました！',
                    output: data.output
                });
                setVideoId('');
            } else {
                setResult({
                    success: false,
                    message: `エラーが発生しました: ${data.message}`,
                    output: data.details
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: '通信エラーが発生しました。',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ padding: '60px 24px' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>
                    🔧 ソモさん管理画面
                </h1>
                <p style={{ color: '#666' }}>
                    YouTube動画のIDを入力して、AI分析を実行できるぜ！
                </p>
            </header>

            <div className="neo-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '32px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label
                            htmlFor="videoId"
                            style={{ display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.9rem' }}
                        >
                            動画URL または ID
                        </label>
                        <input
                            type="text"
                            id="videoId"
                            value={videoId}
                            onChange={(e) => setVideoId(e.target.value)}
                            placeholder="e.g. 9fkFPabCce8"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '3px solid #333',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="neo-btn"
                        style={{ width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? '分析中... (1-2分かかります)' : '🚀 分析実行'}
                    </button>
                </form>
            </div>

            {result && (
                <div
                    className="neo-card"
                    style={{
                        maxWidth: '640px',
                        margin: '40px auto 0',
                        padding: '24px',
                        backgroundColor: result.success ? '#f0fff4' : '#fff5f5',
                        borderColor: result.success ? '#333' : '#e53e3e'
                    }}
                >
                    <h3 style={{
                        fontWeight: 800,
                        marginBottom: '12px',
                        color: result.success ? '#2f855a' : '#c53030'
                    }}>
                        {result.message}
                    </h3>
                    {result.output && (
                        <pre style={{
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            padding: '16px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                            {result.output}
                        </pre>
                    )}
                </div>
            )}
        </main>
    );
}
