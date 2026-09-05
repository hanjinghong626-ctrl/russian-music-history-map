// v5.0 星河显影版 - 交叉溶解 + 流星转场 + 星光扫描 + 银线流光 + 双语字幕
'use client';
import { useEffect, useRef } from 'react';
import './BasilCathedral.css';

const ARTWORKS = [
  { id: 'cathedral', zh: '圣瓦西里大教堂', ru: 'Собор Василия Блаженного' },
  { id: 'reindeer',  zh: '北方驯鹿',       ru: 'Северный олень' },
  { id: 'gum',       zh: '古姆百货',       ru: 'ГУМ' },
  { id: 'bolshoi',   zh: '莫斯科大剧院',   ru: 'Большой театр' },
  { id: 'msu',       zh: '莫斯科大学',     ru: 'МГУ' },
  { id: 'soviet',    zh: '苏维埃宫',       ru: 'Дворец Советов' },
  { id: 'st-isaac',  zh: '圣以撒大教堂',   ru: 'Исаакиевский собор' },
];
const STORAGE_KEY = 'basil-cycle-start';

const HOLD_MS = 22000;  // 完整展示时长
const FADE_MS = 2600;   // 交叉溶解时长（旧图淡出 = 新图绘制开头，完全重叠）

function getDrawDuration(id) { return id === 'reindeer' ? 8000 : 19000; }
// 每个槽位 = 绘制 + 停留；淡出与下一槽的绘制开头重叠
const SLOT_MS = ARTWORKS.map(a => getDrawDuration(a.id) + HOLD_MS);
const FULL_CYCLE_MS = SLOT_MS.reduce((s, v) => s + v, 0);

function getImageUrl(id) {
  const map = {
    cathedral: '/images/basil-golden-lineart.png',
    reindeer: '/images/golden-reindeer-lineart.png',
    gum: '/images/gum-golden-lineart.png',
    bolshoi: '/images/bolshoi-golden-lineart.png',
    msu: '/images/msu-golden-lineart.png',
    soviet: '/images/soviet-palace-golden-lineart.png',
    'st-isaac': '/images/st-isaac-golden-lineart.png',
  };
  return map[id] || map.cathedral;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 连续时间轴：primary = 当前正在绘制/展示的图；secondary = 交叉溶解期正在淡出的上一张
function calcState(elapsed) {
  let t = ((elapsed % FULL_CYCLE_MS) + FULL_CYCLE_MS) % FULL_CYCLE_MS;
  let acc = 0, i = 0;
  for (; i < ARTWORKS.length; i++) {
    if (t < acc + SLOT_MS[i]) break;
    acc += SLOT_MS[i];
  }
  const a = ARTWORKS[i];
  const local = t - acc;
  const dd = getDrawDuration(a.id);

  let primary;
  if (local < dd) {
    primary = { art: a, phase: 'drawing', p: local / dd };
  } else {
    primary = { art: a, phase: 'holding', p: (local - dd) / HOLD_MS };
  }

  // 新图绘制的最初 FADE_MS 内，上一张同时淡出（进度同步，零跳变）
  let secondary = null;
  if (local < FADE_MS) {
    const prev = ARTWORKS[(i - 1 + ARTWORKS.length) % ARTWORKS.length];
    secondary = { art: prev, phase: 'fading', p: Math.min(1, local / FADE_MS) };
  }

  return { primary, secondary, crossing: !!secondary, slotIndex: i };
}

let cycleStartTime = null;
function getCycleStartTime() {
  if (cycleStartTime !== null) return cycleStartTime;
  try {
    const val = sessionStorage.getItem(STORAGE_KEY);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) { cycleStartTime = parsed; return cycleStartTime; }
    }
  } catch (e) { /* ignore */ }
  cycleStartTime = Date.now();
  try { sessionStorage.setItem(STORAGE_KEY, String(cycleStartTime)); } catch (e) { /* ignore */ }
  return cycleStartTime;
}

