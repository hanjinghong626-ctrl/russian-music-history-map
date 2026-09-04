// v4.0 星河银色版 - 建筑动画改银色 + 恢复底图 + 保留星空
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { composers } from '../data/composers';
import { cities } from '../data/cities';
import RelationshipNetwork from './RelationshipNetwork';
import CityCard from './CityCard';
import BasilCathedral from './BasilCathedral';
import './MapComponent.css';

// 学派颜色配置（星河配色）
const periodColors = {
  'classical': 'rgb(180,200,220)',
  'national-foundation': 'rgb(135,206,250)',
  'national-prosperity': 'rgb(255,215,140)',
  'late-romantic': 'rgb(255,182,193)',
  'soviet': 'rgb(220,220,230)',
};

const createCustomIcon = (isActive = false, isHighlighted = false, isDimmed = false, period = null) => {
  let color = periodColors[period] || 'rgb(180,200,220)';
  let size = 24; let innerSize = 8;
  if (isActive) { size = 32; innerSize = 12; }
  else if (isHighlighted) { size = 28; innerSize = 10; }
  if (isDimmed) { color = '#3a3a3a'; }
  const glowColor = color.replace('rgb', 'rgba').replace(')', ',0.6)');
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-wrapper ${isActive?'active':''} ${isHighlighted?'highlighted':''} ${isDimmed?'dimmed':''}" style="width:${size}px;height:${size}px;position:relative;cursor:pointer;"><div style="position:absolute;inset:0;background:${color};border-radius:50%;box-shadow:0 0 ${isActive?'24px':'14px'} ${glowColor},0 0 ${isActive?'40px':'24px'} ${glowColor.replace('0.6','0.2')};animation:marker-pulse ${isActive?'1.5s':'2.5s'} ease-in-out infinite;transition:all 0.3s ease;"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${innerSize}px;height:${innerSize}px;background:#050a14;border-radius:50%;border:2px solid ${color};box-shadow:0 0 6px ${color};"></div></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
};
const createCityIcon = () => { const s=14; return L.divIcon({ className:'city-marker', html:`<div style="width:${s}px;height:${s}px;background:#D4AF37;border-radius:50%;box-shadow:0 0 12px rgba(212,175,55,0.6),0 0 4px rgba(212,175,55,0.9);cursor:pointer;"></div>`, iconSize:[s,s], iconAnchor:[s/2,s/2] }); };
const createSmallCityIcon = () => { const s=10; return L.divIcon({ className:'city-marker small', html:`<div style="width:${s}px;height:${s}px;background:#9B8B6E;border-radius:50%;box-shadow:0 0 8px rgba(155,139,110,0.5);cursor:pointer;"></div>`, iconSize:[s,s], iconAnchor:[s/2,s/2] }); };

