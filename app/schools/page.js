'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/schools.json')
      .then(r => r.json())
      .then(data => {
        setSchools(data.schools || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="schools-loading">
        <div className="loading-spinner"></div>
        <p>正在加载学派资料...</p>
      </div>
    );
  }

  return (
    <div className="schools-page">
      <header className="schools-header">
        <div className="header-content">
          <Link href="/" className="back-link">
            <span className="back-arrow">←</span> 返回音乐史
          </Link>
          <h1 className="page-title">俄罗斯音乐学派</h1>
          <p className="page-subtitle">Русские музыкальные школы — 传承脉络与核心特征</p>
        </div>
      </header>

      <main className="schools-main">
        {schools.map(school => (
          <section key={school.id} className="school-section">
            {/* School Header */}
            <div 
              className="school-header-card"
              onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
            >
              <div className="school-icon">{school.icon}</div>
              <div className="school-title-block">
                <h2 className="school-name-zh">{school.name_zh}</h2>
                <p className="school-name-ru">{school.name_ru}</p>
              </div>
              <span className={`expand-arrow ${expandedSchool === school.id ? 'expanded' : ''}`}>▼</span>
            </div>

            {/* School Content */}
            <div className={`school-content ${expandedSchool === school.id ? 'open' : ''}`}>
              {/* Overview */}
              <div className="content-block">
                <h3 className="block-title">概述</h3>
                <p className="block-text">{school.overview}</p>
              </div>

              {/* Origin */}
              <div className="content-block">
                <h3 className="block-title">起源</h3>
                <p className="block-text">{school.origin_zh}</p>
              </div>

              {/* Core Features */}
              <div className="content-block">
                <h3 className="block-title">核心特征</h3>
                <div className="feature-list">
                  {school.core_features.map((feat, i) => (
                    <div key={i} className="feature-item">
                      <span className="feature-bullet">◆</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lineage Tree */}
              <div className="content-block">
                <h3 className="block-title">传承脉络</h3>
                <div className="lineage-tree">
                  {school.lineage.map((gen, i) => (
                    <div key={i} className="lineage-generation">
                      <div className="gen-connector">
                        {i > 0 && <div className="connector-line"></div>}
                      </div>
                      <div className="gen-card">
                        <div className="gen-period">{gen.period}</div>
                        <div className="gen-description">{gen.description_zh}</div>
                        <div className="gen-figures">
                          {gen.figures_zh.map((fig, j) => (
                            <span key={j} className="gen-figure">{fig}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Figures */}
              <div className="content-block">
                <h3 className="block-title">代表人物</h3>
                <div className="figures-grid">
                  {school.key_figures.map((fig, i) => (
                    <div key={i} className="figure-card">
                      <div className="figure-name">{fig.name_zh}</div>
                      <div className="figure-name-ru">{fig.name_ru}</div>
                      <div className="figure-role">{fig.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source */}
              <div className="source-block">
                <span className="source-label">信息来源：</span>
                <span className="source-text">{school.source}</span>
              </div>
            </div>
          </section>
        ))}
      </main>

      <style jsx>{`
        .schools-page {
          min-height: 100vh;
          background: var(--color-bg-deep);
          color: var(--color-text-primary);
          font-family: 'Noto Sans SC', sans-serif;
        }

        .schools-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-deep);
          color: var(--color-text-primary);
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 175, 55, 0.2);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Header */
        .schools-header {
          background: var(--color-bg-card);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          padding: 24px;
        }

        .header-content {
          max-width: 960px;
          margin: 0 auto;
        }

        .back-link {
          color: var(--color-primary);
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 16px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--color-primary-light);
        }

        .page-title {
          font-family: 'Noto Serif SC', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 15px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        /* Main */
        .schools-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px;
        }

        /* School Section */
        .school-section {
          margin-bottom: 20px;
        }

        .school-header-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--color-bg-card);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 12px;
          padding: 20px 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .school-header-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
        }

        .school-icon {
          font-size: 36px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.08);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .school-title-block {
          flex: 1;
        }

        .school-name-zh {
          font-family: 'Noto Serif SC', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 4px;
        }

        .school-name-ru {
          font-size: 14px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .expand-arrow {
          font-size: 12px;
          color: var(--color-text-muted);
          transition: transform 0.3s;
        }

        .expand-arrow.expanded {
          transform: rotate(180deg);
        }

        /* Content */
        .school-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-out;
          padding: 0 24px;
        }

        .school-content.open {
          max-height: 3000px;
          padding: 24px;
        }

        .content-block {
          margin-bottom: 24px;
        }

        .block-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--color-primary-light);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .block-title::before {
          content: '◇';
          font-size: 10px;
          color: var(--color-primary);
        }

        .block-text {
          font-size: 15px;
          line-height: 1.8;
          color: var(--color-text-secondary);
        }

        /* Features */
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature-item {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .feature-bullet {
          color: var(--color-primary);
          font-size: 10px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        /* Lineage Tree */
        .lineage-tree {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .lineage-generation {
          display: flex;
          gap: 16px;
        }

        .gen-connector {
          width: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .connector-line {
          width: 2px;
          flex: 1;
          background: linear-gradient(to bottom, var(--color-primary), rgba(212, 175, 55, 0.3));
          margin: 4px 0;
        }

        .gen-card {
          flex: 1;
          background: rgba(212, 175, 55, 0.04);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 12px;
        }

        .gen-period {
          font-size: 13px;
          color: var(--color-primary);
          margin-bottom: 6px;
          font-weight: 500;
        }

        .gen-description {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .gen-figures {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .gen-figure {
          background: rgba(212, 175, 55, 0.1);
          color: var(--color-primary);
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        /* Key Figures */
        .figures-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .figure-card {
          background: rgba(20, 27, 45, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 8px;
          padding: 14px;
          transition: border-color 0.2s;
        }

        .figure-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
        }

        .figure-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .figure-name-ru {
          font-size: 12px;
          color: var(--color-text-muted);
          font-style: italic;
          margin-bottom: 6px;
        }

        .figure-role {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }

        /* Source */
        .source-block {
          padding: 12px 16px;
          background: rgba(20, 27, 45, 0.5);
          border-radius: 6px;
          border-left: 3px solid var(--color-primary);
        }

        .source-label {
          font-size: 13px;
          color: var(--color-text-muted);
        }

        .source-text {
          font-size: 13px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 24px;
          }

          .school-header-card {
            padding: 14px 16px;
          }

          .school-icon {
            font-size: 28px;
            width: 44px;
            height: 44px;
          }

          .school-name-zh {
            font-size: 18px;
          }

          .figures-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
