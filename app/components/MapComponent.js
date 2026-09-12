// v5.2 师承关系落回地图 - 星航联动(显影仪飞至城市) + 北极光/银河/流星 + 连线流光
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { composers } from '../data/composers';
import { cities } from '../data/cities';
import RelationshipNetwork from './RelationshipNetwork';
import { relationships, relationshipConfig } from '../data/relationships';
import CityCard from './CityCard';
import ConstellationCard from './ConstellationCard';
import BasilCathedral from './BasilCathedral';
import './MapComponent.css';

// 学派颜色配置（星河配色）——保留供 schoolConstellation / 连线使用
const periodColors = {
  'classical': 'rgb(210,225,245)',
  'national-foundation': 'rgb(130,200,255)',
  'national-prosperity': 'rgb(240,200,100)',
  'late-romantic': 'rgb(240,170,200)',
  'soviet': 'rgb(170,210,240)',
};

// 四色星辰·星体配置：进阶细芒星 - 带闪烁+星爆效果
const periodStarConfig = {
  'classical': {
    color: '#e8f0ff',
    glow: 'rgba(200,220,255,0.9)',
    coreSize: 2.2,
    spikeLen: 14,
    haloSize: 20,
    name: '古典先驱',
  },
  'national-foundation': {
    color: '#a0d8ff',
    glow: 'rgba(130,200,255,0.95)',
    coreSize: 2.4,
    spikeLen: 15,
    haloSize: 21,
    name: '民族奠基',
  },
  'national-prosperity': {
    color: '#ffe080',
    glow: 'rgba(240,200,100,0.95)',
    coreSize: 2.6,
    spikeLen: 16,
    haloSize: 22,
    name: '民族繁荣',
  },
  'late-romantic': {
    color: '#ffc0d8',
    glow: 'rgba(240,168,200,0.9)',
    coreSize: 2.4,
    spikeLen: 15,
    haloSize: 21,
    name: '白银时代',
  },
  'soviet': {
    color: '#c0e0ff',
    glow: 'rgba(168,208,240,0.9)',
    coreSize: 2.2,
    spikeLen: 14,
    haloSize: 20,
    name: '苏联学派',
  },
};

