'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './romance.css';

export default function RomanceEvolutionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [expandedOpus, setExpandedOpus] = useState(null);
  const [hoveredWork, setHoveredWork] = useState(null);
  const periodRefs = useRef({});

  useEffect(() => {
    fetch('/data/romance-evolution.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scrollToPeriod = (id) => {
    setActivePeriodId(id);
    const el = periodRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="romance-loading">
        <div className="loading-spinner"></div>
        <p>正在加载浪漫曲专题...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="romance-loading">
        <h2>加载失败</h2>
        <Link href="/" className="back-link">返回音乐史</Link>
      </div>
    );
  }

  const periods = data.periods || [];

  return (
    <div className="romance-page">
      {/* Header */}
      <header className="romance-header">
        <div className="header-bg"></div>
        <div className="header-content">
          <Link href="/" className="back-link">
            <span className="back-arrow">←</span> 返回音乐史
          </Link>
          <h1 className="romance-title">
            <span className="title-zh">{data.title_zh}</span>
            <span className="title-ru">{data.title_ru}</span>
          </h1>
          <p className="romance-subtitle">
            <span className="subtitle-zh">{data.subtitle_zh}</span>
            <span className="subtitle-divider">/</span>
            <span className="subtitle-ru">{data.subtitle_ru}</span>
          </p>
        </div>
      </header>

      {/* Timeline Navigation */}
      <nav className="timeline-nav">
        <div className="timeline-track">
          <div className="timeline-line"></div>
          {periods.map((p, i) => (
            <button
              key={p.id}
              className={`timeline-node ${activePeriodId === p.id ? 'active' : ''}`}
              onClick={() => scrollToPeriod(p.id)}
            >
              <span className="node-dot"></span>
              <span className="node-period">{p.period}</span>
              <span className="node-title">{p.title_zh}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Periods Content */}
      <main className="romance-main">
        {periods.map((period, idx) => (
          <section
            key={period.id}
            ref={el => { periodRefs.current[period.id] = el; }}
            className={`period-section period-depth-${idx % 3}`}
            id={`period-${period.id}`}
          >
            {/* Period Header */}
            <div className="period-header">
              <div className="period-marker">
                <span className="marker-line"></span>
                <span className="marker-dot"></span>
              </div>
              <div className="period-title-block">
                <span className="period-time">{period.period}</span>
                <h2 className="period-title-zh">{period.title_zh}</h2>
                <p className="period-title-ru">{period.title_ru}</p>
              </div>
            </div>

            {/* Background */}
            <div className="period-background">
              <p>{period.background_zh}</p>
            </div>

            {/* Style Features */}
            <div className="period-features">
              <h3 className="block-title">风格特征</h3>
              <ul className="features-list">
                {period.style_features.map((feat, i) => (
                  <li key={i} className="feature-item">{feat}</li>
                ))}
              </ul>
            </div>

            {/* Composers */}
            <div className="period-composers">
              <h3 className="block-title">核心作曲家</h3>
              <div className="composers-grid">
                {period.composers.map(comp => (
                  <Link
                    key={comp.slug}
                    href={comp.detail_slug ? `/composers/${comp.detail_slug}` : '#'}
                    className={`composer-card ${!comp.detail_slug ? 'no-link' : ''}`}
                  >
                    <div className="composer-avatar">
                      {comp.name_zh.charAt(0)}
                    </div>
                    <div className="composer-info">
                      <span className="composer-name-zh">{comp.name_zh}</span>
                      <span className="composer-name-ru">{comp.name_ru}</span>
                      <span className="composer-years">{comp.years}</span>
                    </div>
                    <p className="composer-role">{comp.role}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Opus Groups (Tchaikovsky only) */}
            {period.opus_groups && (
              <div className="period-opus-groups">
                <h3 className="block-title">作品号总览</h3>
                <div className="opus-grid">
                  {period.opus_groups.map(og => (
                    <div
                      key={og.opus}
                      className={`opus-card ${expandedOpus === og.opus ? 'expanded' : ''}`}
                      onClick={() => setExpandedOpus(expandedOpus === og.opus ? null : og.opus)}
                    >
                      <div className="opus-header">
                        <span className="opus-number">{og.opus}</span>
                        <span className="opus-year">{og.year}</span>
                        <span className="opus-count">{og.count}首</span>
                        <span className={`opus-arrow ${expandedOpus === og.opus ? 'open' : ''}`}>▼</span>
                      </div>
                      {expandedOpus === og.opus && (
                        <div className="opus-detail">
                          <p className="opus-description">{og.description_zh}</p>
                          {og.highlight_work && (
                            <Link
                              href={`/sheet-music/chaykovskiy`}
                              className="opus-highlight"
                            >
                              代表作：{og.highlight_work}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Works */}
            <div className="period-works">
              <h3 className="block-title">代表作品</h3>
              <div className="works-grid">
                {period.works.map((work, i) => (
                  <div
                    key={i}
                    className="work-card"
                    onMouseEnter={() => setHoveredWork(`${period.id}-${i}`)}
                    onMouseLeave={() => setHoveredWork(null)}
                  >
                    <div className="work-main">
                      <span className="work-title-ru">{work.title_ru}</span>
                      <span className="work-title-zh">{work.title_zh}</span>
                      {work.opus && <span className="work-opus">{work.opus}</span>}
                      {work.poet && <span className="work-poet">词：{work.poet}</span>}
                    </div>
                    {work.sheet_music_slug && (
                      <Link
                        href={`/sheet-music/${work.sheet_music_slug}`}
                        className="work-link"
                        onClick={e => e.stopPropagation()}
                      >
                        🎼 查看曲谱
                      </Link>
                    )}
                    {hoveredWork === `${period.id}-${i}` && work.significance && (
                      <div className="work-tooltip">
                        {work.significance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Quotes */}
            <div className="period-quotes">
              <h3 className="block-title">学术观点</h3>
              {period.academic_quotes.map((quote, i) => (
                <blockquote key={i} className="academic-quote">
                  <p className="quote-text">{quote.text}</p>
                  <footer className="quote-source">
                    <span className="source-name">—— {quote.source}</span>
                    {quote.source_detail && (
                      <span className="source-detail">{quote.source_detail}</span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Related Links */}
      <footer className="romance-footer">
        <h3 className="footer-title">延伸阅读</h3>
        <div className="related-links">
          {(data.related_links || []).map((link, i) => (
            <Link key={i} href={link.url} className="related-link">
              <span className="link-icon">{link.icon}</span>
              <span className="link-title">{link.title_zh}</span>
              <span className="link-arrow">→</span>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
