'use client';
import { useEffect, useRef } from 'react';
import './BasilCathedral.css';

const ARTWORKS = ['cathedral', 'reindeer', 'gum', 'bolshoi', 'msu', 'soviet', 'st-isaac'];
const STORAGE_KEY = 'basil-cycle-start';

function getDrawDuration(artwork) {
  return artwork === 'reindeer' ? 8000 : 19000;
}

function getArtworkDuration(artwork) {
  return 2000 + getDrawDuration(artwork) + 30000 + 3000 + 10000;
}

const FULL_CYCLE_MS = ARTWORKS.reduce((sum, a) => sum + getArtworkDuration(a), 0);

function getImageUrl(artwork) {
  const map = {
    cathedral: '/images/basil-golden-lineart.png',
    reindeer: '/images/golden-reindeer-lineart.png',
    gum: '/images/gum-golden-lineart.png',
    bolshoi: '/images/bolshoi-golden-lineart.png',
    msu: '/images/msu-golden-lineart.png',
    soviet: '/images/soviet-palace-golden-lineart.png',
    'st-isaac': '/images/st-isaac-golden-lineart.png',
  };
  return map[artwork] || map.cathedral;
}

// 详细的状态计算，返回当前画作、阶段、以及在该阶段内的进度
function calcDetailedState(elapsed) {
  let t = ((elapsed % FULL_CYCLE_MS) + FULL_CYCLE_MS) % FULL_CYCLE_MS;
  for (const artwork of ARTWORKS) {
    const dur = getArtworkDuration(artwork);
    if (t < dur) {
      const dd = getDrawDuration(artwork);
      if (t < 2000) return { artwork, phase: 'waiting', progress: t / 2000, phaseElapsed: t, phaseDuration: 2000 };
      t -= 2000;
      if (t < dd) return { artwork, phase: 'drawing', progress: t / dd, phaseElapsed: t, phaseDuration: dd };
      t -= dd;
      if (t < 30000) return { artwork, phase: 'holding', progress: t / 30000, phaseElapsed: t, phaseDuration: 30000 };
      t -= 30000;
      if (t < 3000) return { artwork, phase: 'fading', progress: t / 3000, phaseElapsed: t, phaseDuration: 3000 };
      return { artwork, phase: 'gone', progress: (t - 3000) / 10000, phaseElapsed: t, phaseDuration: 10000 };
    }
    t -= dur;
  }
  return { artwork: 'cathedral', phase: 'waiting', progress: 0, phaseElapsed: 0, phaseDuration: 2000 };
}

// 模块级变量持久化
let cycleStartTime = null;

function getCycleStartTime() {
  if (cycleStartTime !== null) return cycleStartTime;

  try {
    const val = sessionStorage.getItem(STORAGE_KEY);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        cycleStartTime = parsed;
        return cycleStartTime;
      }
    }
  } catch (e) { /* ignore */ }

  cycleStartTime = Date.now();
  try {
    sessionStorage.setItem(STORAGE_KEY, String(cycleStartTime));
  } catch (e) { /* ignore */ }
  return cycleStartTime;
}

// 缓动函数
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function BasilCathedral({ cityActive }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const penRef = useRef(null);
  const rafRef = useRef(null);
  const cityActiveRef = useRef(cityActive);
  cityActiveRef.current = cityActive;

  useEffect(() => {
    const startTime = getCycleStartTime();

    function update() {
      if (!containerRef.current || !imageRef.current || !penRef.current) return;

      const elapsed = Date.now() - startTime;
      const state = calcDetailedState(elapsed);
      const { artwork, phase, progress, phaseElapsed, phaseDuration } = state;
      const drawDirection = artwork === 'reindeer' ? 'horizontal' : 'vertical';

      // 更新容器 class
      containerRef.current.className = `basil-container phase-${phase} draw-${drawDirection}${cityActiveRef.current ? ' city-active' : ''}`;

      // 设置背景图片
      imageRef.current.style.backgroundImage = `url(${getImageUrl(artwork)})`;

      // 根据阶段和进度精确控制视觉效果
      if (phase === 'waiting') {
        // 等待阶段：图片不可见
        imageRef.current.style.opacity = '0';
        imageRef.current.style.clipPath = drawDirection === 'vertical' 
          ? 'inset(0 0 100% 0)' 
          : 'inset(0 0 0 100%)';
        penRef.current.style.display = 'none';
      } 
      else if (phase === 'drawing') {
        // 绘制阶段：图片逐渐显示
        const easedProgress = easeInOut(progress);
        imageRef.current.style.opacity = '1';
        
        if (drawDirection === 'vertical') {
          // 从上到下绘制
          const clipBottom = 100 - (easedProgress * 100);
          imageRef.current.style.clipPath = `inset(0 0 ${clipBottom}% 0)`;
          
          // 笔的位置
          penRef.current.style.display = 'block';
          const penTop = -25 + (easedProgress * (270 + 50)); // container height + pen height
          penRef.current.style.top = `${penTop}px`;
          penRef.current.style.left = '50%';
          penRef.current.style.transform = 'translateX(-50%)';
        } else {
          // 驯鹿：从左到右（实际是从右到左进入）
          const translateX = 100 - (easedProgress * 100);
          imageRef.current.style.clipPath = `inset(0 0 0 0)`;
          imageRef.current.style.transform = `translateX(${translateX}%)`;
          imageRef.current.style.opacity = String(Math.min(1, progress * 8)); // 快速淡入
          
          // 笔的位置
          penRef.current.style.display = 'block';
          const penLeft = 95 - (easedProgress * 95);
          penRef.current.style.left = `${penLeft}%`;
          penRef.current.style.top = '50%';
          penRef.current.style.transform = 'translate(-50%, -50%)';
        }
        
        imageRef.current.style.filter = 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))';
      }
      else if (phase === 'holding') {
        // 展示阶段：图片完全显示，带微光效果
        imageRef.current.style.opacity = '1';
        imageRef.current.style.clipPath = 'inset(0 0 0 0)';
        imageRef.current.style.transform = 'translateX(0)';
        
        // 微光效果（用 JS 模拟 CSS shimmer 动画）
        const shimmerProgress = (phaseElapsed % 3000) / 3000;
        const shimmerValue = 12 + Math.sin(shimmerProgress * Math.PI * 2) * 4;
        imageRef.current.style.filter = `drop-shadow(0 0 ${shimmerValue}px rgba(212, 175, 55, ${0.3 + Math.sin(shimmerProgress * Math.PI * 2) * 0.1}))`;
        
        penRef.current.style.display = 'none';
      }
      else if (phase === 'fading') {
        // 淡出阶段
        const fadeProgress = easeInOut(progress);
        imageRef.current.style.opacity = String(1 - fadeProgress);
        imageRef.current.style.clipPath = 'inset(0 0 0 0)';
        imageRef.current.style.transform = 'translateX(0)';
        imageRef.current.style.filter = 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.3))';
        penRef.current.style.display = 'none';
      }
      else if (phase === 'gone') {
        // 消失阶段
        imageRef.current.style.opacity = '0';
        imageRef.current.style.clipPath = 'inset(0 0 0 0)';
        imageRef.current.style.transform = 'translateX(0)';
        penRef.current.style.display = 'none';
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
    <div ref={containerRef} className="basil-container phase-waiting draw-vertical">
      <div ref={imageRef} className="basil-image" />
      <div ref={penRef} className="basil-pen-light draw-vertical" style={{ display: 'none' }} />
    </div>
  );
}