const createCustomIcon = (isActive = false, isHighlighted = false, isDimmed = false, period = null) => {
  const cfg = periodStarConfig[period] || periodStarConfig.classical;
  let color = cfg.color;
  let scale = 1;
  if (isActive) scale = 1.6;
  else if (isHighlighted) scale = 1.25;
  if (isDimmed) color = '#3a3a3a';

  const stateClass = [isActive ? 'active' : '', isHighlighted ? 'highlighted' : '', isDimmed ? 'dimmed' : ''].filter(Boolean).join(' ');
  const animDur = isActive ? '1.6s' : '3.4s';

  // 进阶细芒星 SVG：更细光芒 + 多层光晕 + 闪烁
  const coreR = cfg.coreSize * scale;
  const spikeLen = cfg.spikeLen * scale;
  const haloR = cfg.haloSize * scale;
  const size = Math.round(haloR * 2.4);
  const h = size / 2;
  const spikeWidth = Math.max(0.6, 1 * scale);
  const cid = cfg.coreSize;
  
  const defs = [
    '<defs>',
    '<radialGradient id="hg' + cid + '" cx="50%" cy="50%" r="50%">',
    '<stop offset="0%" stop-color="' + cfg.glow + '" stop-opacity="0.25"/>',
    '<stop offset="60%" stop-color="' + cfg.glow + '" stop-opacity="0.08"/>',
    '<stop offset="100%" stop-color="' + cfg.glow + '" stop-opacity="0"/>',
    '</radialGradient>',
    '<radialGradient id="mg' + cid + '" cx="50%" cy="50%" r="50%">',
    '<stop offset="0%" stop-color="' + cfg.glow + '" stop-opacity="0.5"/>',
    '<stop offset="100%" stop-color="' + cfg.glow + '" stop-opacity="0"/>',
    '</radialGradient>',
    '<linearGradient id="sgv' + cid + '" x1="0%" y1="0%" x2="0%" y2="100%">',
    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.95"/>',
    '<stop offset="60%" stop-color="' + color + '" stop-opacity="0.4"/>',
    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>',
    '</linearGradient>',
    '<linearGradient id="sgh' + cid + '" x1="0%" y1="0%" x2="100%" y2="0%">',
    '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.95"/>',
    '<stop offset="60%" stop-color="' + color + '" stop-opacity="0.4"/>',
    '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>',
    '</linearGradient>',
    '</defs>'
  ].join('');
  
  const halo = '<circle cx="' + h + '" cy="' + h + '" r="' + (haloR * 1.2) + '" fill="url(#hg' + cid + ')" opacity="0.7"/>' +
               '<circle cx="' + h + '" cy="' + h + '" r="' + (haloR * 0.7) + '" fill="url(#mg' + cid + ')" opacity="0.8"/>';
  
  const mainSpikes = [
    '<line x1="' + h + '" y1="' + (h - coreR) + '" x2="' + h + '" y2="' + (h - spikeLen) + '" stroke="url(#sgv' + cid + ')" stroke-width="' + spikeWidth + '" stroke-linecap="round"/>',
    '<line x1="' + h + '" y1="' + (h + coreR) + '" x2="' + h + '" y2="' + (h + spikeLen) + '" stroke="url(#sgv' + cid + ')" stroke-width="' + spikeWidth + '" stroke-linecap="round"/>',
    '<line x1="' + (h - coreR) + '" y1="' + h + '" x2="' + (h - spikeLen) + '" y2="' + h + '" stroke="url(#sgh' + cid + ')" stroke-width="' + spikeWidth + '" stroke-linecap="round"/>',
    '<line x1="' + (h + coreR) + '" y1="' + h + '" x2="' + (h + spikeLen) + '" y2="' + h + '" stroke="url(#sgh' + cid + ')" stroke-width="' + spikeWidth + '" stroke-linecap="round"/>'
  ].join('');
  
  const shortSpikes = [
    '<line x1="' + (h - coreR * 0.7) + '" y1="' + (h - coreR * 0.7) + '" x2="' + (h - spikeLen * 0.65) + '" y2="' + (h - spikeLen * 0.65) + '" stroke="url(#sgv' + cid + ')" stroke-width="' + (spikeWidth * 0.6) + '" stroke-linecap="round" opacity="0.55"/>',
    '<line x1="' + (h + coreR * 0.7) + '" y1="' + (h + coreR * 0.7) + '" x2="' + (h + spikeLen * 0.65) + '" y2="' + (h + spikeLen * 0.65) + '" stroke="url(#sgv' + cid + ')" stroke-width="' + (spikeWidth * 0.6) + '" stroke-linecap="round" opacity="0.55"/>',
    '<line x1="' + (h + coreR * 0.7) + '" y1="' + (h - coreR * 0.7) + '" x2="' + (h + spikeLen * 0.65) + '" y2="' + (h - spikeLen * 0.65) + '" stroke="url(#sgh' + cid + ')" stroke-width="' + (spikeWidth * 0.6) + '" stroke-linecap="round" opacity="0.55"/>',
    '<line x1="' + (h - coreR * 0.7) + '" y1="' + (h + coreR * 0.7) + '" x2="' + (h - spikeLen * 0.65) + '" y2="' + (h + spikeLen * 0.65) + '" stroke="url(#sgh' + cid + ')" stroke-width="' + (spikeWidth * 0.6) + '" stroke-linecap="round" opacity="0.55"/>'
  ].join('');
  
  const core = '<circle cx="' + h + '" cy="' + h + '" r="' + coreR + '" fill="#fff" opacity="0.98"/>';
  const coreInner = '<circle cx="' + h + '" cy="' + h + '" r="' + (coreR * 0.55) + '" fill="' + color + '" opacity="0.9"/>';
  const coreTiny = '<circle cx="' + h + '" cy="' + h + '" r="' + (coreR * 0.2) + '" fill="#fff"/>';
  
  const starSVG = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' + defs + halo + mainSpikes + shortSpikes + core + coreInner + coreTiny + '</svg>';

  return L.divIcon({
    className: 'custom-marker',
    html: '<div class="marker-wrapper ' + stateClass + '" style="width:' + size + 'px;height:' + size + 'px;position:relative;cursor:pointer;">' +
      '<div class="star-halo" style="position:absolute;inset:-' + Math.round(size * 0.1) + 'px;background:radial-gradient(circle,' + cfg.glow.replace(/0.9/, '0.12').replace(/0.95/, '0.12') + ' 0%,transparent 75%);animation:star-breathe ' + animDur + ' ease-in-out infinite;opacity:' + (isActive ? '1' : '0.7') + ';"></div>' +
      '<div class="star-body" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 ' + (isActive ? '12px' : '6px') + ' ' + cfg.glow + ');animation:star-twinkle ' + (isActive ? '1.6s' : (2.5 + Math.random() * 1.5).toFixed(1) + 's') + ' ease-in-out infinite;">' + starSVG + '</div>' +
    '</div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
const createCityIcon = () => {
  const s = 14;
  const delay = (Math.random() * 3.8).toFixed(2);
  return L.divIcon({ className: 'city-marker', html: `<div style="width:${s}px;height:${s}px;position:relative;cursor:pointer;"><span class="city-ripple" style="animation-delay:${delay}s"></span><div style="position:absolute;inset:0;background:#D4AF37;border-radius:50%;box-shadow:0 0 12px rgba(212,175,55,0.6),0 0 4px rgba(212,175,55,0.9);"></div></div>`, iconSize: [s, s], iconAnchor: [s/2, s/2] });
};
const createSmallCityIcon = () => { const s=10; return L.divIcon({ className:'city-marker small', html:`<div style="width:${s}px;height:${s}px;background:#9B8B6E;border-radius:50%;box-shadow:0 0 8px rgba(155,139,110,0.5);cursor:pointer;"></div>`, iconSize:[s,s], iconAnchor:[s/2,s/2] }); };

const createFlyBeaconIcon = () => L.divIcon({
  className: 'fly-beacon-marker',
  html: `<div class="fly-beacon"><span class="fb-ring r1"></span><span class="fb-ring r2"></span><span class="fb-core"></span></div>`,
  iconSize: [60, 60], iconAnchor: [30, 30],
});

export default function MapComponent({ activePeriod, onComposerSelect, onCitySelect, mapCenter = [60, 50], mapZoom = 4 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const composerMapRef = useRef({});
  const flowDotsRef = useRef([]);
  const relLinesRef = useRef([]);
  const selIdRef = useRef(null);
  const [selectedComposerId, setSelectedComposerId] = useState(null);
  const [constellationPos, setConstellationPos] = useState(null);
  const [constellationComposer, setConstellationComposer] = useState(null);
  const skyMeteorRef = useRef(null);
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

    // ===== 自绘星图底图：精细陆地 + 国界 + 分级发光地名（无水印/无外部瓦片） =====
    const landLayer = L.geoJSON(null, {
      style: {
        color: 'rgba(150,195,235,0.42)',
        weight: 0.9,
        fillColor: 'rgba(22,36,60,0.75)',
        fillOpacity: 1,
        lineJoin: 'round',
      },
      interactive: false,
    }).addTo(map);

    const boundsLayer = L.geoJSON(null, {
      style: { color: 'rgba(175,212,248,0.95)', weight: 1.1, dashArray: '4,3' },
      interactive: false,
    }).addTo(map);

    const countryLayer = L.geoJSON(null, {
      pointToLayer: (f, latlng) => L.marker(latlng, {
        icon: L.divIcon({
          className: '',
          html: `<div class="star-country-label">${f.properties.zh}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false, keyboard: false,
      }),
    }).addTo(map);

    const cityLayer = L.geoJSON(null, {
      pointToLayer: (f, latlng) => {
        const p = f.properties;
        const cls = ['star-city', 'r' + p.r];
        if (p.r <= 1) cls.push('major');
        if (p.ruflag) cls.push('ru');
        return L.marker(latlng, {
          icon: L.divIcon({
            className: '',
            html: `<div class="${cls.join(' ')}">
                     <span class="star-city-dot"></span>
                     <span class="star-city-name">${p.zh}<em>${p.ru}</em></span>
                   </div>`,
            iconSize: [0, 0],
          }),
          interactive: false, keyboard: false,
        });
      },
    }).addTo(map);

    const loadGeo = (url, layer) =>
      fetch(url).then(r => r.json()).then(d => layer.addData(d)).catch(() => {});

    loadGeo('/land-lite.geojson', landLayer);
    loadGeo('/bounds-lite.geojson', boundsLayer);
    loadGeo('/country-labels-lite.geojson', countryLayer);
    loadGeo('/places-lite.geojson', cityLayer);

    const updateLabelZoom = () => {
      const z = map.getZoom();
      const el = map.getContainer();
      el.classList.toggle('z-low', z < 3);
      el.classList.toggle('z-mid', z >= 3 && z < 5);
      el.classList.toggle('z-high', z >= 5);
    };
    map.on('zoomend', updateLabelZoom);
    updateLabelZoom();

    // 动态注入全局样式
    const style = document.createElement('style');
    style.id = 'rel-dynamic-styles';
    style.textContent = `
      /* —— 星图底图标签 —— */
      .star-country-label {
        transform: translate(-50%, -50%);
        font-size: 11px; letter-spacing: 4px;
        color: rgba(170,205,240,0.5);
        text-shadow: 0 0 8px rgba(100,160,220,0.6);
        white-space: nowrap; font-weight: 300;
      }
      .star-city { position: relative; }
      .star-city-dot {
        position: absolute; left: 0; top: 0;
        width: 3px; height: 3px; border-radius: 50%;
        background: rgba(190,220,250,0.8);
        transform: translate(-50%, -50%);
        box-shadow: 0 0 5px rgba(150,200,250,0.9);
      }
      .star-city.major .star-city-dot,
      .star-city.ru.r2 .star-city-dot {
        width: 5px; height: 5px;
        background: rgb(220,238,255);
        box-shadow: 0 0 9px rgba(170,215,255,1), 0 0 18px rgba(140,190,255,0.6);
      }
      .star-city.ru .star-city-dot {
        background: rgb(205,230,255);
        box-shadow: 0 0 6px rgba(160,205,255,0.95);
      }
      .star-city-name {
        position: absolute; left: 8px; top: -9px;
        font-size: 11px; line-height: 1.25;
        color: rgba(200,225,250,0.92);
        text-shadow: 0 0 6px rgba(90,150,220,0.8), 0 1px 3px rgba(0,0,0,0.9);
        white-space: nowrap; font-weight: 400;
      }
      .star-city-name em {
        display: block; font-style: normal; font-size: 9px;
        color: rgba(150,190,225,0.6); letter-spacing: 0.5px;
      }
      /* 城市名默认隐藏，按缩放层级分级显示 */
      .star-city-name { display: none; }
      .star-city.ru .star-city-name { color: rgba(215,235,255,0.95); }
      .star-city.ru .star-city-name em { color: rgba(170,205,240,0.7); }
      /* 低缩放：仅首都级 */
      .leaflet-container.z-low .star-city.major .star-city-name { display: block; }
      .leaflet-container.z-low .star-country-label { opacity: 1; }
      /* 中缩放：首都级 + 俄罗斯 r0-r3 主要城市 */
      .leaflet-container.z-mid .star-city.major .star-city-name,
      .leaflet-container.z-mid .star-city.ru.r0 .star-city-name,
      .leaflet-container.z-mid .star-city.ru.r1 .star-city-name,
      .leaflet-container.z-mid .star-city.ru.r2 .star-city-name,
      .leaflet-container.z-mid .star-city.ru.r3 .star-city-name { display: block; }
      .leaflet-container.z-mid .star-country-label { opacity: 0.25; }
      /* 高缩放：俄罗斯全部城市 + 各国主要城市 */
      .leaflet-container.z-high .star-city.ru .star-city-name,
      .leaflet-container.z-high .star-city.major .star-city-name,
      .leaflet-container.z-high .star-city.r2 .star-city-name,
      .leaflet-container.z-high .star-city.r3 .star-city-name { display: block; }
      .leaflet-container.z-high .star-country-label { opacity: 0.12; }
      @keyframes starTwinkle {
        0%,100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.8); }
      }
      @keyframes marker-pulse {
        0%,100% { transform: scale(1); opacity: 1; filter: brightness(1); }
        50% { transform: scale(1.06); opacity: 0.9; filter: brightness(1.15); }
      }

      @keyframes star-breathe {
        0%,100% { opacity: 0.55; transform: scale(0.92); }
        50% { opacity: 1; transform: scale(1.12); }
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
      .marker-wrapper.dimmed > .star-halo { opacity: 0 !important; animation: none !important; }
      .marker-wrapper.dimmed > .star-body { opacity: 0.15 !important; box-shadow: none !important; animation: none !important; filter: grayscale(1); }
      .marker-wrapper.dimmed > .star-core { opacity: 0.15 !important; border-color: #2a2a2a !important; box-shadow: none !important; }
      /* 四色星辰·星图图例 */




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

  // ===== 全域流星：12-21 秒随机一颗 =====
  useEffect(() => {
    const el = skyMeteorRef.current;
    if (!el) return;
    let timer;
    const launch = () => {
      el.classList.remove('go');
      void el.offsetWidth; // 重排以重启动画
      el.style.top = (3 + Math.random() * 10) + '%';
      el.style.left = (62 + Math.random() * 26) + '%';
      el.classList.add('go');
      timer = setTimeout(launch, 16000 + Math.random() * 12000);
    };
    timer = setTimeout(launch, 8000 + Math.random() * 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current; if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m)); markersRef.current = [];
    cityMarkersRef.current.forEach(m => map.removeLayer(m)); cityMarkersRef.current = [];
    if (window.constellationLines) { window.constellationLines.forEach(l => map.removeLayer(l)); window.constellationLines = []; }
    // 清理上一轮流光点
    flowDotsRef.current.forEach(({ g, upd }) => { try { map.off('zoomend', upd); } catch (e) {} g.remove(); });
    flowDotsRef.current = [];

    // 切换时代时清除关系线
    relLinesRef.current.forEach(item => { try { map.removeLayer(item.line); map.removeLayer(item.glow); item.halos.forEach(h => map.removeLayer(h)); if(item._upd) map.off('zoomend', item._upd); if(item._g) item._g.remove(); } catch(e){} });
    relLinesRef.current = [];
    const hint = document.querySelector('.rel-hint'); if (hint) hint.remove();

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const flowDots = [];

    let filtered = activePeriod ? composers.filter(c => c.period === activePeriod.id) : composers;
    filtered.forEach(composer => {
      const marker = L.marker(composer.coordinates, { icon: createCustomIcon(false, false, false, composer.period) });
      marker.bindTooltip(`<div class="marker-tooltip"><strong>${composer.name}</strong><br/><span>${composer.birthYear}-${composer.deathYear}</span></div>`, { className: 'custom-tooltip', direction: 'top', offset: [0, -12] });
      marker.on('click', () => {
        onComposerSelect(composer);
        const cid = composer.id;
        const wasSelected = selIdRef.current === cid;
        // 清除旧标记选中态
        if (selIdRef.current && composerMapRef.current[selIdRef.current]) {
          const oldEl = composerMapRef.current[selIdRef.current].getElement();
          if (oldEl) { const w = oldEl.querySelector('.marker-wrapper'); if (w) w.classList.remove('composer-selected'); }
        }
        if (wasSelected) {
          setSelectedComposerId(null);
          selIdRef.current = null;
        } else {
          setSelectedComposerId(cid);
          selIdRef.current = cid;
          const el = marker.getElement();
          if (el) { const w = el.querySelector('.marker-wrapper'); if (w) w.classList.add('composer-selected'); }
        }
      });
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
      'classical': { color: 'rgba(228,236,255,0.95)', name: '北极星·古典先驱' },
      'national-foundation': { color: 'rgba(130,200,255,0.95)', name: '北斗·民族奠基' },
      'national-prosperity': { color: 'rgba(240,200,100,0.95)', name: '天琴·民族繁荣' },
      'late-romantic': { color: 'rgba(240,168,200,0.95)', name: '仙后·白银时代' },
      'soviet': { color: 'rgba(168,208,240,0.95)', name: '南十字·苏联学派' }
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
        // 主体线 + 沿线流光巡行点
        for (let i = 0; i < members.length - 1; i++) {
          const line = L.polyline(
            [members[i].coordinates, members[i + 1].coordinates],
            { color: cfg.color, weight: 2, dashArray: '6,4', opacity: 0.95 }
          );
          line.addTo(map);
          constellationLines.push(line);

          // 师承流光：光点沿虚线缓缓流动（SVG 原生 animateMotion，不占 JS 重绘）
          const pathEl = line.getElement && line.getElement();
          if (pathEl && pathEl.getAttribute('d')) {
            const d = pathEl.getAttribute('d');
            const g = document.createElementNS(SVG_NS, 'g');
            g.style.pointerEvents = 'none';
            const halo = document.createElementNS(SVG_NS, 'circle');
            halo.setAttribute('r', '5');
            halo.setAttribute('fill', cfg.color);
            halo.setAttribute('opacity', '0.28');
            const core = document.createElementNS(SVG_NS, 'circle');
            core.setAttribute('r', '2.3');
            core.setAttribute('fill', '#f2f8ff');
            core.setAttribute('opacity', '0.95');
            const dur = (4.5 + Math.random() * 2.8).toFixed(2);
            const begin = (-Math.random() * 7).toFixed(2);
            [halo, core].forEach(c => {
              const am = document.createElementNS(SVG_NS, 'animateMotion');
              am.setAttribute('path', d);
              am.setAttribute('dur', dur + 's');
              am.setAttribute('begin', begin + 's');
              am.setAttribute('repeatCount', 'indefinite');
              c.appendChild(am);
              g.appendChild(c);
            });
            pathEl.parentNode.appendChild(g);
            const upd = () => {
              const p = line.getElement();
              if (!p) return;
              const nd = p.getAttribute('d');
              g.querySelectorAll('animateMotion').forEach(am => am.setAttribute('path', nd));
            };
            map.on('zoomend', upd);
            flowDots.push({ g, upd });
          }
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
    flowDotsRef.current = flowDots;

    cities.forEach(city => {
      const hasImage = city.image && city.image.length > 0;
      const icon = hasImage ? createCityIcon() : createSmallCityIcon();
      const cm = L.marker(city.coords, { icon });
      const tc = hasImage ? `<div class="marker-tooltip city-tooltip"><strong>${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">点击查看城市详情</span></div>` : `<div class="marker-tooltip city-tooltip small-city"><strong> ${city.name}</strong><br/><span>${city.nameRu}</span><br/><span style="font-size:10px;opacity:.7">更多城市开发中</span></div>`;
      cm.bindTooltip(tc, { className: 'custom-tooltip city ' + (hasImage ? '' : 'small'), direction: 'top', offset: [0, hasImage ? -18 : -14] });
      cm.on('click', () => { if (city.image) handleCitySelect(city); });
      cm.addTo(map); cityMarkersRef.current.push(cm);
    });
  }, [activePeriod, onComposerSelect]);


  // ===== 师承关系落回地图：点击作曲家 → 关系线流光点亮 =====
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // 清除旧关系线
    relLinesRef.current.forEach(item => {
      try { map.removeLayer(item.line); map.removeLayer(item.glow); item.halos.forEach(h => map.removeLayer(h)); } catch(e){}
    });
    relLinesRef.current = [];
    const hint = document.querySelector('.rel-hint');
    if (hint) hint.remove();
    if (!selectedComposerId) return;

    const c = composers.find(x => x.id === selectedComposerId);
    if (!c) return;
    const rels = relationships.filter(r => r.from === selectedComposerId || r.to === selectedComposerId);
    if (!rels.length) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const colors = { mentor: '#D4AF37', influence: '#A0B4C8', collaboration: '#7EC8E3', opposition: '#E06060' };

    rels.forEach(rel => {
      const oid = rel.from === selectedComposerId ? rel.to : rel.from;
      const o = composers.find(x => x.id === oid);
      if (!o) return;
      const coords = [c.coordinates, o.coordinates];
      const color = colors[rel.type] || '#A0B4C8';
      const da = rel.type === 'influence' ? '6,4' : rel.type === 'collaboration' ? '3,3' : rel.type === 'opposition' ? '8,4' : undefined;

      // 辉光底层
      const glowOpts = { color, weight: 7, opacity: 0 };
      if (da) glowOpts.dashArray = da;
      const glow = L.polyline(coords, glowOpts).addTo(map);
      glow.getElement()?.animate?.([{ opacity: 0 }, { opacity: 0.22 }], { duration: 700, fill: 'forwards' });

      // 主线
      const lineOpts = { color, weight: 2.2, opacity: 0 };
      if (da) lineOpts.dashArray = da;
      const line = L.polyline(coords, lineOpts).addTo(map);
      line.getElement()?.animate?.([{ opacity: 0 }, { opacity: 0.92 }], { duration: 600, fill: 'forwards' });

      const item = { line, glow, halos: [] };

      // SVG 流光
      const pathEl = line.getElement?.();
      if (pathEl?.getAttribute?.('d')) {
        const d = pathEl.getAttribute('d');
        const g = document.createElementNS(SVG_NS, 'g');
        g.style.pointerEvents = 'none';

        const halo = document.createElementNS(SVG_NS, 'circle');
        halo.setAttribute('r', '6');
        halo.setAttribute('fill', color);
        halo.setAttribute('opacity', '0.28');
        const core = document.createElementNS(SVG_NS, 'circle');
        core.setAttribute('r', '2.5');
        core.setAttribute('fill', '#fff');
        core.setAttribute('opacity', '0.95');

        const dur = (3.8 + Math.random() * 1.6).toFixed(2);
        [halo, core].forEach(ci => {
          const am = document.createElementNS(SVG_NS, 'animateMotion');
          am.setAttribute('path', d);
          am.setAttribute('dur', dur + 's');
          am.setAttribute('repeatCount', 'indefinite');
          ci.appendChild(am);
          g.appendChild(ci);
        });
        pathEl.parentNode.appendChild(g);

        const upd = () => {
          const p = line.getElement();
          if (!p) return;
          const nd = p.getAttribute('d');
          g.querySelectorAll('animateMotion').forEach(am => am.setAttribute('path', nd));
        };
        map.on('zoomend', upd);
        item._upd = upd;
        item._g = g;
        item._map = map;
      }

      // 两端呼吸光环
      [c.coordinates, o.coordinates].forEach(pos => {
        const hIcon = L.divIcon({
          className: '',
          html: `<div class="rel-halo-outer"></div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        });
        const hm = L.marker(pos, { icon: hIcon, interactive: false, keyboard: false }).addTo(map);
        item.halos.push(hm);
      });

      relLinesRef.current.push(item);
    });

    // 底部关系提示
    const div = document.createElement('div');
    div.className = 'rel-hint';
    const labels = { mentor: '师承', influence: '影响', collaboration: '合作', opposition: '对立' };
    const types = [...new Set(rels.map(r => r.type))];
    const legend = types.map(t => `<span style="color:${colors[t]}">${labels[t]}</span>`).join(' · ');
    div.innerHTML = `<strong>${c.name}</strong> <em>${rels.length} 条关系</em> ${legend}`;
    document.querySelector('.map-wrapper')?.appendChild(div);
  }, [selectedComposerId]);

  const flyBeaconRef = useRef(null);
  const handleFlyToArt = (cfg) => {
    const map = mapInstanceRef.current;
    if (!map || !cfg || !cfg.coords) return;
    map.flyTo(cfg.coords, cfg.zoom || 6.5, { duration: 2.4 });
    if (flyBeaconRef.current) { try { map.removeLayer(flyBeaconRef.current); } catch (e) {} flyBeaconRef.current = null; }
    const beacon = L.marker(cfg.coords, { icon: createFlyBeaconIcon(), interactive: false, keyboard: false });
    beacon.addTo(map);
    flyBeaconRef.current = beacon;
    setTimeout(() => {
      if (flyBeaconRef.current === beacon) {
        try { map.removeLayer(beacon); } catch (e) {}
        flyBeaconRef.current = null;
      }
    }, 3800);
  };


  const toggleRelationshipMode = () => setRelationshipMode(prev => !prev);
  const composerCount = composers.length;



  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="leaflet-map" />

      {/* 星空 overlay - 独立于 Leaflet DOM */}
      <div className="starfield-overlay" dangerouslySetInnerHTML={{ __html: starsHTML }} />

      {/* 星河天象：北极光 · 银河 · 流星 */}
      <div className="sky-fx" aria-hidden="true">
        <div className="milky-way" />
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>
      <div className="sky-meteor" ref={skyMeteorRef} aria-hidden="true"><i /></div>

      {/* 俄罗斯标志性建筑动画 - 银色星座版 */}
      <BasilCathedral cityActive={!!selectedCity} onFlyTo={handleFlyToArt} />



      <div className="map-overlay-tl">
        <div className="map-title-elegant">
          <div className="title-main">俄罗斯音乐之魂</div>
          <div className="title-divider"></div>
          <div className="title-sub">星河为谱 · 群星作章</div>
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
      {constellationComposer && <ConstellationCard composer={constellationComposer} position={constellationPos} onClose={() => { setConstellationComposer(null); setConstellationPos(null); }} />}
      {selectedCity && <CityCard city={selectedCity} composers={composers} onClose={() => setSelectedCity(null)} onSelectComposer={handleComposerSelectFromCard} />}
      <div className="map-instructions"><span>点击标记查看作曲家详情 · 点击城市查看详情 · 点击"关系网"按钮查看关系网络</span></div>
    </div>
  );
}
