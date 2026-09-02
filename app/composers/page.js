'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { composers } from '../data/composers';
import { periods } from '../data/periods';

export default function ComposersListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePeriod, setActivePeriod] = useState('all');

  const filteredComposers = useMemo(() => {
    let result = composers;
    
    // Filter by period
    if (activePeriod !== 'all') {
      result = result.filter(c => c.period === activePeriod);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.nameRu.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.style?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [searchQuery, activePeriod]);

  return (
    <div className="composers-list-page">
      <header className="list-header">
        <div className="header-content">
          <Link href="/" className="back-link">
            <span className="back-arrow">←</span> 返回音乐史
          </Link>
          <h1 className="page-title">俄罗斯作曲家</h1>
          <p className="page-subtitle">Русские композиторы — {composers.length}位作曲家</p>
        </div>
      </header>

      <main className="list-main">
        {/* Search & Filter */}
        <div className="filter-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="搜索作曲家姓名、风格..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <div className="period-filters">
            <button 
              className={`period-btn ${activePeriod === 'all' ? 'active' : ''}`}
              onClick={() => setActivePeriod('all')}
            >
              全部
            </button>
            {periods.map(p => (
              <button
                key={p.id}
                className={`period-btn ${activePeriod === p.id ? 'active' : ''}`}
                onClick={() => setActivePeriod(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="results-info">
          共 {filteredComposers.length} 位作曲家
        </div>

        {/* Composers Grid */}
        <div className="composers-grid">
          {filteredComposers.map(composer => (
            <Link 
              key={composer.id}
              href={`/composers/${composer.id}`}
              className="composer-card"
            >
              <div className="card-portrait">
                {composer.portrait ? (
                  <img 
                    src={composer.portrait} 
                    alt={composer.name}
                    className="card-portrait-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className="card-portrait-placeholder" style={{ display: composer.portrait ? 'none' : 'flex' }}>
                  <span>♪</span>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-name">{composer.name}</h3>
                <p className="card-name-ru">{composer.nameRu}</p>
                <div className="card-years">{composer.birthYear}—{composer.deathYear}</div>
                <div className="card-school">{composer.school}</div>
                {composer.genres && composer.genres.length > 0 && (
                  <div className="card-genres">
                    {composer.genres.slice(0, 3).map((g, i) => (
                      <span key={i} className="genre-tag">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredComposers.length === 0 && (
          <div className="no-results">
            <p>未找到匹配的作曲家</p>
            <button className="clear-btn" onClick={() => { setSearchQuery(''); setActivePeriod('all'); }}>
              清除筛选条件
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        .composers-list-page {
          min-height: 100vh;
          background: var(--color-bg-deep);
          color: var(--color-text-primary);
          font-family: 'Noto Sans SC', sans-serif;
        }

        /* Header */
        .list-header {
          background: var(--color-bg-card);
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          padding: 24px;
        }

        .header-content {
          max-width: 1200px;
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
        .list-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Filter */
        .filter-bar {
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: var(--color-bg-card);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          padding: 0 16px;
          margin-bottom: 16px;
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: var(--color-primary);
        }

        .search-icon {
          font-size: 16px;
          margin-right: 8px;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-text-primary);
          font-size: 15px;
          padding: 12px 0;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: var(--color-text-muted);
        }

        .search-clear {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
        }

        .period-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .period-btn {
          background: rgba(212, 175, 55, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.15);
          color: var(--color-text-secondary);
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .period-btn:hover {
          border-color: rgba(212, 175, 55, 0.3);
          color: var(--color-primary);
        }

        .period-btn.active {
          background: rgba(212, 175, 55, 0.15);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .results-info {
          font-size: 14px;
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }

        /* Grid */
        .composers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .composer-card {
          display: flex;
          gap: 14px;
          background: var(--color-bg-card);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 10px;
          padding: 16px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .composer-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.1);
        }

        .card-portrait {
          width: 64px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(212, 175, 55, 0.05);
        }

        .card-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-portrait-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--color-primary);
          opacity: 0.4;
        }

        .card-info {
          flex: 1;
          min-width: 0;
        }

        .card-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .card-name-ru {
          font-size: 12px;
          color: var(--color-text-muted);
          font-style: italic;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-years {
          font-size: 13px;
          color: var(--color-primary);
          margin-bottom: 4px;
        }

        .card-school {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .card-genres {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .genre-tag {
          font-size: 11px;
          color: var(--color-text-muted);
          background: rgba(212, 175, 55, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* No results */
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-text-muted);
        }

        .clear-btn {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: var(--color-primary);
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 12px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: rgba(212, 175, 55, 0.2);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 24px;
          }

          .composers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
