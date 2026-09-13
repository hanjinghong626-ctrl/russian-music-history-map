// v5.2 师承关系落回地图 - 星航联动(显影仪飞至城市) + 北极光/银河/流星 + 连线流光
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  // === 星轨漫游状态 ===
  const [showStarTour, setShowStarTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(-1);
  const [tourPlaying, setTourPlaying] = useState(false);
  const [tourSpeedIdx, setTourSpeedIdx] = useState(1);
  const tourTimerRef = useRef(null);
  const tourLineRef = useRef(null);
  const tourIndexRef = useRef(-1);
  const tourPrevIdxRef = useRef(-1);
  const tourCanvasRef = useRef(null);
  const tourEraTimerRef = useRef(null);
  const [tourEraOverlay, setTourEraOverlay] = useState(null);
  const tourComposers = useMemo(() => [...composers].sort((a, b) => a.birthYear - b.birthYear), []);
  const tourSpeeds = [9000, 5500, 3500];

  // 漫游星点数据（稳定生成，避免每次渲染变化）
  const stStarsData = useMemo(() => 
    [...Array(40)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 3
    })), []);
  const tourLabels = ['慢', '中', '快'];
  const tourCurrent = tourIndex >= 0 && tourIndex < tourComposers.length ? tourComposers[tourIndex] : null;

  // 作曲家重要性（决定相机缩放）
  const tourImportance = {
    'glinka': 3, 'dargomyzhsky': 2, 'serov': 1,
    'balakirev': 2, 'cui': 1, 'mussorgsky': 3, 'borodin': 2, 'rimsky-korsakov': 3,
    'tchaikovsky': 3, 'taneyev': 1, 'lyadov': 1, 'glazunov': 2,
    'scriabin': 2, 'rachmaninoff': 3, 'prokofiev': 3, 'shostakovich': 3,
    'stravinsky': 3, 'kabalevsky': 1, 'miaskovsky': 1, 'khachaturian': 2,
    'glier': 1, 'lyatoshinsky': 1, 'stasov': 1, 'rubinstein': 2,
  };
  const tourZoomLevels = { 3: 7, 2: 5.5, 1: 4.2 };

  // 时代名称
  const tourEraNames = {
    'classical': { zh: '古典先驱', en: 'Classical Pioneer', range: '1742–1815' },
    'national-foundation': { zh: '民族奠基', en: 'National Foundation', range: '1804–1865' },
    'national-prosperity': { zh: '民族繁荣', en: 'National Prosperity', range: '1835–1871' },
    'late-romantic': { zh: '白银时代', en: 'Silver Age', range: '1862–1902' },
    'soviet': { zh: '苏联学派', en: 'Soviet School', range: '1877–1934' },
  };
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
          setConstellationComposer(null);
          setConstellationPos(null);
        } else {
          setSelectedComposerId(cid);
          selIdRef.current = cid;
          const el = marker.getElement();
          if (el) { const w = el.querySelector('.marker-wrapper'); if (w) w.classList.add('composer-selected'); }
          // 星座卡片定位
          const map = mapInstanceRef.current;
          if (map) {
            const pt = map.latLngToContainerPoint(composer.coordinates);
            const mapEl = map.getContainer();
            const mw = mapEl.offsetWidth, mh = mapEl.offsetHeight;
            let cx = pt.x + 22, cy = pt.y - 130;
            if (cx + 270 > mw) cx = pt.x - 282;
            if (cy < 10) cy = pt.y + 22;
            if (cy + 320 > mh) cy = mh - 330;
            setConstellationPos({ x: cx, y: cy });
            setConstellationComposer(composer);
          }
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



  // === 星轨漫游函数 ===
  const tourClearTimer = () => { if (tourTimerRef.current) { clearTimeout(tourTimerRef.current); tourTimerRef.current = null; } };

  // 粒子拖尾绘制
  const tourDrawParticleTrail = useCallback((fromIdx, toIdx) => {
    const canvas = tourCanvasRef.current;
    if (!canvas) return;
    const map = mapInstanceRef.current;
    if (!map) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = window.innerWidth;
    const h = canvas.height = window.innerHeight;

    const from = tourComposers[fromIdx];
    const to = tourComposers[toIdx];
    if (!from || !to) return;

    const p1 = map.latLngToContainerPoint(from.coordinates);
    const p2 = map.latLngToContainerPoint(to.coordinates);
    const period = to.period || 'classical';
    const eraColor = {
      'classical': [180, 210, 255],
      'national-foundation': [100, 200, 255],
      'national-prosperity': [255, 200, 100],
      'late-romantic': [255, 160, 200],
      'soviet': [160, 200, 255],
    }[period] || [100, 180, 255];

    let progress = 0;
    const totalDur = 2600;
    const startTime = performance.now();

    const animate = (now) => {
      progress = Math.min((now - startTime) / totalDur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      // 弧线控制点（垂直偏移）
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const arcH = Math.min(dist * 0.3, 120);
      const mx = (p1.x + p2.x) / 2 - dy / dist * arcH;
      const my = (p1.y + p2.y) / 2 + dx / dist * arcH;
      // 贝塞尔插值
      const bezX = (t) => (1-t)*(1-t)*p1.x + 2*(1-t)*t*mx + t*t*p2.x;
      const bezY = (t) => (1-t)*(1-t)*p1.y + 2*(1-t)*t*my + t*t*p2.y;
      const cx = bezX(ease);
      const cy = bezY(ease);

      // 流星拖尾
      for (let i = 0; i < 6; i++) {
        const t = Math.max(0, ease - 0.04 * i);
        const px = bezX(t);
        const py = bezY(t);
        const alpha = (1 - i * 0.3) * 0.8;
        const size = 3 - i * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},${alpha})`;
        ctx.fill();
        // 光晕
        ctx.beginPath();
        ctx.arc(px, py, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},${alpha * 0.15})`;
        ctx.fill();
      }

      // 尾迹线（从上一个粒子到头部）
      const tailT = Math.max(0, ease - 0.15);
      const tailX = bezX(tailT), tailY = bezY(tailT);
      const grad = ctx.createLinearGradient(tailX, tailY, cx, cy);
      grad.addColorStop(0, `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},0)`);
      grad.addColorStop(1, `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},0.6)`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 头部亮点（更大更亮）
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},0.4)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${eraColor[0]},${eraColor[1]},${eraColor[2]},0.12)`;
      ctx.fill();

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [tourComposers]);

  // 时代过渡检测
  const tourCheckEraTransition = useCallback((idx) => {
    const prev = tourPrevIdxRef.current;
    if (prev < 0 || prev >= tourComposers.length) return;
    const prevPeriod = tourComposers[prev]?.period;
    const curPeriod = tourComposers[idx]?.period;
    if (prevPeriod && curPeriod && prevPeriod !== curPeriod) {
      const era = tourEraNames[curPeriod];
      if (era) {
        setTourEraOverlay(era);
        if (tourEraTimerRef.current) clearTimeout(tourEraTimerRef.current);
        tourEraTimerRef.current = setTimeout(() => setTourEraOverlay(null), 2500);
      }
    }
    tourPrevIdxRef.current = idx;
  }, [tourComposers]);

  const tourFlyTo = useCallback((idx) => {
    const map = mapInstanceRef.current;
    if (!map || idx < 0 || idx >= tourComposers.length) return;
    const c = tourComposers[idx];
    const prevIdx = tourIndexRef.current;
    tourIndexRef.current = idx;
    setTourIndex(idx);

    // 电影感变焦（更慢更戏剧性）
    const imp = tourImportance[c.id] || 1;
    const zoom = tourZoomLevels[imp] || 5.5;
    map.flyTo(c.coordinates, zoom, { duration: 3.0, easeLinearity: 0.15 });
    // 地图微暗 + 色彩偏移
    const mapContainer = map.getContainer();
    if (mapContainer) {
      mapContainer.style.transition = 'filter 2s ease';
      mapContainer.style.filter = 'brightness(0.65) saturate(0.7) contrast(1.1)';
    }

    // 粒子拖尾
    if (prevIdx >= 0 && prevIdx !== idx) {
      tourDrawParticleTrail(prevIdx, idx);
    }

    // 更新轨迹线
    if (tourLineRef.current) { try { map.removeLayer(tourLineRef.current); } catch(e){} tourLineRef.current = null; }
    const coords = tourComposers.slice(0, idx + 1).map(x => x.coordinates);
    if (coords.length > 1) {
      const period = c.period || 'classical';
      const lineColor = {
        'classical': 'rgba(180,210,255,0.35)',
        'national-foundation': 'rgba(100,200,255,0.35)',
        'national-prosperity': 'rgba(255,200,100,0.35)',
        'late-romantic': 'rgba(255,160,200,0.35)',
        'soviet': 'rgba(160,200,255,0.35)',
      }[period] || 'rgba(100,180,255,0.35)';
      tourLineRef.current = L.polyline(coords, { color: lineColor, weight: 1.5, dashArray: '8,5', smoothFactor: 2 }).addTo(map);
    }

    // 时代过渡
    tourCheckEraTransition(idx);
  }, [tourComposers, tourDrawParticleTrail, tourCheckEraTransition]);

  useEffect(() => {
    if (!tourPlaying) { tourClearTimer(); return; }
    const cur = tourIndexRef.current;
    const next = cur < 0 ? 0 : cur + 1;
    if (next >= tourComposers.length) { setTourPlaying(false); return; }
    tourTimerRef.current = setTimeout(() => tourFlyTo(next), cur < 0 ? 600 : tourSpeeds[tourSpeedIdx]);
    return () => tourClearTimer();
  }, [tourPlaying, tourSpeedIdx, tourFlyTo, tourComposers.length]);

  const tourGoTo = useCallback((idx) => { tourClearTimer(); setTourPlaying(false); tourFlyTo(Math.max(0, Math.min(idx, tourComposers.length - 1))); }, [tourFlyTo, tourComposers.length]);
  const tourTogglePlay = useCallback(() => {
    const cur = tourIndexRef.current;
    if (cur < 0) {
      setTourPlaying(true);
      setTimeout(() => tourFlyTo(0), 300);
    }
    else if (cur >= tourComposers.length - 1 && !tourPlaying) {
      if (tourLineRef.current && mapInstanceRef.current) { try { mapInstanceRef.current.removeLayer(tourLineRef.current); } catch(e){} tourLineRef.current = null; }
      setTourPlaying(true); tourFlyTo(0);
    } else { setTourPlaying(p => !p); }
  }, [tourPlaying, tourFlyTo, tourComposers.length, mapInstanceRef]);
  const tourSkipBack = useCallback(() => tourGoTo(tourIndexRef.current - 1), [tourGoTo]);
  const tourSkipFwd = useCallback(() => tourGoTo(tourIndexRef.current + 1), [tourGoTo]);
  const tourCycleSpeed = useCallback(() => setTourSpeedIdx(p => (p + 1) % 3), []);
  const tourClose = useCallback(() => {
    tourClearTimer(); setTourPlaying(false); setShowStarTour(false);
    setTourEraOverlay(null);
    // 恢复地图亮度
    const map = mapInstanceRef.current;
    if (map) {
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.style.filter = 'none';
      }
    }
    if (tourEraTimerRef.current) { clearTimeout(tourEraTimerRef.current); tourEraTimerRef.current = null; }
    if (tourLineRef.current && mapInstanceRef.current) { try { mapInstanceRef.current.removeLayer(tourLineRef.current); } catch(e){} tourLineRef.current = null; }
    const canvas = tourCanvasRef.current;
    if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }, [mapInstanceRef]);

  // 漫游键盘快捷键
  useEffect(() => {
    if (!showStarTour) return;
    const handler = (e) => {
      if (e.key === 'Escape') { tourClose(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); tourSkipFwd(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tourSkipBack(); }
      else if (e.key === ' ') { e.preventDefault(); tourTogglePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showStarTour, tourClose, tourSkipFwd, tourSkipBack, tourTogglePlay]);

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
      <button className="tour-btn" onClick={() => setShowStarTour(true)} title="星轨漫游 - 按出生年飞览50位作曲家">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" strokeDasharray="2,2"/>
        </svg>
        <span>漫游</span>
      </button>
      <button className={`rel-toggle-btn ${relationshipMode ? 'active' : ''}`} onClick={toggleRelationshipMode} title={relationshipMode ? "退出关系网" : "查看关系网"}>
        <svg className="rel-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2.5" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="2.5" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="2.5" fill="currentColor" stroke="none"/><line x1="7.2" y1="10.5" x2="16.8" y2="6.5" strokeDasharray="3,2"/><line x1="7.2" y1="13.5" x2="16.8" y2="17.5" strokeDasharray="3,2"/></svg>
        关系网
      </button>
      {relationshipMode && <RelationshipNetwork onClose={() => setRelationshipMode(false)} />}
      {constellationComposer && <ConstellationCard composer={constellationComposer} position={constellationPos} onClose={() => { setConstellationComposer(null); setConstellationPos(null); }} />}
      {showStarTour && (
        <div className="star-tour-overlay">
          {/* 漫游标题 - 开场闪现 */}
          <div className="st-tour-title">
            <span className="st-tour-title-zh">星轨漫游</span>
            <span className="st-tour-title-sub">Star Trail Tour</span>
          </div>
          {/* 星点闪烁层 */}
          <div className="st-stars">
            {stStarsData.map((s, i) => (
              <div key={i} className="st-star" style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`
              }} />
            ))}
          </div>
          {/* 电影感暗角 */}
          <div className="st-vignette" />
          {/* 粒子拖尾画布 */}
          <canvas ref={tourCanvasRef} className="st-particle-canvas" />
          {/* 时代过渡覆盖 */}
          {tourEraOverlay && (
            <div className="st-era-transition">
              <div className="st-era-trans-bg" />
              <div className="st-era-trans-content">
                <div className="st-era-trans-range">{tourEraOverlay.range}</div>
                <h2 className="st-era-trans-zh">{tourEraOverlay.zh}</h2>
                <p className="st-era-trans-en">{tourEraOverlay.en}</p>
              </div>
            </div>
          )}
          {/* HUD 背景扫描线 */}
          <div className="st-scanlines" />
          {/* 右上角信息卡 */}
          {tourCurrent && (
            <div className={`st-info-card ${tourPlaying ? 'st-auto' : ''}`}>
              <div className="st-card-corner tl"/><div className="st-card-corner tr"/>
              <div className="st-card-corner bl"/><div className="st-card-corner br"/>
              <div className="st-period-tag" style={{'--pcolor': periodColors[tourCurrent.period]?.replace('rgb','rgba').replace(')', ',0.6)') || 'rgba(160,200,255,0.6)'}}>
                {({ 'classical': '古典先驱', 'national-foundation': '民族奠基', 'national-prosperity': '民族繁荣', 'late-romantic': '白银时代', 'soviet': '苏联学派' })[tourCurrent.period] || ''}
              </div>
              <h3 className="st-name">{tourCurrent.name}</h3>
              <p className="st-name-ru">{tourCurrent.nameRu}</p>
              <div className="st-years-row">
                <span className="st-year-num">{tourCurrent.birthYear}</span>
                <span className="st-year-dash">—</span>
                <span className="st-year-num">{tourCurrent.deathYear}</span>
              </div>
              <p className="st-school">{tourCurrent.school}</p>
              {tourCurrent.works && tourCurrent.works[0] && (
                <div className="st-work-box">
                  <span className="st-work-label">代 表 作</span>
                  <span className="st-work-title">{tourCurrent.works[0].title}</span>
                </div>
              )}
              <div className="st-tour-progress-num">{tourIndex + 1} <span className="st-tour-of">/</span> {tourComposers.length}</div>
            </div>
          )}
          {/* 底部进度条 */}
          <div className="st-progress-bar">
            <div className="st-progress-fill" style={{ width: `${tourComposers.length > 0 ? ((tourIndex + 1) / tourComposers.length * 100) : 0}%` }} />
            <div className="st-progress-text">{tourIndex >= 0 ? `${tourIndex + 1} / ${tourComposers.length}` : '—'}</div>
          </div>
          {/* 底部 HUD 控制栏 */}
          <div className="st-hud-bar">
            {/* 时间轴 */}
            <div className="st-timeline">
              <div className="st-timeline-fill" style={{width: `${tourIndex >= 0 ? (tourIndex + 1) / tourComposers.length * 100 : 0}%`}} />
              <div className="st-timeline-dots">
                {tourComposers.map((c, i) => (
                  <span key={c.id} className={`st-tdot ${i <= tourIndex ? 'st-tdot-v' : ''} ${i === tourIndex ? 'st-tdot-cur' : ''}`}
                    style={{left: `${(i / Math.max(tourComposers.length - 1, 1)) * 100}%`}}
                    onClick={() => tourGoTo(i)} title={`${c.name} (${c.birthYear})`} />
                ))}
              </div>
            </div>
            {/* 控制按钮 */}
            <div className="st-hud-controls">
              <button className="st-hbtn" onClick={tourClose} title="关闭 (Esc)">✕</button>
              <button className="st-hbtn" onClick={tourSkipBack} disabled={tourIndex <= 0} title="上一位">◂</button>
              <button className="st-hbtn st-hbtn-play" onClick={tourTogglePlay} title={tourPlaying ? '暂停' : '播放'}>
                {tourPlaying ? '❚❚' : '▶'}
              </button>
              <button className="st-hbtn" onClick={tourSkipFwd} disabled={tourIndex >= tourComposers.length - 1} title="下一位">▸</button>
              <button className="st-hbtn st-hbtn-spd" onClick={tourCycleSpeed} title="速度">{tourLabels[tourSpeedIdx]}</button>
            </div>
            <div className="st-hud-era">
              <span className="st-era-yr">{tourCurrent ? tourCurrent.birthYear : '—'}</span>
              <span className="st-era-nm">{tourCurrent ? tourCurrent.name : '点击 ▶ 开始漫游'}</span>
            </div>
          </div>
        </div>
      )}
      {selectedCity && <CityCard city={selectedCity} composers={composers} onClose={() => setSelectedCity(null)} onSelectComposer={handleComposerSelectFromCard} />}
      <div className="map-instructions"><span>点击标记查看作曲家详情 · 点击城市查看详情 · 点击"关系网"按钮查看关系网络</span></div>
    </div>
  );
}



