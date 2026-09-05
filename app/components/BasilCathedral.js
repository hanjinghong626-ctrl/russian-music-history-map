// v5.2 星河显影仪 - 星环底盘 + 星尘星雾 + 收笔星爆 + 点击建筑展开介绍卡片
'use client';
import { useEffect, useRef, useMemo, useState } from 'react';
import './BasilCathedral.css';

const ARTWORKS = [
  {
    id: 'cathedral', zh: '圣瓦西里大教堂', ru: 'Собор Василия Блаженного',
    tags: ['莫斯科 · 红场', '1555–1561'],
    desc: '伊凡雷帝为纪念征服喀山汗国而下令修建。九座色彩各异的礼拜堂簇拥成团，如童话堆成的火焰，是俄罗斯最具辨识度的标志。',
    music: '莫斯科是格林卡、柴可夫斯基、拉赫玛尼诺夫与斯克里亚宾的音乐之城。',
  },
  {
    id: 'reindeer', zh: '北方驯鹿', ru: 'Северный олень',
    tags: ['北极苔原', '千年游牧'],
    desc: '涅涅茨、萨米等北方民族与驯鹿相伴千年，鹿群牵引雪橇穿越苔原雪原，是西伯利亚最古老的生命意象。',
    music: '里姆斯基-科萨科夫歌剧《雪姑娘》的北国雪原，正是这片苔原的回响。',
  },
  {
    id: 'gum', zh: '古姆百货', ru: 'ГУМ',
    tags: ['莫斯科 · 红场', '1893'],
    desc: '19 世纪末以钢铁拱架与玻璃穹顶建成，曾是欧洲最大的百货商场。苏联时期更名"国家百货商店"，至今仍是红场畔的商业地标。',
    music: '红场畔的繁华年代，恰逢柴可夫斯基与强力集团让俄罗斯音乐走向世界。',
  },
  {
    id: 'bolshoi', zh: '莫斯科大剧院', ru: 'Большой театр',
    tags: ['莫斯科', '创立于 1776'],
    desc: '俄罗斯歌剧与芭蕾的最高殿堂，门廊上的青铜阿波罗四驾战车是它的标志。两个多世纪里，俄罗斯歌剧与芭蕾的首演之夜大多属于这里。',
    music: '1877 年柴可夫斯基《天鹅湖》在此首演，芭蕾音乐从此改写。',
  },
  {
    id: 'msu', zh: '莫斯科大学', ru: 'МГУ',
    tags: ['莫斯科 · 麻雀山', '1755 年创立'],
    desc: '罗蒙诺索夫倡议创办，俄罗斯最古老的大学。1953 年落成的斯大林式主楼尖顶高 240 米，是莫斯科"七姐妹"建筑之首。',
    music: '同城的莫斯科音乐学院由鲁宾斯坦创办，柴可夫斯基曾在此执教。',
  },
  {
    id: 'soviet', zh: '苏维埃宫', ru: 'Дворец Советов',
    tags: ['莫斯科', '1931 动工 · 未建成'],
    desc: '1931 年基督救世主大教堂被炸毁以腾地基，规划高 415 米、顶端矗立列宁像，终因战争与地基问题停建。原址一度改作露天泳池，大教堂于 1990 年代原样重建。',
    music: '那个时代的音乐属于肖斯塔科维奇与普罗科菲耶夫——大厦未竟，乐章长存。',
  },
  {
    id: 'st-isaac', zh: '圣以撒大教堂', ru: 'Исаакиевский собор',
    tags: ['圣彼得堡', '1818–1858'],
    desc: '建筑师蒙费朗设计，耗时四十年建成。鎏金穹顶高 101.5 米，至今仍是圣彼得堡帝国天际线的中心。',
    music: '圣彼得堡是格林卡与强力集团之城，柴可夫斯基毕业于彼得堡音乐学院。',
  },
];
const STORAGE_KEY = 'basil-cycle-start';

const HOLD_MS = 22000;
const FADE_MS = 2600;

