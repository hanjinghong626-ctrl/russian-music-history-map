'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { periods } from './data/periods';
import Timeline from './components/Timeline';
import Sidebar from './components/Sidebar';
import ComposerCard from './components/ComposerCard';
import './globals.css';

// Dynamic import MapComponent with ssr: false (Leaflet requires window)
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="loading-spinner"></div>
      <p>正在加载地图...</p>
    </div>
  )
});

export default function MusicHistoryPage() {
  const [activePeriod, setActivePeriod] = useState(periods[1]); // Start with national foundation
  const [selectedComposer, setSelectedComposer] = useState(null);

  const handlePeriodChange = useCallback((period) => {
    setActivePeriod(period);
    setSelectedComposer(null);
  }, []);

  const handleComposerSelect = useCallback((composer) => {
    setSelectedComposer(composer);
  }, []);

  const handleComposerClose = useCallback(() => {
    setSelectedComposer(null);
  }, []);

  const handleCitySelect = useCallback((city) => {
    // Could be expanded to show city details
    console.log('City selected:', city);
  }, []);

  return (
    <div className="music-history-page">
      <header className="page-header">
        <div className="header-logo">
          <span className="logo-icon">♪</span>
          <span className="logo-text">俄罗斯音乐史</span>
        </div>
        <nav className="header-nav">
          <a href="/" className="nav-link">返回首页</a>
          <a href="/" className="nav-link active">交互地图</a>
          <Link href="/composers" className="nav-link">作曲家</Link>
          <Link href="/schools" className="nav-link">学派</Link>
          <Link href="/topics/romance" className="nav-link">浪漫曲</Link>
          <Link href="/topics/opera" className="nav-link">歌剧</Link>
          <Link href="/mystery" className="nav-link">🎭 剧本杀</Link>
        </nav>
      </header>

      <main className="page-main">
        <Sidebar 
          activePeriod={activePeriod}
          selectedComposer={selectedComposer}
          onComposerSelect={handleComposerSelect}
        />
        
        <div className="map-container">
          <MapComponent
            activePeriod={activePeriod}
            onComposerSelect={handleComposerSelect}
            onCitySelect={handleCitySelect}
          />
        </div>
      </main>

      <Timeline 
        activePeriod={activePeriod}
        onPeriodChange={handlePeriodChange}
      />

      <ComposerCard 
        composer={selectedComposer}
        onClose={handleComposerClose}
      />

      <style jsx global>{`
        /* Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+SC:wght@300;400;500;600&family=Noto+Sans:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@400;500;600;700&display=swap');
        
        /* CSS Variables */
        :root {
          --color-primary: #D4AF37;
          --color-primary-light: #F4E4BA;
          --color-primary-dark: #8B7355;
          --color-secondary-blue: #1E3A5F;
          --color-secondary-red: #8B0000;
          --color-accent-passion: #FF4444;
          --color-accent-romance: #E8B4B8;
          --color-accent-mystic: #6B5B95;
          --color-bg-deep: #0A0E17;
          --color-bg-card: #141B2D;
          --color-bg-overlay: rgba(10, 14, 23, 0.95);
          --color-text-primary: #F5F5F5;
          --color-text-secondary: #B8C5D6;
          --color-text-muted: #6B7B8C;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Noto Sans SC', sans-serif;
          background: var(--color-bg-deep);
          color: var(--color-text-primary);
          overflow: hidden;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
}
