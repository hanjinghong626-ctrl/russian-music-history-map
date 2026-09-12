'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { composers as allComposers } from '../data/composers';
import './StarTour.css';

// 按出生年排序
const sortedComposers = [...allComposers].sort((a, b) => a.birthYear - b.birthYear);

const SPEED_OPTIONS = [
  { label: '慢', value: 6000 },
  { label: '中', value: 4000 },
  { label: '快', value: 2500 },
];

export default function StarTour({ mapInstanceRef, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = 未开始
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [trail, setTrail] = useState([]); // 已走过的坐标
  const timerRef = useRef(null);
  const lineRef = useRef(null);

  const speed = SPEED_OPTIONS[speedIdx].value;
  const current = currentIndex >= 0 ? sortedComposers[currentIndex] : null;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 飞到指定作曲家
  const flyToComposer = useCallback((idx) => {
    const map = mapInstanceRef.current;
    if (!map || idx < 0 || idx >= sortedComposers.length) return;

    const composer = sortedComposers[idx];
    setCurrentIndex(idx);

    // 地图飞行
    map.flyTo(composer.coordinates, 5.5, { duration: 1.8, easeLinearity: 0.3 });

    // 添加轨迹线
    setTrail(prev => {
      const newTrail = [...prev, composer.coordinates];
      return newTrail;
    });

    // 更新轨迹 polyline
    if (lineRef.current) {
      try { map.removeLayer(lineRef.current); } catch (e) {}
      lineRef.current = null;
    }
    if (trail.length > 0 || true) {
      const allCoords = sortedComposers.slice(0, idx + 1).map(c => c.coordinates);
      if (allCoords.length > 1) {
        const line = L.polyline(allCoords, {
          color: 'rgba(180,210,255,0.35)',
          weight: 1.5,
          dashArray: '6,4',
          smoothFactor: 2,
        }).addTo(map);
        lineRef.current = line;
      }
    }
  }, [mapInstanceRef, trail]);

  // 自动播放
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    const nextIdx = currentIndex < 0 ? 0 : (currentIndex + 1 >= sortedComposers.length ? -1 : currentIndex + 1);
    
    if (nextIdx === -1) {
      // 播完了
      setIsPlaying(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      flyToComposer(nextIdx);
    }, currentIndex < 0 ? 500 : speed);

    return () => clearTimer();
  }, [isPlaying, currentIndex, speed, flyToComposer, clearTimer]);

  // 手动前后跳转
  const goTo = useCallback((idx) => {
    clearTimer();
    setIsPlaying(false);
    flyToComposer(Math.max(0, Math.min(idx, sortedComposers.length - 1)));
  }, [clearTimer, flyToComposer]);

  const togglePlay = useCallback(() => {
    if (currentIndex < 0) {
      // 首次播放
      setIsPlaying(true);
      flyToComposer(0);
    } else if (currentIndex >= sortedComposers.length - 1 && !isPlaying) {
      // 已播完，重新开始
      setTrail([]);
      setIsPlaying(true);
      flyToComposer(0);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [currentIndex, isPlaying, flyToComposer]);

  const skipBack = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const skipForward = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const cycleSpeed = useCallback(() => {
    setSpeedIdx(prev => (prev + 1) % SPEED_OPTIONS.length);
  }, []);

  // 关闭
  const handleClose = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    if (lineRef.current && mapInstanceRef.current) {
      try { mapInstanceRef.current.removeLayer(lineRef.current); } catch (e) {}
    }
    onClose();
  }, [clearTimer, mapInstanceRef, onClose]);

  // 键盘控制
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

  // 进度百分比
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / sortedComposers.length * 100) : 0;

  return (
    <div className="star-tour">
      {/* 底部时间轴 + 控制栏 */}
      <div className="st-bar">
        {/* 进度条 */}
        <div className="st-progress">
          <div className="st-progress-fill" style={{ width: `${progress}%` }} />
          {/* 刻度点 */}
          <div className="st-progress-dots">
            {sortedComposers.map((c, i) => (
              <span
                key={c.id}
                className={`st-dot ${i <= currentIndex ? 'visited' : ''} ${i === currentIndex ? 'current' : ''}`}
                style={{ left: `${(i / (sortedComposers.length - 1)) * 100}%` }}
                onClick={() => goTo(i)}
                title={`${c.name} (${c.birthYear})`}
              />
            ))}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="st-controls">
          <button className="st-btn" onClick={handleClose} title="关闭漫游 (Esc)">
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
          <button className="st-btn" onClick={skipForward} disabled={currentIndex >= sortedComposers.length - 1} title="下一位 (→)">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <rect x="15" y="5" width="2" height="10"/><path d="M4 5L12 10L4 15Z"/>
            </svg>
          </button>
          <button className="st-btn st-btn-speed" onClick={cycleSpeed} title="速度">
            {SPEED_OPTIONS[speedIdx].label}
          </button>
        </div>

        {/* 时间标注 */}
        <div className="st-era">
          <span className="st-era-year">{current ? current.birthYear : '—'}</span>
          <span className="st-era-name">{current ? current.name : '点击播放开始漫游'}</span>
          {currentIndex >= 0 && (
            <span className="st-era-idx">{currentIndex + 1} / {sortedComposers.length}</span>
          )}
        </div>
      </div>

      {/* 当前作曲家信息卡 */}
      {current && (
        <div className={`st-card ${isPlaying ? 'st-card-auto' : ''}`}>
          <div className="st-card-glow" style={{ '--glow-color': getPeriodColor(current.period) }} />
          <div className="st-card-period" style={{ color: getPeriodColor(current.period) }}>
            {getPeriodLabel(current.period)}
          </div>
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
          {current.birthPlace && (
            <p className="st-card-place">{current.birthPlace}</p>
          )}
        </div>
      )}
    </div>
  );
}

function getPeriodColor(period) {
  const map = {
    'classical': '#e8f0ff',
    'national-foundation': '#a0d8ff',
    'national-prosperity': '#ffe080',
    'late-romantic': '#ffc0d8',
    'soviet': '#c0e0ff',
  };
  return map[period] || '#e8f0ff';
}

function getPeriodLabel(period) {
  const map = {
    'classical': '古典先驱',
    'national-foundation': '民族奠基',
    'national-prosperity': '民族繁荣',
    'late-romantic': '白银时代',
    'soviet': '苏联学派',
  };
  return map[period] || '';
}
