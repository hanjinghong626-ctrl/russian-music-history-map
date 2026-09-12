'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { composers as allComposers } from '../data/composers';
import './StarTour.css';

const SPEED_OPTIONS = [
  { label: '慢', ms: 6000 },
  { label: '中', ms: 4000 },
  { label: '快', ms: 2500 },
];

export default function StarTour({ mapInstanceRef, onClose }) {
  const sorted = useMemo(() => [...allComposers].sort((a, b) => a.birthYear - b.birthYear), []);

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef(null);
  const lineRef = useRef(null);
  const indexRef = useRef(-1); // 用 ref 跟踪索引，避免闭包陈旧问题

  const speed = SPEED_OPTIONS[speedIdx].ms;
  const current = currentIndex >= 0 && currentIndex < sorted.length ? sorted[currentIndex] : null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // 飞到指定作曲家
  const flyToComposer = useCallback((idx) => {
    const map = mapInstanceRef?.current;
    if (!map || idx < 0 || idx >= sorted.length) return;

    const composer = sorted[idx];
    indexRef.current = idx;
    setCurrentIndex(idx);

    map.flyTo(composer.coordinates, 5.5, { duration: 1.8, easeLinearity: 0.3 });

    // 轨迹线
    if (lineRef.current) {
      try { map.removeLayer(lineRef.current); } catch (e) {}
      lineRef.current = null;
    }
    const coords = sorted.slice(0, idx + 1).map(c => c.coordinates);
    if (coords.length > 1) {
      lineRef.current = L.polyline(coords, {
        color: 'rgba(180,210,255,0.35)',
        weight: 1.5,
        dashArray: '6,4',
        smoothFactor: 2,
      }).addTo(map);
    }
  }, [mapInstanceRef, sorted]);

  // 自动播放循环（用 ref 读取最新索引）
  useEffect(() => {
    if (!isPlaying) { clearTimer(); return; }

    const cur = indexRef.current;
    const nextIdx = cur < 0 ? 0 : cur + 1;

    if (nextIdx >= sorted.length) {
      setIsPlaying(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      flyToComposer(nextIdx);
    }, cur < 0 ? 500 : speed);

    return () => clearTimer();
  }, [isPlaying, speed, flyToComposer, clearTimer, sorted.length]);

  const goTo = useCallback((idx) => {
    clearTimer();
    setIsPlaying(false);
    const safeIdx = Math.max(0, Math.min(idx, sorted.length - 1));
    flyToComposer(safeIdx);
  }, [clearTimer, flyToComposer, sorted.length]);

  const togglePlay = useCallback(() => {
    const cur = indexRef.current;
    if (cur < 0) {
      setIsPlaying(true);
      flyToComposer(0);
    } else if (cur >= sorted.length - 1 && !isPlaying) {
      // 播完了，重置
      if (lineRef.current && mapInstanceRef?.current) {
        try { mapInstanceRef.current.removeLayer(lineRef.current); } catch (e) {}
        lineRef.current = null;
      }
      setIsPlaying(true);
      flyToComposer(0);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isPlaying, flyToComposer, sorted.length, mapInstanceRef]);

  const skipBack = useCallback(() => { goTo(indexRef.current - 1); }, [goTo]);
  const skipForward = useCallback(() => { goTo(indexRef.current + 1); }, [goTo]);
  const cycleSpeed = useCallback(() => { setSpeedIdx(p => (p + 1) % SPEED_OPTIONS.length); }, []);

  const handleClose = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    const map = mapInstanceRef?.current;
    if (lineRef.current && map) {
      try { map.removeLayer(lineRef.current); } catch (e) {}
      lineRef.current = null;
    }
    onClose();
  }, [clearTimer, mapInstanceRef, onClose]);

  // 键盘
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); skipForward(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); skipBack(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'Escape') { handleClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [skipForward, skipBack, togglePlay, handleClose]);

  const progress = currentIndex >= 0 ? ((currentIndex + 1) / sorted.length * 100) : 0;

  const pColor = (p) => {
    const m = { 'classical': '#e8f0ff', 'national-foundation': '#a0d8ff', 'national-prosperity': '#ffe080', 'late-romantic': '#ffc0d8', 'soviet': '#c0e0ff' };
    return m[p] || '#e8f0ff';
  };
  const pLabel = (p) => {
    const m = { 'classical': '古典先驱', 'national-foundation': '民族奠基', 'national-prosperity': '民族繁荣', 'late-romantic': '白银时代', 'soviet': '苏联学派' };
    return m[p] || '';
  };

  return (
    <div className="star-tour">
      {/* 底部时间轴 + 控制栏 */}
      <div className="st-bar">
        <div className="st-progress">
          <div className="st-progress-fill" style={{ width: `${progress}%` }} />
          <div className="st-progress-dots">
            {sorted.map((c, i) => (
              <span
                key={c.id}
                className={`st-dot ${i <= currentIndex ? 'visited' : ''} ${i === currentIndex ? 'current' : ''}`}
                style={{ left: `${(i / Math.max(sorted.length - 1, 1)) * 100}%` }}
                onClick={() => goTo(i)}
                title={`${c.name} (${c.birthYear})`}
              />
            ))}
          </div>
        </div>

        <div className="st-controls">
          <button className="st-btn" onClick={handleClose} title="关闭 (Esc)">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
          <button className="st-btn" onClick={skipBack} disabled={currentIndex <= 0} title="上一位 (←)">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <rect x="3" y="5" width="2" height="10"/><path d="M16 5L8 10L16 15Z"/>
            </svg>
          </button>
          <button className="st-btn st-btn-play" onClick={togglePlay} title={isPlaying ? '暂停 (Space)' : '播放 (Space)'}>
            {isPlaying ? (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                <rect x="5" y="4" width="3.5" height="12" rx="1"/><rect x="11.5" y="4" width="3.5" height="12" rx="1"/>
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                <path d="M6 4L16 10L6 16Z"/>
              </svg>
            )}
          </button>
          <button className="st-btn" onClick={skipForward} disabled={currentIndex >= sorted.length - 1} title="下一位 (→)">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <rect x="15" y="5" width="2" height="10"/><path d="M4 5L12 10L4 15Z"/>
            </svg>
          </button>
          <button className="st-btn st-btn-speed" onClick={cycleSpeed} title="速度">
            {SPEED_OPTIONS[speedIdx].label}
          </button>
        </div>

        <div className="st-era">
          <span className="st-era-year">{current ? current.birthYear : '—'}</span>
          <span className="st-era-name">{current ? current.name : '点击播放开始漫游'}</span>
          {currentIndex >= 0 && <span className="st-era-idx">{currentIndex + 1} / {sorted.length}</span>}
        </div>
      </div>

      {/* 作曲家信息卡 */}
      {current && (
        <div className={`st-card ${isPlaying ? 'st-card-auto' : ''}`}>
          <div className="st-card-glow" style={{ '--glow-color': pColor(current.period) }} />
          <div className="st-card-period" style={{ color: pColor(current.period) }}>{pLabel(current.period)}</div>
          <h3 className="st-card-name">{current.name}</h3>
          <p className="st-card-name-ru">{current.nameRu}</p>
          <p className="st-card-years">{current.birthYear} – {current.deathYear}</p>
          <p className="st-card-school">{current.school}</p>
          {current.works && current.works[0] && (
            <div className="st-card-work">
              <span className="st-card-work-label">代表作</span>
              <span className="st-card-work-title">{current.works[0].title}</span>
            </div>
          )}
          {current.birthPlace && <p className="st-card-place">{current.birthPlace}</p>}
        </div>
      )}
    </div>
  );
}
