'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import KJAccordion from '@/components/KJAccordion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface AnalysisGroup {
    category_name: string;
    summary: string;
    representative_comments: string[];
    display_order: number;
}

interface VideoAnalysis {
    id: string;
    title: string;
    thumbnail_url: string;
    total_analysis: string;
    youtube_id: string;
    analysis_groups: AnalysisGroup[];
}

const ACCENT_COLORS = ['#d676ac', '#47bfe4', '#f5c83b', '#66bb6a'];

export default function VideoDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalysis() {
            if (!id) return;

            const { data, error } = await supabase
                .from('videos')
                .select(`
          *,
          analysis_groups (*)
        `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching analysis:', error);
            } else {
                // Sort analysis groups by display_order
                if (data.analysis_groups) {
                    data.analysis_groups.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
                }
                setAnalysis(data);
            }
            setLoading(false);
        }

        fetchAnalysis();
    }, [id]);

    if (loading) {
        return (
            <main className="container">
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ color: '#aaa' }}>分析データを読み込み中...</p>
                </div>
            </main>
        );
    }

    if (!analysis) {
        return (
            <main className="container">
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ color: '#888' }}>動画が見つかりませんでした。</p>
                    <Link href="/" style={{ marginTop: '20px', display: 'inline-block' }} className="btn-modern">
                        トップに戻る
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header with Logo */}
            <header style={{
                backgroundColor: '#fff',
                padding: '30px 20px',
                borderBottom: '6px solid #333',
                marginBottom: '60px'
            }}>
                <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/">
                        <img
                            src="/logo.png"
                            alt="logo"
                            style={{ maxHeight: '50px', width: 'auto' }}
                        />
                    </Link>
                    <Link href="/" className="neo-btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        ← 戻る
                    </Link>
                </div>
            </header>

            <div className="container">
                <div className="neo-card" style={{ overflow: 'hidden', marginBottom: '48px' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderBottom: '4px solid #333' }}>
                        <img
                            src={analysis.thumbnail_url || '/placeholder-thumb.jpg'}
                            alt={analysis.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div style={{ padding: '32px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#333', lineHeight: '1.3', marginBottom: '24px' }}>
                            {analysis.title}
                        </h1>

                        {analysis.total_analysis && (
                            <div style={{
                                backgroundColor: '#fffbe6',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '4px solid #f5c83b',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-16px',
                                    left: '20px',
                                    backgroundColor: '#f5c83b',
                                    color: '#333',
                                    padding: '4px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 900,
                                    border: '3px solid #333',
                                    fontSize: '0.9rem'
                                }}>
                                    ✨ AI総評
                                </div>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', fontWeight: 500 }}>
                                    {analysis.total_analysis}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#333', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 900 }}>
                            KJ
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>コメント分析</h2>
                    </div>

                    <div>
                        {analysis.analysis_groups?.length > 0 ? (
                            analysis.analysis_groups.map((group, index) => (
                                <KJAccordion
                                    key={index}
                                    categoryName={group.category_name}
                                    summary={group.summary}
                                    representative_comments={group.representative_comments}
                                    accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
                                />
                            ))
                        ) : (
                            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                                まだ分析データがありません。
                            </p>
                        )}
                    </div>
                </section>

                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <a href={`https://www.youtube.com/watch?v=${analysis.youtube_id}`} target="_blank" rel="noopener noreferrer" className="neo-btn" style={{ width: '100%', fontSize: '1.1rem' }}>
                        YouTubeで本編を見る
                    </a>
                </div>
            </div>
        </main>
    );
}