export default function BasilCathedral({ cityActive }) {
  const containerRef = useRef(null);
  const layerRefs = useRef([null, null]);
  const penRef = useRef(null);
  const meteorRef = useRef(null);
  const captionRef = useRef(null);
  const rafRef = useRef(null);
  const prevCrossingRef = useRef(false);
  const cityActiveRef = useRef(cityActive);
  cityActiveRef.current = cityActive;

  useEffect(() => {
    const startTime = getCycleStartTime();

    function renderSlot(layerEl, slot, isTop) {
      if (!layerEl) return;
      if (!slot) { layerEl.style.opacity = '0'; return; }
      const img = layerEl.querySelector('.basil-image');
      const shimmer = layerEl.querySelector('.basil-shimmer');
      const scan = layerEl.querySelector('.basil-scan');
      const url = getImageUrl(slot.art.id);
      if (img.dataset.url !== url) {
        img.style.backgroundImage = `url(${url})`;
        shimmer.style.backgroundImage = `url(${url})`;
        shimmer.style.webkitMaskImage = `url(${url})`;
        shimmer.style.maskImage = `url(${url})`;
        img.dataset.url = url;
      }
      const horizontal = slot.art.id === 'reindeer';
      const ep = easeInOut(slot.p);

      let opacity = 0;
      let clip = horizontal ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)';
      let scanOpacity = 0;
      let shimmerOn = false;

      if (slot.phase === 'drawing') {
        opacity = Math.min(1, slot.p * 6);
        if (horizontal) {
          clip = `inset(0 ${100 - ep * 100}% 0 0)`;
          scan.style.left = `${ep * 100}%`;
        } else {
          clip = `inset(0 0 ${100 - ep * 100}% 0)`;
          scan.style.top = `${ep * 100}%`;
        }
        scanOpacity = 1;
        shimmerOn = true;
      } else if (slot.phase === 'holding') {
        opacity = 1;
        clip = 'inset(0 0 0 0)';
        shimmerOn = true;
      } else if (slot.phase === 'fading') {
        opacity = 1 - ep;
        clip = 'inset(0 0 0 0)';
      }

      img.style.opacity = String(opacity);
      img.style.clipPath = clip;
      shimmer.style.opacity = shimmerOn ? (slot.phase === 'holding' ? '' : '0.55') : '0';
      shimmer.style.clipPath = slot.phase === 'drawing' ? clip : 'inset(0 0 0 0)';
      shimmer.classList.toggle('flow', shimmerOn);
      scan.classList.toggle('h', horizontal);
      scan.style.opacity = String(scanOpacity);
      scan.style.display = scanOpacity > 0 ? 'block' : 'none';
      layerEl.style.zIndex = String(isTop ? 2 : 1);
      layerEl.style.opacity = '1';
      layerEl.classList.toggle('hold-float', slot.phase === 'holding');
    }

    function update() {
      if (!containerRef.current) return;
      const elapsed = Date.now() - startTime;
      const state = calcState(elapsed);

      containerRef.current.classList.toggle('city-active', !!cityActiveRef.current);

      // 层分配：按作品槽位奇偶，相邻作品永远在不同层
      const primaryLayer = state.slotIndex % 2;
      const secondaryLayer = 1 - primaryLayer;
      renderSlot(layerRefs.current[primaryLayer], state.primary, true);
      renderSlot(layerRefs.current[secondaryLayer], state.secondary, false);

      // 绘制星核光斑（跟随当前绘制边缘）
      const pen = penRef.current;
      if (pen) {
        if (state.primary.phase === 'drawing') {
          const ep = easeInOut(state.primary.p);
          pen.style.display = 'block';
          if (state.primary.art.id === 'reindeer') {
            pen.style.left = `${ep * 100}%`;
            pen.style.top = '50%';
          } else {
            pen.style.top = `${ep * 100}%`;
            pen.style.left = '50%';
          }
        } else {
          pen.style.display = 'none';
        }
      }

      // 双语字幕：交叉溶解期旧字幕淡出、新字幕在绘制过半后淡入
      const caption = captionRef.current;
      if (caption) {
        let capArt, capOp;
        if (state.crossing && state.primary.p < 0.55) {
          capArt = state.secondary.art;
          capOp = 1 - easeInOut(state.secondary.p);
        } else if (state.primary.phase === 'drawing') {
          capArt = state.primary.art;
          capOp = state.primary.p > 0.6 ? Math.min(1, (state.primary.p - 0.6) / 0.35) : 0;
        } else {
          capArt = state.primary.art;
          capOp = 1;
        }
        if (caption.dataset.id !== capArt.id) {
          caption.innerHTML = `<span class="cap-zh">${capArt.zh}</span><span class="cap-ru">${capArt.ru}</span>`;
          caption.dataset.id = capArt.id;
        }
        caption.style.opacity = String(Math.max(0, capOp));
      }

      // 流星转场（交叉溶解开始边沿触发一次）
      const meteor = meteorRef.current;
      if (meteor) {
        if (state.crossing && !prevCrossingRef.current) {
          meteor.classList.remove('go');
          void meteor.offsetWidth;
          meteor.classList.add('go');
        }
        prevCrossingRef.current = state.crossing;
      }

      rafRef.current = requestAnimationFrame(update);
    }

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className={`basil-container${cityActive ? ' city-active' : ''}`}>
      <div className="basil-polaris" />
      <div className="basil-layer" ref={el => { layerRefs.current[0] = el; }}>
        <div className="basil-image" />
        <div className="basil-shimmer" />
        <div className="basil-scan" />
      </div>
      <div className="basil-layer" ref={el => { layerRefs.current[1] = el; }}>
        <div className="basil-image" />
        <div className="basil-shimmer" />
        <div className="basil-scan" />
      </div>
      <div ref={penRef} className="basil-pen-light" style={{ display: 'none' }} />
      <div ref={meteorRef} className="basil-meteor" />
      <div ref={captionRef} className="basil-caption" />
    </div>
  );
}
