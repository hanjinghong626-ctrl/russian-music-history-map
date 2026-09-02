// v2.2 reconnect deploy
/* Russia Music Soul v2.1 - with atmosphere animations */
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { composers } from '../data/composers';
import { cities } from '../data/cities';
import RelationshipNetwork from './RelationshipNetwork';
import CityCard from './CityCard';
import './MapComponent.css';
import BasilCathedral from './BasilCathedral';

const createCustomIcon = (isActive = false, isHighlighted = false, isDimmed = false) => {
  let color = '#8B7355'; let size = 24; let innerSize = 8;
  if (isActive) { color = '#D4AF37'; size = 32; innerSize = 12; }
  else if (isHighlighted) { color = '#4A90D9'; size = 28; innerSize = 10; }
  if (isDimmed) { color = '#3a3a3a'; }
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-wrapper ${isActive?'active':''} ${isHighlighted?'highlighted':''} ${isDimmed?'dimmed':''}" style="width:${size}px;height:${size}px;position:relative;cursor:pointer;"><div style="position:absolute;inset:0;background:${color};border-radius:50%;box-shadow:0 0 ${isActive?'20px':'10px'} ${color}80;animation:marker-pulse ${isActive?'1.5s':'2.5s'} ease-in-out infinite;transition:all 0.3s ease;"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${innerSize}px;height:${innerSize}px;background:#0A0E17;border-radius:50%;border:2px solid ${color};"></div></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
};
const createCityIcon = () => { const s=14; return L.divIcon({ className:'city-marker', html:`<div style="width:${s}px;height:${s}px;background:#D4AF37;border-radius:50%;box-shadow:0 0 8px rgba(212,175,55,0.5),0 0 2px rgba(212,175,55,0.8);cursor:pointer;"></div>`, iconSize:[s,s], iconAnchor:[s/2,s/2] }); };
const createSmallCityIcon = () => { const s=10; return L.divIcon({ className:'city-marker small', html:`<div style="width:${s}px;height:${s}px;background:#9B8B6E;border-radius:50%;box-shadow:0 0 6px rgba(155,139,110,0.4),0 0 2px rgba(155,139,110,0.6);cursor:pointer;"></div>`, iconSize:[s,s], iconAnchor:[s/2,s/2] }); };

export default function MapComponent({ activePeriod, onComposerSelect, onCitySelect, mapCenter = [60, 50], mapZoom = 4 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const composerMapRef = useRef({});
  const [relationshipMode, setRelationshipMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { center: mapCenter, zoom: mapZoom, zoomControl: false, attributionControl: false, minZoom: 3, maxZoom: 12 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
    mapInstanceRef.current = map;
    const style = document.createElement('style');
    style.id = 'rel-dynamic-styles';
    style.textContent = `@keyframes marker-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.8}}.custom-marker{background:transparent!important;border:none!important}.city-marker{background:transparent!important;border:none!important}.leaflet-container{background:#0A0E17!important;font-family:'Noto Sans SC',sans-serif}.leaflet-control-zoom a{background:#141B2D!important;color:#D4AF37!important;border-color:rgba(212,175,55,.3)!important}.leaflet-control-zoom a:hover{background:#1E2A40!important}.leaflet-control-attribution{background:rgba(10,14,23,.8)!important;color:#6B7B8C!important;font-size:10px!important}.leaflet-control-attribution a{color:#B8C5D6!important}.marker-wrapper.dimmed>div:first-child{opacity:.12!important;box-shadow:none!important;animation:none!important}.marker-wrapper.dimmed>div:last-child{opacity:.12!important;border-color:#3a3a3a!important}`;
    document.head.appendChild(style);
    return () => { map.remove(); mapInstanceRef.current = null; document.getElementById('rel-dynamic-styles')?.remove(); };
  }, []);

  const handleCitySelect = (city) => { setSelectedCity(city); if (onCitySelect) onCitySelect(city); };
  const handleComposerSelectFromCard = (id) => { const c = composers.find(x => x.id === id); if (c && onComposerSelect) onComposerSelect(c); setSelectedCity(null); };

  useEffect(() => {
    const map = mapInstanceRef.current; if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m)); markersRef.current = [];
    cityMarkersRef.current.forEach(m => map.removeLayer(m)); cityMarkersRef.current = [];
    let filtered = activePeriod ? composers.filter(c => c.period === activePeriod.id) : composers;
    filtered.forEach(composer => {
      const marker = L.marker(composer.coordinates, { icon: createCustomIcon(false, false, false) });
      marker.bindTooltip(`<div class="marker-tooltip"><strong>${composer.name}</strong><br/><span>${composer.birthYear}-${composer.deathYear}</span></div>`, { className: 'custom-tooltip', direction: 'top', offset: [0, -12] });
      marker.on('click', () => onComposerSelect(composer));
      marker.composerId = composer.id; marker.addTo(map); markersRef.current.push(marker); composerMapRef.current[composer.id] = marker;
    });
    cities.forEach(city => {
      const hasImage = city.image && city.image.length > 0;
      const icon = hasImage ? createCityIcon() : createSmallCityIcon();
      const cm = L.marker(city.coords, { icon });
      const tc = hasImage ? `<div class="marker-tooltip city-tooltip"><strong>🏛 ${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">点击查看城市详情</span></div>` : `<div class="marker-tooltip city-tooltip small-city"><strong>🎵 ${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">更多城市开发中</span></div>`;
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
      <BasilCathedral cityActive={!!selectedCity} />
      <div className="map-instructions"><span>点击标记查看作曲家详情 · 点击城市查看详情 · 点击"关系网"按钮查看关系网络</span></div>

      {/* SNOW */}
      <div className="atmosphere-snow">
        <div className="snowflake s1"></div><div className="snowflake s2"></div><div className="snowflake s3"></div>
        <div className="snowflake s4"></div><div className="snowflake s5"></div><div className="snowflake s6"></div>
        <div className="snowflake s7"></div><div className="snowflake s8"></div><div className="snowflake s9"></div>
        <div className="snowflake s10"></div><div className="snowflake s11"></div><div className="snowflake s12"></div>
        <div className="snowflake s13"></div><div className="snowflake s14"></div><div className="snowflake s15"></div>
        <div className="snowflake s16"></div><div className="snowflake s17"></div><div className="snowflake s18"></div>
        <div className="snowflake s19"></div><div className="snowflake s20"></div>
      </div>

      {/* TROIKA - reindeer sleigh using generated image */}
      <div className="atmosphere-troika">
        <div className="troika-sleigh">
          <div className="troika-img"></div>
        </div>
      </div>

      {/* NOTES RIVER */}
      <div className="atmosphere-notes">
        <span className="gnote n1">♪</span><span className="gnote n2">♫</span><span className="gnote n3">♬</span><span className="gnote n4">♩</span>
        <span className="gnote n5">♪</span><span className="gnote n6">♫</span><span className="gnote n7">♬</span><span className="gnote n8">♩</span>
      </div>
    </div>
  );
}
