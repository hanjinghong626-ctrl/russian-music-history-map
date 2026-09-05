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

const WAIT_MS = 1200;
const HOLD_MS = 22000;
const FADE_MS = 2600;

function getDrawDuration(id) { return id === 'reindeer' ? 8000 : 19000; }
function getSlotDuration(a) { return WAIT_MS + getDrawDuration(a.id) + HOLD_MS + FADE_MS; }
const FULL_CYCLE_MS = ARTWORKS.reduce((s, a) => s + getSlotDuration(a), 0);

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

// 时间轴：返回 primary（当前作品）+ secondary（转场重叠时正在显影的下一张）
function calcState(elapsed) {
  let t = ((elapsed % FULL_CYCLE_MS) + FULL_CYCLE_MS) % FULL_CYCLE_MS;
  for (let i = 0; i < ARTWORKS.length; i++) {
    const a = ARTWORKS[i];
    const dur = getSlotDuration(a);
    if (t < dur) {
      const dd = getDrawDuration(a.id);
      let primary;
      if (t < WAIT_MS) {
        primary = { art: a, phase: 'waiting', p: t / WAIT_MS };
      } else if (t < WAIT_MS + dd) {
        primary = { art: a, phase: 'drawing', p: (t - WAIT_MS) / dd };
      } else if (t < WAIT_MS + dd + HOLD_MS) {
        primary = { art: a, phase: 'holding', p: (t - WAIT_MS - dd) / HOLD_MS };
      } else {
        primary = { art: a, phase: 'fading', p: (t - WAIT_MS - dd - HOLD_MS) / FADE_MS, fadeElapsed: t - WAIT_MS - dd - HOLD_MS };
      }
      let secondary = null;
      if (primary.phase === 'fading') {
        // 旧图淡出的同时，下一张开始显影（交叉溶解）
        const next = ARTWORKS[(i + 1) % ARTWORKS.length];
        const nt = primary.fadeElapsed;
        const ndd = getDrawDuration(next.id);
        if (nt < WAIT_MS) secondary = { art: next, phase: 'waiting', p: nt / WAIT_MS };
        else secondary = { art: next, phase: 'drawing', p: Math.min(1, (nt - WAIT_MS) / ndd) };
      }
      return { primary, secondary, fading: primary.phase === 'fading', slotIndex: i };
    }
    t -= dur;
  }
  return { primary: { art: ARTWORKS[0], phase: 'waiting', p: 0 }, secondary: null, fading: false, slotIndex: 0 };
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
  const prevFadingRef = useRef(false);
  const cityActiveRef = useRef(cityActive);
  cityActiveRef.current = cityActive;

  useEffect(() => {
    const startTime = getCycleStartTime();

    function renderSlot(layerEl, slot, isTop) {
      if (!layerEl || !slot) {
        if (layerEl) layerEl.style.opacity = '0';
        return;
      }
      const img = layerEl.querySelector('.basil-image');
      const shimmer = layerEl.querySelector('.basil-shimmer');
      const scan = layerEl.querySelector('.basil-scan');
      const url = getImageUrl(slot.art.id);
      if (img.dataset.url !== url) {
        img.style.backgroundImage = `url(${url})`;
        shimmer.style.webkitMaskImage = `url(${url})`;
        shimmer.style.maskImage = `url(${url})`;
        img.dataset.url = url;
      }
      const horizontal = slot.art.id === 'reindeer';
      const ep = easeInOut(slot.p);

      let opacity = 0;
      let clip = horizontal ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)';
      let scanOpacity = 0;
      let shimmerOpacity = 0;
      scan.classList.toggle('h', horizontal);

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
        shimmerOpacity = 0.55;
        shimmer.classList.add('flow');
      } else if (slot.phase === 'holding') {
        opacity = 1;
        clip = 'inset(0 0 0 0)';
        shimmerOpacity = 1;
        shimmer.classList.add('flow');
      } else if (slot.phase === 'fading') {
        opacity = 1 - ep;
        clip = 'inset(0 0 0 0)';
      }

      img.style.opacity = String(opacity);
      img.style.clipPath = clip;
      shimmer.style.opacity = String(shimmerOpacity);
      shimmer.style.clipPath = slot.phase === 'drawing' ? clip : 'inset(0 0 0 0)';
      scan.style.opacity = String(scanOpacity);
      layerEl.style.zIndex = String(isTop ? 2 : 1);
      layerEl.style.opacity = '1';
      layerEl.classList.toggle('hold-float', slot.phase === 'holding');
    }

    function update() {
      if (!containerRef.current) return;
      const elapsed = Date.now() - startTime;
      const state = calcState(elapsed);

      containerRef.current.classList.toggle('city-active', !!cityActiveRef.current);

      // 层分配：按作品槽位奇偶，相邻作品永远在不同层，交叉溶解时自然上下分层
      const primaryLayer = state.slotIndex % 2;
      const secondaryLayer = 1 - primaryLayer;
      renderSlot(layerRefs.current[primaryLayer], state.primary, !state.secondary);
      renderSlot(layerRefs.current[secondaryLayer], state.secondary, !!state.secondary);

      // 绘制星核光斑（跟随扫描线）
      const pen = penRef.current;
      const drawSlot = (state.secondary && state.secondary.phase === 'drawing')
        ? state.secondary
        : (state.primary.phase === 'drawing' ? state.primary : null);
      if (pen) {
        if (drawSlot) {
          const ep = easeInOut(drawSlot.p);
          pen.style.display = 'block';
          if (drawSlot.art.id === 'reindeer') {
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

      // 双语字幕
      const caption = captionRef.current;
      if (caption) {
        let capArt = state.primary.art;
        let capOp = 0;
        if (state.secondary && state.secondary.phase === 'drawing' && state.secondary.p > 0.55) {
          capArt = state.secondary.art;
          capOp = Math.min(1, (state.secondary.p - 0.55) / 0.4);
        } else {
          const ph = state.primary.phase;
          if (ph === 'drawing' && state.primary.p > 0.6) capOp = (state.primary.p - 0.6) / 0.4;
          else if (ph === 'holding') capOp = 1;
          else if (ph === 'fading') capOp = 1 - easeInOut(state.primary.p);
        }
        if (caption.dataset.id !== capArt.id) {
          caption.innerHTML = `<span class="cap-zh">${capArt.zh}</span><span class="cap-ru">${capArt.ru}</span>`;
          caption.dataset.id = capArt.id;
        }
        caption.style.opacity = String(capOp);
      }

      // 流星转场（fading 边沿触发一次）
      const meteor = meteorRef.current;
      if (meteor) {
        if (state.fading && !prevFadingRef.current) {
          meteor.classList.remove('go');
          void meteor.offsetWidth;
          meteor.classList.add('go');
        }
        prevFadingRef.current = state.fading;
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