export default function MapComponent({ activePeriod, onComposerSelect, onCitySelect, mapCenter = [60, 50], mapZoom = 4 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const composerMapRef = useRef({});
  const [relationshipMode, setRelationshipMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // 星空粒子 HTML（useMemo 避免重复计算）
  const starsHTML = useMemo(() => {
    let html = '';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2.5 + 0.5;
      const opacity = Math.random() * 0.5 + 0.3;
      const delay = Math.random() * 6;
      const dur = 3 + Math.random() * 5;
      const blue = 200 + Math.floor(Math.random() * 55);
      html += `<div style="position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;background:rgba(${180+Math.floor(Math.random()*40)},${200+Math.floor(Math.random()*30)},${blue},${opacity.toFixed(2)});border-radius:50%;animation:starTwinkle ${dur.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite;will-change:opacity,transform;"></div>`;
    }
    return html;
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: mapCenter, zoom: mapZoom, zoomControl: false,
      attributionControl: false, minZoom: 3, maxZoom: 12,
      zoomSnap: 0.5, zoomDelta: 0.5,
    });

    // 切换为 OSM 标准瓦片 + CSS 暗色滤镜，避免 CARTO 配额水印
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '',
      className: 'osm-dark-tiles',
    }).addTo(map);

    // 动态注入全局样式
    const style = document.createElement('style');
    style.id = 'rel-dynamic-styles';
    style.textContent = `
      @keyframes starTwinkle {
        0%,100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.8); }
      }
      @keyframes marker-pulse {
        0%,100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.12); opacity: 0.85; }
      }
      @keyframes constellation-glow {
        0%,100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .custom-marker { background: transparent !important; border: none !important; }
      .city-marker { background: transparent !important; border: none !important; }
      .leaflet-container {
        background: radial-gradient(ellipse at 30% 40%, #0a1628 0%, #060e1a 40%, #030810 100%) !important;
        font-family: 'Noto Sans SC', sans-serif;
      }
      .leaflet-control-zoom a {
        background: rgba(10,21,32,0.85) !important;
        color: rgb(135,206,250) !important;
        border-color: rgba(135,206,250,0.25) !important;
        backdrop-filter: blur(8px);
      }
      .leaflet-control-zoom a:hover { background: rgba(135,206,250,0.15) !important; }
      /* OSM 暗色滤镜：深蓝黑底，保留国界地理轮廓，水印融入暗色 */
      .osm-dark-tiles {
        filter: brightness(0.32) contrast(1.5) hue-rotate(215deg);
      }
      .marker-wrapper.dimmed > div:first-child { opacity: 0.1 !important; box-shadow: none !important; animation: none !important; }
      .marker-wrapper.dimmed > div:last-child { opacity: 0.1 !important; border-color: #2a2a2a !important; }
    `;
    document.head.appendChild(style);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      document.getElementById('rel-dynamic-styles')?.remove();
    };
  }, []);

  const handleCitySelect = (city) => { setSelectedCity(city); if (onCitySelect) onCitySelect(city); };
  const handleComposerSelectFromCard = (id) => { const c = composers.find(x => x.id === id); if (c && onComposerSelect) onComposerSelect(c); setSelectedCity(null); };

  useEffect(() => {
    const map = mapInstanceRef.current; if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m)); markersRef.current = [];
    cityMarkersRef.current.forEach(m => map.removeLayer(m)); cityMarkersRef.current = [];
    if (window.constellationLines) { window.constellationLines.forEach(l => map.removeLayer(l)); window.constellationLines = []; }

    let filtered = activePeriod ? composers.filter(c => c.period === activePeriod.id) : composers;
    filtered.forEach(composer => {
      const marker = L.marker(composer.coordinates, { icon: createCustomIcon(false, false, false, composer.period) });
      marker.bindTooltip(`<div class="marker-tooltip"><strong>${composer.name}</strong><br/><span>${composer.birthYear}-${composer.deathYear}</span></div>`, { className: 'custom-tooltip', direction: 'top', offset: [0, -12] });
      marker.on('click', () => onComposerSelect(composer));
      marker.composerId = composer.id; marker.addTo(map); markersRef.current.push(marker); composerMapRef.current[composer.id] = marker;
    });

    // 星座连线（带辉光）
    const constellationLines = [];
    const schoolGroups = {};
    filtered.forEach(c => {
      if (!schoolGroups[c.period]) schoolGroups[c.period] = [];
      schoolGroups[c.period].push(c);
    });

    const schoolConstellation = {
      'classical': { color: 'rgba(180,200,220,0.9)', name: '北极星·古典先驱' },
      'national-foundation': { color: 'rgba(135,206,250,0.9)', name: '北斗·民族奠基' },
      'national-prosperity': { color: 'rgba(255,215,140,0.9)', name: '天琴·民族繁荣' },
      'late-romantic': { color: 'rgba(255,182,193,0.9)', name: '仙后·白银时代' },
      'soviet': { color: 'rgba(220,220,230,0.9)', name: '南十字·苏联学派' }
    };

    Object.entries(schoolGroups).forEach(([period, members]) => {
      if (members.length > 1 && schoolConstellation[period]) {
        const cfg = schoolConstellation[period];
        // 辉光底层线（粗、半透明）
        for (let i = 0; i < members.length - 1; i++) {
          const glow = L.polyline(
            [members[i].coordinates, members[i + 1].coordinates],
            { color: cfg.color, weight: 6, dashArray: '8,6', opacity: 0.15 }
          );
          glow.addTo(map);
          constellationLines.push(glow);
        }
        // 主体线
        for (let i = 0; i < members.length - 1; i++) {
          const line = L.polyline(
            [members[i].coordinates, members[i + 1].coordinates],
            { color: cfg.color, weight: 2, dashArray: '6,4', opacity: 0.95 }
          );
          line.addTo(map);
          constellationLines.push(line);
        }
        // 星座标签（暗色底衬）
        if (members.length >= 3) {
          const centerLat = members.reduce((s, m) => s + m.coordinates[0], 0) / members.length;
          const centerLng = members.reduce((s, m) => s + m.coordinates[1], 0) / members.length;
          const label = L.divIcon({
            className: 'constellation-label',
            html: `<div style="background:rgba(5,10,20,0.85);backdrop-filter:blur(6px);border:1px solid ${cfg.color};border-radius:6px;padding:4px 10px;color:${cfg.color};font-family:'Noto Serif SC',serif;font-size:11px;white-space:nowrap;letter-spacing:1px;text-shadow:0 0 8px ${cfg.color};animation:constellation-glow 3s ease-in-out infinite;pointer-events:none;">${cfg.name}</div>`,
            iconSize: [140, 24],
            iconAnchor: [70, 12]
          });
          const labelMarker = L.marker([centerLat, centerLng], { icon: label, interactive: false });
          labelMarker.addTo(map);
          constellationLines.push(labelMarker);
        }
      }
    });
    window.constellationLines = constellationLines;

    cities.forEach(city => {
      const hasImage = city.image && city.image.length > 0;
      const icon = hasImage ? createCityIcon() : createSmallCityIcon();
      const cm = L.marker(city.coords, { icon });
      const tc = hasImage ? `<div class="marker-tooltip city-tooltip"><strong>🏛 ${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">点击查看城市详情</span></div>` : `<div class="marker-tooltip city-tooltip small-city"><strong> ${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">更多城市开发中</span></div>`;
      cm.bindTooltip(tc, { className: 'custom-tooltip city ' + (hasImage ? '' : 'small'), direction: 'top', offset: [0, hasImage ? -18 : -14] });
      cm.on('click', () => { if (city.image) handleCitySelect(city); });
      cm.addTo(map); cityMarkersRef.current.push(cm);
    });
  }, [activePeriod, onComposerSelect]);

  const toggleRelationshipMode = () => setRelationshipMode(prev => !prev);
  const composerCount = composers.length;

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="leaflet-map" />

      {/* 星空 overlay - 独立于 Leaflet DOM */}
      <div className="starfield-overlay" dangerouslySetInnerHTML={{ __html: starsHTML }} />

      {/* 俄罗斯标志性建筑动画 - 银色星座版 */}
      <BasilCathedral cityActive={!!selectedCity} />

      <div className="map-overlay-tl">
        <div className="map-title-elegant">
          <div className="title-main">俄罗斯音乐之魂</div>
          <div className="title-divider"></div>
          <div className="title-sub">跨越三百年 · {composerCount}位作曲家 · 47段师承</div>
        </div>
      </div>
      {activePeriod && (
        <div className="map-overlay-tr">
          <div className="period-indicator" style={{ '--period-color': activePeriod.color }}>
            <span className="period-name">{activePeriod.name}</span>
            <span className="period-years">{activePeriod.startYear}-{activePeriod.endYear}</span>
          </div>
        </div>
      )}
      <button className={`rel-toggle-btn ${relationshipMode ? 'active' : ''}`} onClick={toggleRelationshipMode} title={relationshipMode ? "退出关系网" : "查看关系网"}>
        <svg className="rel-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2.5" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="2.5" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="2.5" fill="currentColor" stroke="none"/><line x1="7.2" y1="10.5" x2="16.8" y2="6.5" strokeDasharray="3,2"/><line x1="7.2" y1="13.5" x2="16.8" y2="17.5" strokeDasharray="3,2"/></svg>
        关系网
      </button>
      {relationshipMode && <RelationshipNetwork onClose={() => setRelationshipMode(false)} />}
      {selectedCity && <CityCard city={selectedCity} composers={composers} onClose={() => setSelectedCity(null)} onSelectComposer={handleComposerSelectFromCard} />}
      <div className="map-instructions"><span>点击标记查看作曲家详情 · 点击城市查看详情 · 点击"关系网"按钮查看关系网络</span></div>
    </div>
  );
}
