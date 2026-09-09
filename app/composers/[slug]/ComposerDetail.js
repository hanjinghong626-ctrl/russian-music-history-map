'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { composers } from '../../data/composers';
import { relationships } from '../../data/relationships';

const periodNames = {
  'classical': '古典时期',
  'national-foundation': '民族音乐奠基',
  'national-prosperity': '民族乐派繁荣',
  'late-romantic': '晚期浪漫与过渡',
  'modern': '现代与苏联时期'
};

export default function ComposerDetail({ params }) {
  const [composer, setComposer] = useState(null);
  const [relatedComposers, setRelatedComposers] = useState([]);
  const slug = params.slug;

  useEffect(() => {
    const c = composers.find(comp => comp.id === slug);
    setComposer(c);
    if (slug) {
      const related = relationships
        .filter(r => r.from === slug || r.to === slug)
        .map(r => {
          const other = composers.find(c => c.id === (r.from === slug ? r.to : r.from));
          return other ? { ...other, relationType: r.type } : null;
        })
        .filter(Boolean);
      setRelatedComposers(related);
    }
  }, [slug]);

  if (!composer) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8899bb', fontSize: '1.1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>未找到该作曲家</h2>
        <Link href="/music-history/composers" style={{ color: '#6b8ccc' }}>← 返回作曲家列表</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#d0d8e8' }}>
      {/* Navigation */}
      <nav style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid rgba(100,140,200,0.15)',
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <Link href="/" style={{ color: '#6b8ccc', textDecoration: 'none', fontSize: '0.9rem' }}>← 返回</Link>
        <span style={{ color: 'rgba(100,140,200,0.3)' }}>|</span>
        <Link href="/music-history/composers" style={{ color: '#6b8ccc', textDecoration: 'none', fontSize: '0.9rem' }}>作曲家</Link>
        <span style={{ color: 'rgba(100,140,200,0.3)' }}>|</span>
        <span style={{ color: '#8899bb', fontSize: '0.9rem' }}>{composer.name}</span>
      </nav>

      {/* Hero Section */}
      <header style={{ 
        padding: '3rem 2rem',
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start',
        maxWidth: '1100px',
        margin: '0 auto',
        flexWrap: 'wrap'
      }}>
        {/* Portrait */}
        {composer.portrait && (
          <div style={{ 
            flexShrink: 0,
            width: '180px',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(100,140,200,0.2)',
            boxShadow: '0 0 30px rgba(80,120,200,0.1)'
          }}>
            <img 
              src={composer.portrait} 
              alt={composer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Name & Info */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ 
            fontSize: '2.2rem', 
            fontWeight: 700, 
            color: '#e8edf5',
            marginBottom: '0.3rem',
            fontFamily: '"Noto Serif SC", serif'
          }}>
            {composer.name}
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#7a8db5',
            marginBottom: '0.5rem',
            fontFamily: 'serif'
          }}>
            {composer.fullNameRu || composer.nameRu}
          </p>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#5a6d8f',
            marginBottom: '1.2rem'
          }}>
            {composer.birthYear}–{composer.deathYear}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {composer.school && (
              <span style={{
                padding: '0.3rem 0.8rem',
                background: 'rgba(80,120,200,0.1)',
                border: '1px solid rgba(80,120,200,0.2)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: '#8aa4d4'
              }}>
                {composer.school}
              </span>
            )}
            {composer.period && (
              <span style={{
                padding: '0.3rem 0.8rem',
                background: 'rgba(100,160,140,0.1)',
                border: '1px solid rgba(100,160,140,0.2)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: '#7db8a4'
              }}>
                {periodNames[composer.period] || composer.period}
              </span>
            )}
            {composer.mainCity && (
              <span style={{
                padding: '0.3rem 0.8rem',
                background: 'rgba(160,120,80,0.1)',
                border: '1px solid rgba(160,120,80,0.2)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: '#c4a87a'
              }}>
                {composer.mainCity}
              </span>
            )}
          </div>

          {/* Genres */}
          {composer.genres && composer.genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {composer.genres.map((g, i) => (
                <span key={i} style={{
                  padding: '0.2rem 0.6rem',
                  background: 'rgba(100,140,200,0.06)',
                  border: '1px solid rgba(100,140,200,0.12)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: '#7a8db5'
                }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Quote */}
      {composer.quote && composer.quote.trim() !== '' && (
        <section style={{ 
          maxWidth: '900px', 
          margin: '0 auto 2rem',
          padding: '0 2rem'
        }}>
          <div style={{
            padding: '1.5rem 2rem',
            background: 'rgba(80,120,200,0.05)',
            borderLeft: '3px solid rgba(100,150,220,0.4)',
            borderRadius: '0 8px 8px 0',
            fontFamily: '"Noto Serif SC", serif',
            fontSize: '1.05rem',
            color: '#9ab0d4',
            lineHeight: 1.8,
            fontStyle: 'italic'
          }}>
            "{composer.quote}"
          </div>
        </section>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        
        {/* Biography */}
        {composer.description && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#b8c8e0',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(100,140,200,0.15)',
              fontFamily: '"Noto Serif SC", serif'
            }}>
              生平与创作
            </h2>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 2,
              color: '#a0b0cc',
              textAlign: 'justify'
            }}>
              {composer.description}
            </p>
          </section>
        )}

        {/* Style */}
        {composer.style && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#b8c8e0',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(100,140,200,0.15)',
              fontFamily: '"Noto Serif SC", serif'
            }}>
              风格特征
            </h2>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 2,
              color: '#a0b0cc',
              textAlign: 'justify'
            }}>
              {composer.style}
            </p>
            {composer.styleRu && (
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.8,
                color: '#5a6d8f',
                marginTop: '0.8rem',
                fontStyle: 'italic'
              }}>
                {composer.styleRu}
              </p>
            )}
          </section>
        )}

        {/* Works */}
        {composer.works && composer.works.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#b8c8e0',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(100,140,200,0.15)',
              fontFamily: '"Noto Serif SC", serif'
            }}>
              代表作品
            </h2>
            <div style={{
              background: 'rgba(20,28,50,0.5)',
              borderRadius: '8px',
              border: '1px solid rgba(100,140,200,0.1)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(80,120,200,0.08)' }}>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#7a8db5', fontWeight: 500 }}>作品名称</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#7a8db5', fontWeight: 500 }}>俄语原名</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'center', fontSize: '0.85rem', color: '#7a8db5', fontWeight: 500, width: '80px' }}>年份</th>
                  </tr>
                </thead>
                <tbody>
                  {composer.works.map((w, i) => (
                    <tr key={i} style={{ 
                      borderTop: '1px solid rgba(100,140,200,0.06)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(80,120,200,0.02)'
                    }}>
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.9rem', color: '#c0cee0' }}>{w.title}</td>
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#7a8db5', fontStyle: 'italic' }}>{w.titleRu}</td>
                      <td style={{ padding: '0.7rem 1rem', fontSize: '0.85rem', color: '#5a6d8f', textAlign: 'center' }}>{w.year || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Russian Bio */}
        {composer.bioRu && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#8899bb',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(100,140,200,0.1)',
              fontFamily: 'serif'
            }}>
              Биография
            </h2>
            <p style={{
              fontSize: '0.88rem',
              lineHeight: 1.9,
              color: '#5a6d8f',
              fontStyle: 'italic'
            }}>
              {composer.bioRu}
            </p>
          </section>
        )}

        {/* Related Composers */}
        {relatedComposers.length > 0 && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#b8c8e0',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid rgba(100,140,200,0.15)',
              fontFamily: '"Noto Serif SC", serif'
            }}>
              相关作曲家
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
              {relatedComposers.map(r => (
                <Link 
                  key={r.id} 
                  href={`/composers/${r.id}`}
                  style={{
                    padding: '1rem',
                    background: 'rgba(20,28,50,0.5)',
                    border: '1px solid rgba(100,140,200,0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(100,150,220,0.3)';
                    e.currentTarget.style.background = 'rgba(30,40,70,0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(100,140,200,0.1)';
                    e.currentTarget.style.background = 'rgba(20,28,50,0.5)';
                  }}
                >
                  <div style={{ fontSize: '0.95rem', color: '#c0cee0', marginBottom: '0.3rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#5a6d8f', marginBottom: '0.4rem' }}>{r.nameRu}</div>
                  {r.relationType && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#7db8a4',
                      background: 'rgba(100,160,140,0.1)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px'
                    }}>
                      {r.relationType}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
