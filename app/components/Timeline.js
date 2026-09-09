'use client';

import { periods } from '../data/periods';

const INLINE_CSS = `
.timeline-container {
  position: relative;
  padding: 18px 0 12px;
  z-index: 100;
}
.timeline-track {
  position: relative;
  z-index: 2;
}
.timeline-line {
  position: absolute;
  top: 15px;
  left: 5%;
  right: 5%;
  height: 1px;
  background: rgba(180, 200, 220, 0.18);
}
.timeline-items {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  position: relative;
}
.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  outline: none;
  min-width: 70px;
  transition: transform 0.3s ease;
}
.timeline-item:hover {
  transform: translateY(-2px);
}
.timeline-dot {
  position: relative;
  width: 14px;
  height: 14px;
  margin-bottom: 8px;
}
.timeline-dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(160, 180, 200, 0.45);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  z-index: 3;
}
.timeline-item:hover .timeline-dot-inner {
  background: rgba(200, 215, 230, 0.7);
  width: 11px;
  height: 11px;
}
.timeline-item.active .timeline-dot-inner {
  width: 12px;
  height: 12px;
  background: var(--period-color, #B4C8DC);
}
.timeline-dot-ring { display: none; }
.timeline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.timeline-year {
  font-family: 'Cormorant Garamond', 'Noto Serif SC', Georgia, serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(190, 205, 220, 0.6);
  transition: color 0.3s ease;
}
.timeline-item:hover .timeline-year {
  color: rgba(220, 230, 240, 0.85);
}
.timeline-item.active .timeline-year {
  color: var(--period-color, #B4C8DC);
}
.timeline-name {
  font-family: 'Noto Serif SC', 'Cormorant Garamond', Georgia, serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(175, 195, 215, 0.55);
  white-space: nowrap;
  transition: color 0.3s ease;
}
.timeline-item:hover .timeline-name {
  color: rgba(215, 225, 240, 0.85);
}
.timeline-item.active .timeline-name {
  color: var(--period-color, #B4C8DC);
}
.timeline-name-ru {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 9px;
  font-style: italic;
  color: rgba(160, 180, 200, 0.4);
  white-space: nowrap;
  transition: color 0.3s ease;
}
.timeline-item:hover .timeline-name-ru {
  color: rgba(200, 215, 230, 0.7);
}
.timeline-item.active .timeline-name-ru {
  color: var(--period-color, #B4C8DC);
  opacity: 0.8;
}
.timeline-glow { display: none; }
@media (max-width: 768px) {
  .timeline-items { gap: 2px; }
  .timeline-item { min-width: 55px; }
  .timeline-name { font-size: 10px; }
  .timeline-name-ru { display: none; }
  .timeline-year { font-size: 10px; }
}
`;

export default function Timeline({ activePeriod, onPeriodChange }) {
  const handlePeriodClick = (period) => {
    onPeriodChange(period);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INLINE_CSS }} />
      <div className="timeline-container">
        <div className="timeline-track">
          <div className="timeline-line"></div>
          <div className="timeline-items">
            {periods.map((period, index) => (
              <button
                key={period.id}
                className={`timeline-item ${activePeriod?.id === period.id ? 'active' : ''}`}
                onClick={() => handlePeriodClick(period)}
                style={{
                  '--period-color': period.color,
                  '--period-accent': period.accentColor,
                }}
              >
                <div className="timeline-dot">
                  <div className="timeline-dot-inner"></div>
                </div>
                <div className="timeline-content">
                  <span className="timeline-year">
                    {period.startYear}-{period.endYear}
                  </span>
                  <span className="timeline-name">{period.name}</span>
                  <span className="timeline-name-ru">{period.nameRu}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
