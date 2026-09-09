'use client';

import { useState, useEffect } from 'react';
import { periods } from '../data/periods';

const BUILD_VERSION = '20260909-v3-glow';

const containerStyle = {
  position: 'relative',
  padding: '18px 0 12px',
  zIndex: 100,
};

const trackStyle = {
  position: 'relative',
  zIndex: 2,
};

const lineStyle = {
  position: 'absolute',
  top: '15px',
  left: '5%',
  right: '5%',
  height: '1px',
  background: 'rgba(180, 200, 220, 0.18)',
};

const itemsContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 5%',
  position: 'relative',
};

const itemBaseStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  outline: 'none',
  minWidth: '70px',
  transition: 'transform 0.3s ease',
};

const dotStyle = {
  position: 'relative',
  width: '14px',
  height: '14px',
  marginBottom: '8px',
};

const dotInnerBaseStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: 'rgba(160, 180, 200, 0.45)',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'all 0.3s ease',
  zIndex: 3,
};

const dotRingBaseStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: '1px solid rgba(180, 200, 220, 0.25)',
  animation: 'timeline-pulse 2.5s ease-in-out infinite',
  zIndex: 2,
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1px',
};

const yearBaseStyle = {
  fontFamily: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.5px',
  color: 'rgba(190, 205, 220, 0.6)',
  transition: 'color 0.3s ease, text-shadow 0.3s ease',
};

const nameBaseStyle = {
  fontFamily: "'Noto Serif SC', 'Cormorant Garamond', Georgia, serif",
  fontSize: '11px',
  fontWeight: 500,
  color: 'rgba(175, 195, 215, 0.55)',
  whiteSpace: 'nowrap',
  transition: 'color 0.3s ease, text-shadow 0.3s ease',
};

const nameRuBaseStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '9px',
  fontStyle: 'italic',
  color: 'rgba(160, 180, 200, 0.4)',
  whiteSpace: 'nowrap',
  transition: 'color 0.3s ease',
};

const glowStyle = {
  position: 'absolute',
  bottom: '-20px',
  left: '10%',
  right: '10%',
  height: '40px',
  background: 'radial-gradient(ellipse at center, rgba(135, 206, 250, 0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex: 1,
};

export default function Timeline({ activePeriod, onPeriodChange }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes timeline-pulse {
            0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
          }
        `}} />
      )}
      <div style={containerStyle} data-build={BUILD_VERSION}>
        <div style={trackStyle}>
          <div style={lineStyle}></div>
          <div style={itemsContainerStyle}>
            {periods.map((period) => {
              const isActive = activePeriod?.id === period.id;
              const isHovered = hoveredId === period.id;

              const dotInnerStyle = {
                ...dotInnerBaseStyle,
                ...(isActive ? {
                  background: period.color,
                  width: '12px',
                  height: '12px',
                  boxShadow: `0 0 12px ${period.color}`,
                } : {}),
                ...(isHovered && !isActive ? {
                  background: 'rgba(200, 215, 230, 0.7)',
                  width: '11px',
                  height: '11px',
                  boxShadow: '0 0 8px rgba(200, 215, 230, 0.5)',
                } : {}),
              };

              const dotRingStyle = isActive ? {
                ...dotRingBaseStyle,
                borderColor: period.color,
                animationDuration: '1.5s',
              } : dotRingBaseStyle;

              const yearStyle = {
                ...yearBaseStyle,
                ...(isActive ? {
                  color: period.color,
                  textShadow: `0 0 8px ${period.color}`,
                } : {}),
                ...(isHovered && !isActive ? {
                  color: 'rgba(220, 230, 240, 0.85)',
                  textShadow: '0 0 6px rgba(200, 215, 230, 0.4)',
                } : {}),
              };

              const nameStyle = {
                ...nameBaseStyle,
                ...(isActive ? {
                  color: period.color,
                  textShadow: `0 0 10px ${period.color}`,
                } : {}),
                ...(isHovered && !isActive ? {
                  color: 'rgba(215, 225, 240, 0.85)',
                  textShadow: '0 0 6px rgba(200, 215, 230, 0.3)',
                } : {}),
              };

              const nameRuStyle = {
                ...nameRuBaseStyle,
                ...(isActive ? { color: period.color, opacity: 0.8 } : {}),
                ...(isHovered && !isActive ? { color: 'rgba(200, 215, 230, 0.7)' } : {}),
              };

              return (
                <button
                  key={period.id}
                  style={{
                    ...itemBaseStyle,
                    ...(isHovered ? { transform: 'translateY(-2px)' } : {}),
                  }}
                  onClick={() => onPeriodChange(period)}
                  onMouseEnter={() => setHoveredId(period.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={dotStyle}>
                    <div style={dotInnerStyle}></div>
                    <div style={dotRingStyle}></div>
                  </div>
                  <div style={contentStyle}>
                    <span style={yearStyle}>
                      {period.startYear}-{period.endYear}
                    </span>
                    <span style={nameStyle}>{period.name}</span>
                    <span style={nameRuStyle}>{period.nameRu}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={glowStyle}></div>
      </div>
    </>
  );
}