function getDrawDuration(id) { return id === 'reindeer' ? 8000 : 19000; }
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
  const hintRef = useRef(null);
  const rafRef = useRef(null);
  const prevCrossingRef = useRef(false);
  const lastSlotRef = useRef(-1);
  const holdingRef = useRef(false);
  const currentArtRef = useRef(ARTWORKS[0]);
  const cityActiveRef = useRef(cityActive);
  cityActiveRef.current = cityActive;

  const [cardArt, setCardArt] = useState(null);
  const cardArtRef = useRef(null);
  cardArtRef.current = cardArt;

  // 城市词条打开时关闭建筑卡片
  useEffect(() => { if (cityActive) setCardArt(null); }, [cityActive]);

  // 点击卡片外部关闭
  useEffect(() => {
    if (!cardArt) return;
    const handler = (e) => {
      if (e.target.closest('.basil-card') || e.target.closest('.basil-container')) return;
      setCardArt(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [cardArt]);

  // 星尘微粒
  const stardustHTML = useMemo(() => {
    let html = '';
    for (let i = 0; i < 14; i++) {
      const x = 6 + Math.random() * 88;
      const y = 18 + Math.random() * 72;
      const size = 0.8 + Math.random() * 1.4;
      const riseDur = 7 + Math.random() * 7;
      const twDur = 2.5 + Math.random() * 3.5;
      const delay = -Math.random() * 8;
      const op = 0.25 + Math.random() * 0.45;
      html += `<span style="position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;border-radius:50%;background:rgba(205,228,255,${op.toFixed(2)});box-shadow:0 0 ${(size*3).toFixed(1)}px rgba(160,205,255,${(op*0.8).toFixed(2)});animation:stardust-rise ${riseDur.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite alternate, stardust-twinkle ${twDur.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite alternate;"></span>`;
    }
    return html;
  }, []);

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

      const primaryLayer = state.slotIndex % 2;
      const secondaryLayer = 1 - primaryLayer;
      renderSlot(layerRefs.current[primaryLayer], state.primary, true);
      renderSlot(layerRefs.current[secondaryLayer], state.secondary, false);

      const isHolding = state.primary.phase === 'holding' && !state.crossing;
      holdingRef.current = isHolding;
      if (isHolding) currentArtRef.current = state.primary.art;
      containerRef.current.classList.toggle('clickable', isHolding);

      // 建筑切换时收起卡片
      if (state.slotIndex !== lastSlotRef.current) {
        lastSlotRef.current = state.slotIndex;
        if (cardArtRef.current) setCardArt(null);
      }

      // 星核光斑 + 收笔星爆
      const pen = penRef.current;
      if (pen) {
        if (state.primary.phase === 'drawing') {
          const ep = easeInOut(state.primary.p);
          pen.style.display = 'block';
          let scale = 1, penOp = 1;
          if (state.primary.p > 0.86) {
            const k = (state.primary.p - 0.86) / 0.14;
            scale = 1 + k * 1.8;
            penOp = 1 - k;
          }
          pen.style.opacity = String(penOp);
          pen.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(2)})`;
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

      // 双语字幕
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
          caption.innerHTML = `<span class="cap-zh">${capArt.zh}</span><span class="cap-deco"></span><span class="cap-ru">${capArt.ru}</span>`;
          caption.dataset.id = capArt.id;
        }
        caption.style.opacity = String(Math.max(0, capOp));
      }

      // 轻触提示
      if (hintRef.current) {
        hintRef.current.style.opacity = (isHolding && !cardArtRef.current) ? '1' : '0';
      }

      // 流星转场
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

  const handleContainerClick = () => {
    if (!holdingRef.current) return;
    setCardArt(prev => prev ? null : currentArtRef.current);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`basil-container${cityActive ? ' city-active' : ''}`}
        onClick={handleContainerClick}
      >
        {/* 星环底盘 */}
        <div className="basil-astrolabe">
          <div className="astrolabe-ring outer" />
          <div className="astrolabe-ring inner" />
        </div>
        {/* 底部星雾 */}
        <div className="basil-nebula" />
        {/* 星尘微粒 */}
        <div className="basil-stardust" dangerouslySetInnerHTML={{ __html: stardustHTML }} />
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
        <div ref={hintRef} className="basil-hint">轻 触 查 看</div>
      </div>

      {/* 建筑介绍卡片 */}
      {cardArt && (
        <div className="basil-card" onClick={e => e.stopPropagation()}>
          <button className="basil-card-close" onClick={() => setCardArt(null)} aria-label="关闭">×</button>
          <div className="basil-card-zh">{cardArt.zh}</div>
          <div className="basil-card-ru">{cardArt.ru}</div>
          <div className="basil-card-tags">
            {cardArt.tags.map(t => <span key={t}>{t}</span>)}
          </div>
          <div className="basil-card-body">{cardArt.desc}</div>
          <div className="basil-card-music">
            <span className="music-note">♪</span>
            <span>{cardArt.music}</span>
          </div>
        </div>
      )}
    </>
  );
}
