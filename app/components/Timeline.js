'use client';

import { useState, useEffect } from 'react';
import { periods } from '../data/periods';

// Version marker for cache verification
const BUILD_VERSION = '20260909-v2';

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
  width: '10px',
  height: '10px',
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
  transition: 'color 0.3s ease',
};

const nameBaseStyle = {
  fontFamily: "'Noto Serif SC', 'Cormorant Garamond', Georgia, serif",
  fontSize: '11px',
  fontWeight: 500,
  color: 'rgba(175, 195, 215, 0.55)',
  whiteSpace: 'nowrap',
  transition: 'color 0.3s ease',
};

const nameRuBaseStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '9px',
  fontStyle: 'italic',
  color: 'rgba(160, 180, 200, 0.4)',
  whiteSpace: 'nowrap',
  transition: 'color 0.3s ease',
};

export default function Timeline({ activePeriod, onPeriodChange }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
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
              } : {}),
              ...(isHovered && !isActive ? {
                background: 'rgba(200, 215, 230, 0.7)',
                width: '11px',
                height: '11px',
              } : {}),
            };

            const yearStyle = {
              ...yearBaseStyle,
              ...(isActive ? { color: period.color } : {}),
              ...(isHovered && !isActive ? { color: 'rgba(220, 230, 240, 0.85)' } : {}),
            };

            const nameStyle = {
              ...nameBaseStyle,
              ...(isActive ? { color: period.color } : {}),
              ...(isHovered && !isActive ? { color: 'rgba(215, 225, 240, 0.85)' } : {}),
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
    </div>
  );
}
