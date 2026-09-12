'use client';

import { composers } from '../data/composers';
import { relationships, relationshipConfig } from '../data/relationships';

// 星座卡片：点击星体后浮现在地图上的精致信息卡
export default function ConstellationCard({ composer, position, onClose }) {
  if (!composer) return null;

  const cfg = {
    'classical': { color: '#e8f0ff', glow: 'rgba(200,220,255,0.6)', label: '古典先驱' },
    'national-foundation': { color: '#a0d8ff', glow: 'rgba(130,200,255,0.6)', label: '民族奠基' },
    'national-prosperity': { color: '#ffe080', glow: 'rgba(240,200,100,0.6)', label: '民族繁荣' },
    'late-romantic': { color: '#ffc0d8', glow: 'rgba(240,168,200,0.6)', label: '白银时代' },
    'soviet': { color: '#c0e0ff', glow: 'rgba(168,208,240,0.6)', label: '苏联学派' },
  }[composer.period] || { color: '#e8f0ff', glow: 'rgba(200,220,255,0.6)', label: '' };

  // 代表作品（取前3首）
  const topWorks = (composer.works || []).slice(0, 3);

  // 关系：师承（from=this）= 学生，师承（to=this）= 老师
  const myRels = relationships.filter(r => r.from === composer.id || r.to === composer.id);
  const teachers = [];
  const students = [];
  const others = [];
  myRels.forEach(r => {
    const oid = r.from === composer.id ? r.to : r.from;
    const o = composers.find(c => c.id === oid);
    if (!o) return;
    if (r.type === 'mentor') {
      if (r.from === composer.id) students.push({ name: o.name, nameRu: o.nameRu || '', type: r.type, label: r.label });
      else teachers.push({ name: o.name, nameRu: o.nameRu || '', type: r.type, label: r.label });
    } else if (r.type === 'influence') {
      if (r.from === composer.id) students.push({ name: o.name, nameRu: o.nameRu || '', type: r.type, label: r.label });
      else teachers.push({ name: o.name, nameRu: o.nameRu || '', type: r.type, label: r.label });
    } else {
      others.push({ name: o.name, nameRu: o.nameRu || '', type: r.type, label: r.label });
    }
  });

  const typeColors = { mentor: '#D4AF37', influence: '#A0B4C8', collaboration: '#7EC8E3', opposition: '#E06060' };
  const typeIcons = { mentor: '◆', influence: '◇', collaboration: '○', opposition: '△' };

  return (
    <div className="constellation-card" style={{ left: position.x, top: position.y }}>
      {/* 关闭按钮 */}
      <button className="cc-close" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* 星芒装饰 */}
      <div className="cc-star-decor" style={{ color: cfg.color }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <line x1="16" y1="2" x2="16" y2="30" stroke={cfg.color} strokeWidth="1" opacity="0.6"/>
          <line x1="2" y1="16" x2="30" y2="16" stroke={cfg.color} strokeWidth="1" opacity="0.6"/>
          <line x1="5" y1="5" x2="27" y2="27" stroke={cfg.color} strokeWidth="0.6" opacity="0.3"/>
          <line x1="27" y1="5" x2="5" y2="27" stroke={cfg.color} strokeWidth="0.6" opacity="0.3"/>
          <circle cx="16" cy="16" r="3" fill="#fff" opacity="0.9"/>
        </svg>
      </div>

      {/* 作曲家信息 */}
      <div className="cc-header">
        <h3 className="cc-name">{composer.name}</h3>
        <p className="cc-name-ru">{composer.nameRu}</p>
        <div className="cc-meta">
          <span className="cc-period" style={{ color: cfg.color }}>{cfg.label}</span>
          <span className="cc-years">{composer.birthYear}–{composer.deathYear}</span>
        </div>
      </div>

      {/* 代表作品 */}
      {topWorks.length > 0 && (
        <div className="cc-section">
          <h4 className="cc-section-title" style={{ color: cfg.color }}>
            <span className="cc-section-icon"></span> 代表作品
          </h4>
          <ul className="cc-works-list">
            {topWorks.map((w, i) => (
              <li key={i} className="cc-work-item">
                <span className="cc-work-title">{w.title}</span>
                {w.titleRu && <span className="cc-work-ru">{w.titleRu}</span>}
                {w.year && <span className="cc-work-year">{w.year}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 师承关系 */}
      {(teachers.length > 0 || students.length > 0) && (
        <div className="cc-section">
          <h4 className="cc-section-title" style={{ color: cfg.color }}>
            <span className="cc-section-icon">✦</span> 星轨关系
          </h4>
          {teachers.length > 0 && (
            <div className="cc-rel-group">
              <span className="cc-rel-label" style={{ color: typeColors.mentor }}>师承</span>
              {teachers.map((t, i) => (
                <span key={i} className="cc-rel-name">
                  <span className="cc-rel-icon" style={{ color: typeColors[t.type] }}>{typeIcons[t.type]}</span>
                  {t.name}
                </span>
              ))}
            </div>
          )}
          {students.length > 0 && (
            <div className="cc-rel-group">
              <span className="cc-rel-label" style={{ color: typeColors.influence }}>传承</span>
              {students.map((s, i) => (
                <span key={i} className="cc-rel-name">
                  <span className="cc-rel-icon" style={{ color: typeColors[s.type] }}>{typeIcons[s.type]}</span>
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
