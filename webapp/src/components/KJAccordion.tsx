'use client';

import { useState } from 'react';

interface KJAccordionProps {
    categoryName: string;
    summary: string;
    representative_comments?: string[];
    accentColor?: string;
}

export default function KJAccordion({ categoryName, summary, representative_comments = [], accentColor = '#f5c83b' }: KJAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="neo-card" style={{
            marginBottom: '32px',
            border: `4px solid #333`,
            transition: 'all 0.3s ease',
            backgroundColor: '#fff',
            padding: '4px'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '24px 28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: '#333'
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: accentColor,
                        borderRadius: '50%',
                        border: '3px solid #333'
                    }}></span>
                    {categoryName}
                </span>
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '1.2rem',
                    backgroundColor: '#fff',
                    padding: '6px',
                    borderRadius: '12px',
                    border: '3px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div style={{
                    padding: '0 28px 28px 28px',
                    borderTop: '4px solid #333',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ marginTop: '24px', fontSize: '1.1rem', lineHeight: '1.7', color: '#333' }}>
                        <p style={{ fontWeight: 800, color: '#333', marginBottom: '12px', fontSize: '1.2rem' }}>
                            ✨ AIによる要約
                        </p>
                        {summary}
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <p style={{ fontWeight: 800, color: '#333', marginBottom: '16px', fontSize: '1.1rem' }}>
                            💬 視聴者の声
                        </p>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {representative_comments && representative_comments.length > 0 ? (
                                representative_comments.map((comment, i) => (
                                    <div key={i} style={{
                                        backgroundColor: '#fafafa',
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: '3px solid #333',
                                        boxShadow: '4px 4px 0px 0px #333',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        lineHeight: '1.5',
                                        position: 'relative',
                                        paddingLeft: '40px'
                                    }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '14px', fontSize: '1.2rem' }}>👉</span>
                                        {comment}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic' }}>コメントデータがまだありません。</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
