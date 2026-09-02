'use client';

import { useState, useEffect } from 'react';
import { composers } from '../data/composers';
import './Sidebar.css';

export default function Sidebar({ activePeriod, selectedComposer, onComposerSelect }) {
  const [periodComposers, setPeriodComposers] = useState([]);
  
  useEffect(() => {
    if (activePeriod) {
      const filtered = composers.filter(c => c.period === activePeriod.id);
      setPeriodComposers(filtered);
    } else {
      setPeriodComposers(composers.slice(0, 8));
    }
  }, [activePeriod]);

  const handleComposerClick = (composer) => {
    onComposerSelect(composer);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-decoration"></div>
        <h2 className="sidebar-title">
          {activePeriod ? activePeriod.name : '俄罗斯音乐史'}
        </h2>
        {activePeriod && (
          <>
            <p className="sidebar-period-name">{activePeriod.nameRu}</p>
            <p className="sidebar-years">
              {activePeriod.startYear} - {activePeriod.endYear}
            </p>
          </>
        )}
      </div>

      {activePeriod && (
        <div className="sidebar-description">
          <p>{activePeriod.description}</p>
        </div>
      )}

      {activePeriod && activePeriod.keyEvents && (
        <div className="sidebar-events">
          <h3 className="sidebar-section-title">关键事件</h3>
          <ul className="events-list">
            {activePeriod.keyEvents.map((event, index) => (
              <li key={index} className="event-item">
                <span className="event-icon">✦</span>
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-composers">
        <h3 className="sidebar-section-title">
          {activePeriod ? '代表作曲家' : '推荐作曲家'}
        </h3>
        <div className="composers-list">
          {periodComposers.length > 0 ? (
            periodComposers.map((composer) => (
              <button
                key={composer.id}
                className={`composer-item ${selectedComposer?.id === composer.id ? 'active' : ''}`}
                onClick={() => handleComposerClick(composer)}
              >
                <div className="composer-avatar">
                  <span className="composer-initial">
                    {composer.name.charAt(0)}
                  </span>
                </div>
                <div className="composer-info">
                  <span className="composer-name">{composer.name}</span>
                  <span className="composer-name-ru">{composer.nameRu}</span>
                  <span className="composer-years">
                    {composer.birthYear}-{composer.deathYear}
                  </span>
                  <span className="composer-school">{composer.school}</span>
                </div>
                <div className="composer-arrow">
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </button>
            ))
          ) : (
            <p className="no-composers">该时期暂无数据</p>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-decoration-line"></div>
        <p className="sidebar-hint">点击作曲家查看详情</p>
        <p className="composer-count">
          共 {composers.length} 位作曲家
        </p>
      </div>
    </div>
  );
}
