'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './ComposerCard.css';

export default function ComposerCard({ composer, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('zh'); // 'zh' or 'ru'

  useEffect(() => {
    if (composer) {
      setIsVisible(true);
      setActiveTab('zh');
    }
  }, [composer]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!composer) return null;

  const periodThemes = {
    'classical': { primary: '#7C3AED', accent: '#312E81' },
    'national-foundation': { primary: '#A78BFA', accent: '#6D28D9' },
    'national-prosperity': { primary: '#A78BFA', accent: '#6D28D9' },
    'late-romantic': { primary: '#A78BFA', accent: '#F472B6' },
    'soviet': { primary: '#818CF8', accent: '#F472B6' }
  };

  const theme = periodThemes[composer.period] || periodThemes['national-foundation'];

  return (
    <div 
      className={`composer-card-overlay ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        className="composer-card"
        style={{
          '--card-primary': theme.primary,
          '--card-accent': theme.accent
        }}
      >
        <div className="card-bloom"></div>
        
        <button className="card-close" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="card-header">
          <div className="card-avatar">
            {composer.portrait ? (
              <>
                <img src={composer.portrait} alt={composer.name} className="card-portrait" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <span className="card-initial" style={{display: 'none'}}>{composer.name.charAt(0)}</span>
              </>
            ) : (
              <span className="card-initial">{composer.name.charAt(0)}</span>
            )}
            <div className="card-avatar-ring"></div>
          </div>
          <div className="card-titles">
            <h2 className="card-name">{composer.name}</h2>
            <p className="card-name-ru-full">{composer.nameRu}</p>
            <p className="card-name-en">{composer.nameEn}</p>
          </div>
        </div>

        <div className="card-meta">
          <div className="meta-item">
            <span className="meta-label">生卒</span>
            <span className="meta-value">{composer.birthYear} - {composer.deathYear}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">流派</span>
            <span className="meta-value">{composer.school}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">城市</span>
            <span className="meta-value">{composer.mainCity}</span>
          </div>
        </div>

        <div className="card-genres">
          {composer.genres.map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>

        {/* 双语简介切换 */}
        <div className="card-bio-section">
          <div className="bio-tabs">
            <button 
              className={`bio-tab ${activeTab === 'zh' ? 'active' : ''}`}
              onClick={() => setActiveTab('zh')}
            >
              中文简介
            </button>
            <button 
              className={`bio-tab ${activeTab === 'ru' ? 'active' : ''}`}
              onClick={() => setActiveTab('ru')}
            >
              Русский
            </button>
          </div>
          
          <div className="bio-content">
            {activeTab === 'zh' ? (
              <p className="bio-text">{composer.description}</p>
            ) : (
              <p className="bio-text bio-text-ru">{composer.bioRu}</p>
            )}
          </div>
        </div>

        {/* 风格特色 */}
        {(composer.style || composer.styleRu) && (
          <div className="card-style-section">
            <h3 className="section-title">风格特色</h3>
            <div className="style-content">
              {activeTab === 'zh' && composer.style && (
                <p className="style-text">{composer.style}</p>
              )}
              {activeTab === 'ru' && composer.styleRu && (
                <p className="style-text style-text-ru">{composer.styleRu}</p>
              )}
            </div>
          </div>
        )}

        <div className="card-works">
          <h3 className="section-title">代表作品</h3>
          <div className="works-list">
            {composer.works && composer.works.map((work, index) => (
              <div key={index} className="work-item">
                <div className="work-icon">♪</div>
                <div className="work-info">
                  <span className="work-title">{work.title}</span>
                  {work.titleRu && (
                    <span className="work-title-ru">{work.titleRu}</span>
                  )}
                </div>
                {work.year && (
                  <span className="work-year">{work.year}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card-footer">
          <div className="footer-decoration"></div>
          <Link 
            href={`/composers/${composer.id}`} 
            className="card-detail-link"
            onClick={handleClose}
          >
            查看完整资料 →
          </Link>
        </div>
      </div>
    </div>
  );
}
