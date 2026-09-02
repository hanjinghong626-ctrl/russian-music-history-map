'use client';

import { periods } from '../data/periods';
import './Timeline.css';

export default function Timeline({ activePeriod, onPeriodChange }) {
  const handlePeriodClick = (period) => {
    onPeriodChange(period);
  };

  return (
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
                '--delay': `${index * 0.1}s`
              }}
            >
              <div className="timeline-dot">
                <div className="timeline-dot-inner"></div>
                <div className="timeline-dot-ring"></div>
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
      <div className="timeline-glow"></div>
    </div>
  );
}
