'use client';

import Link from 'next/link';

interface VideoCardProps {
    id: string;
    title: string;
    thumbnailUrl: string;
    broadcastDate?: string;
    isAnalyzed: boolean;
}

export default function VideoCard({ id, title, thumbnailUrl, broadcastDate }: VideoCardProps) {
    return (
        <Link href={`/video/${id}`} style={{ textDecoration: 'none' }}>
            <div className="neo-card" style={{
                overflow: 'hidden',
                marginBottom: '32px',
                cursor: 'pointer',
            }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderBottom: '4px solid #333' }}>
                    <img
                        src={thumbnailUrl || '/placeholder-thumb.jpg'}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div style={{ padding: '24px' }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        marginBottom: '12px',
                        color: '#333',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        fontWeight: 800
                    }}>
                        {title}
                    </h3>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ backgroundColor: '#f5c83b', padding: '2px 8px', borderRadius: '4px', color: '#000' }}>放送日</span>
                        {broadcastDate || '2026.01.23'}
                    </div>
                </div>
            </div>
        </Link>
    );
}
