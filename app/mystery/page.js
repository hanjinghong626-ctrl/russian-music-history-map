'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import worldMap from './worldData';
import './mystery.css';

const PHASE = {
  INTRO: 'intro',
  EXPLORE: 'explore',
  INTERIOR: 'interior',
  DIALOGUE: 'dialogue',
  EVIDENCE: 'evidence',
  VERDICT: 'verdict',
  TRUTH: 'truth',
  TRANSITION: 'transition'
};

// 街区氛围配置
const DISTRICT_MOOD = {
  nevsky: { icon: '🏛️', color: '#c9a84c', skyClass: 'sky-afternoon' },
  riverside: { icon: '🌊', color: '#6b8db5', skyClass: 'sky-dusk' },
  alley: { icon: '🌑', color: '#7a4a3a', skyClass: 'sky-night' },
  park: { icon: '🍃', color: '#6b9b7a', skyClass: 'sky-dawn' }
};

export default function MysteryPage() {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [introStep, setIntroStep] = useState(0);

  // 街区状态
  const [currentDistrictId, setCurrentDistrictId] = useState('nevsky');

  // 场景状态
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [currentNpc, setCurrentNpc] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // 收集状态
  const [collectedClues, setCollectedClues] = useState([]);
  const [inspectedItems, setInspectedItems] = useState(new Set());
  const [talkedNpcs, setTalkedNpcs] = useState(new Set());
  const [npcRoundsDone, setNpcRoundsDone] = useState({});
  const [unlockedBuildings, setUnlockedBuildings] = useState(new Set());

  // 推理状态
  const [selectedCulprit, setSelectedCulprit] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [verdictResult, setVerdictResult] = useState(null);

  // 时间系统
  const [gameTime, setGameTime] = useState(14);
  const [dayPhase, setDayPhase] = useState('afternoon');

  // UI状态
  const [notification, setNotification] = useState(null);
  const [showMinimap, setShowMinimap] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [panoReady, setPanoReady] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  // === 360全景相关 refs ===
  const panoContainerRef = useRef(null);
  const threeModuleRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const sphereRef = useRef(null);
  const hotspotsRef = useRef({});
  const compassNeedleRef = useRef(null);
  const lonRef = useRef(0);
  const latRef = useRef(0);
  const animFrameRef = useRef(null);

  const currentDistrict = worldMap.getDistrict(currentDistrictId);

  // 开场动画
  useEffect(() => {
    if (phase !== PHASE.INTRO) return;
    const timers = [
      setTimeout(() => setIntroStep(1), 800),
      setTimeout(() => setIntroStep(2), 2200),
      setTimeout(() => setIntroStep(3), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // 通知
  const showNotif = useCallback((text, type = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 推进时间
  const advanceTime = useCallback((hours = 1) => {
    setGameTime(prev => {
      const next = prev + hours;
      if (next >= 22) setDayPhase('night');
      else if (next >= 18) setDayPhase('evening');
      else if (next >= 12) setDayPhase('afternoon');
      else setDayPhase('morning');
      return Math.min(next, 24);
    });
  }, []);

  // 检查解锁条件
  const checkUnlocks = useCallback((newClues) => {
    const clueIds = newClues.map(c => c.id);
    Object.entries(worldMap.unlockConditions || {}).forEach(([buildingId, cond]) => {
      if (unlockedBuildings.has(buildingId)) return;
      const allFound = cond.requiredClues.every(id => clueIds.includes(id));
      if (allFound) {
        setUnlockedBuildings(prev => new Set([...prev, buildingId]));
        showNotif(cond.message, 'key');
      }
    });
  }, [unlockedBuildings, showNotif]);

  // 切换街区
  const travelToDistrict = useCallback((targetId) => {
    if (targetId === currentDistrictId) return;
    const target = worldMap.getDistrict(targetId);
    if (!target) return;
    setTransitionTarget(targetId);
    setPhase(PHASE.TRANSITION);
  }, [currentDistrictId]);

  // 转场结束后进入新街区
  useEffect(() => {
    if (phase !== PHASE.TRANSITION || !transitionTarget) return;
    const timer = setTimeout(() => {
      setCurrentDistrictId(transitionTarget);
      setTransitionTarget(null);
      setPhase(PHASE.EXPLORE);
      advanceTime(0.5);
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, transitionTarget, advanceTime]);

  // === Three.js 360全景 ===
  useEffect(() => {
    if (phase !== PHASE.EXPLORE) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const c = rendererRef.current.domElement;
        if (c?.parentNode) c.parentNode.removeChild(c);
        rendererRef.current = null;
      }
      sceneRef.current = null;
      cameraRef.current = null;
      sphereRef.current = null;
      setPanoReady(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      const THREE = await import('three');
      if (cancelled) return;
      threeModuleRef.current = THREE;

      const container = panoContainerRef.current;
      if (!container) return;

      const oldCanvas = container.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1100);
      cameraRef.current = camera;

      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.insertBefore(renderer.domElement, container.firstChild);
      rendererRef.current = renderer;

      const panoramaUrl = currentDistrict?.panorama || currentDistrict?.background;

      const texture = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.height * 2;
          cvs.height = img.height;
          const ctx = cvs.getContext('2d');
          const srcRatio = img.width / img.height;
          if (srcRatio >= 2) {
            const cropW = img.height * 2;
            const cropX = (img.width - cropW) / 2;
            ctx.drawImage(img, cropX, 0, cropW, img.height, 0, 0, cvs.width, cvs.height);
          } else {
            ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
          }
          const t = new THREE.CanvasTexture(cvs);
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
          resolve(t);
        };
        img.onerror = () => {
          const t = new THREE.TextureLoader().load(panoramaUrl);
          t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        };
        img.src = panoramaUrl;
      });

      setPanoReady(true);
      setTimeout(() => setHintVisible(false), 4000);

      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      sphereRef.current = sphere;

      lonRef.current = currentDistrict?.initialYaw || 0;
      latRef.current = 0;

      // 交互
      let isInteracting = false;
      let downX = 0, downY = 0, downLon = 0, downLat = 0;
      let velocityLon = 0, velocityLat = 0;
      let prevLon = 0, prevLat = 0;
      const SENS = 0.15, FRIC = 0.92, LAT_LIM = 75;

      const onDown = (e) => {
        if (e.target.closest('.pano-hotspot, .district-exit, .explore-hud, .pano-compass-wrap, .pano-vignette')) return;
        e.preventDefault();
        isInteracting = true;
        velocityLon = velocityLat = 0;
        prevLon = lonRef.current;
        prevLat = latRef.current;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        downX = cx; downY = cy;
        downLon = lonRef.current; downLat = latRef.current;
      };

      const onMove = (e) => {
        if (!isInteracting) return;
        e.preventDefault();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const newLon = downLon - (cx - downX) * SENS;
        const newLat = Math.max(-LAT_LIM, Math.min(LAT_LIM, downLat + (cy - downY) * SENS));
        velocityLon = newLon - prevLon;
        velocityLat = newLat - prevLat;
        prevLon = newLon; prevLat = newLat;
        lonRef.current = newLon;
        latRef.current = newLat;
      };

      const onUp = () => { isInteracting = false; };

      container.addEventListener('mousedown', onDown);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      container.addEventListener('touchstart', onDown, { passive: false });
      container.addEventListener('touchmove', onMove, { passive: false });
      container.addEventListener('touchend', onUp, { passive: false });

      // 动画
      const animate = () => {
        if (cancelled) return;
        animFrameRef.current = requestAnimationFrame(animate);

        if (!isInteracting) {
          lonRef.current += velocityLon;
          latRef.current += velocityLat;
          velocityLon *= FRIC;
          velocityLat *= FRIC;
          if (latRef.current > LAT_LIM) { latRef.current = LAT_LIM; velocityLat = 0; }
          else if (latRef.current < -LAT_LIM) { latRef.current = -LAT_LIM; velocityLat = 0; }
          if (Math.abs(velocityLon) < 0.005) velocityLon = 0;
          if (Math.abs(velocityLat) < 0.005) velocityLat = 0;
        }

        const phi = THREE.MathUtils.degToRad(90 - latRef.current);
        const theta = THREE.MathUtils.degToRad(lonRef.current);
        camera.lookAt(new THREE.Vector3(
          500 * Math.sin(phi) * Math.cos(theta),
          500 * Math.cos(phi),
          500 * Math.sin(phi) * Math.sin(theta)
        ));
        renderer.render(scene, camera);

        // 热点
        updateHotspots(camera, container);

        // 罗盘
        if (compassNeedleRef.current) {
          compassNeedleRef.current.style.transform = `rotate(${-lonRef.current}deg)`;
        }
      };
      animate();

      const onResize = () => {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelled = true;
        isInteracting = false;
        container.removeEventListener('mousedown', onDown);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        container.removeEventListener('touchstart', onDown);
        container.removeEventListener('touchmove', onMove);
        container.removeEventListener('touchend', onUp);
        window.removeEventListener('resize', onResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        renderer.dispose(); geometry.dispose(); material.dispose(); texture.dispose();
        const c = renderer.domElement;
        if (c?.parentNode) c.parentNode.removeChild(c);
      };
    };

    const cleanup = init();
    return () => { cancelled = true; cleanup?.then?.(fn => fn?.()); };
  }, [phase, currentDistrictId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 热点3D→2D投影
  const updateHotspots = (camera, container) => {
    const THREE = threeModuleRef.current;
    if (!THREE || !camera || !container) return;
    const w = container.clientWidth, h = container.clientHeight;
    const district = worldMap.getDistrict(currentDistrictId);
    if (!district) return;

    [...district.buildings.map(b => ({ id: b.id, yaw: b.yaw, pitch: b.pitch })),
     ...district.npcs.map(n => ({ id: `npc_${n.id}`, yaw: n.yaw, pitch: n.pitch }))]
    .forEach(({ id, yaw, pitch }) => {
      const el = hotspotsRef.current[id];
      if (!el) return;
      const phi = THREE.MathUtils.degToRad(90 - (pitch || 0));
      const theta = THREE.MathUtils.degToRad(yaw || 0);
      const pos = new THREE.Vector3(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
      pos.project(camera);
      if (pos.z > 1 || Math.abs(pos.x) > 1.2 || Math.abs(pos.y) > 1.2) { el.style.display = 'none'; return; }
      const dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      el.style.display = 'flex';
      el.style.left = ((pos.x * 0.5 + 0.5) * w) + 'px';
      el.style.top = ((-pos.y * 0.5 + 0.5) * h) + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${Math.max(0.5, 1 - dist * 0.4)})`;
      el.style.opacity = Math.max(0.3, 1 - dist * 0.6);
    });
  };

  // 进入建筑
  const enterBuilding = useCallback((building) => {
    if (!building.accessible && !unlockedBuildings.has(building.id)) {
      showNotif(building.lockedReason || '🔒 门锁着，暂时无法进入', 'locked');
      return;
    }
    setCurrentBuilding(building);
    setPhase(PHASE.INTERIOR);
    advanceTime(0.5);
  }, [showNotif, advanceTime, unlockedBuildings]);

  // 离开建筑
  const leaveBuilding = useCallback(() => {
    setCurrentBuilding(null);
    setPhase(PHASE.EXPLORE);
  }, []);

  // 搜查物品
  const inspectItem = useCallback((item) => {
    if (inspectedItems.has(item.id)) {
      showNotif('已经检查过了', 'info');
      return;
    }
    const newInspected = new Set([...inspectedItems, item.id]);
    setInspectedItems(newInspected);
    if (item.isKey) {
      const newClue = {
        id: item.id,
        name: item.name,
        icon: item.icon,
        clue: item.clue,
        source: currentBuilding?.name || '街道'
      };
      const newClues = [...collectedClues, newClue];
      setCollectedClues(newClues);
      showNotif(`🔑 发现关键线索：${item.name}`, 'key');
      checkUnlocks(newClues);
    } else {
      showNotif(`发现：${item.name}`, 'info');
    }
    advanceTime(0.3);
  }, [inspectedItems, currentBuilding, showNotif, advanceTime, collectedClues, checkUnlocks]);

  // 与NPC对话
  const startDialogue = useCallback((npcId) => {
    const char = worldMap.characters[npcId];
    if (!char) return;
    setCurrentNpc({ id: npcId, ...char });
    setCurrentQuestion(null);
    setPhase(PHASE.DIALOGUE);
    advanceTime(0.3);
  }, [advanceTime]);

  // 选择问题
  const askQuestion = useCallback((q) => {
    if (!currentNpc) return;
    const round = npcRoundsDone[currentNpc.id] || 0;
    const key = `${currentNpc.id}_r${round}`;
    setDialogueHistory(prev => ({ ...prev, [key]: q }));
    setCurrentQuestion(q);
    setTalkedNpcs(prev => new Set([...prev, currentNpc.id]));
  }, [currentNpc, npcRoundsDone]);

  // 结束对话轮次
  const endDialogueRound = useCallback(() => {
    if (!currentNpc) return;
    const newRounds = { ...npcRoundsDone };
    newRounds[currentNpc.id] = (newRounds[currentNpc.id] || 0) + 1;
    setNpcRoundsDone(newRounds);
    if (newRounds[currentNpc.id] >= 3) {
      showNotif(`${currentNpc.name} 的审讯已完成`, 'complete');
      setCurrentNpc(null);
      setCurrentQuestion(null);
      if (currentBuilding) {
        setPhase(PHASE.INTERIOR);
      } else {
        setPhase(PHASE.EXPLORE);
      }
    } else {
      setCurrentQuestion(null);
    }
  }, [currentNpc, npcRoundsDone, showNotif, currentBuilding]);

  // 退出对话
  const exitDialogue = useCallback(() => {
    setCurrentNpc(null);
    setCurrentQuestion(null);
    if (currentBuilding) {
      setPhase(PHASE.INTERIOR);
    } else {
      setPhase(PHASE.EXPLORE);
    }
  }, [currentBuilding]);

  // 提交指认
  const submitVerdict = useCallback(() => {
    if (!selectedCulprit) return;
    const isCorrect = selectedCulprit === worldMap.caseResult.culprit;
    const hasAllEvidence = selectedEvidence.length >= 3;
    if (isCorrect && hasAllEvidence) {
      setVerdictResult('perfect');
    } else if (isCorrect) {
      setVerdictResult('correct');
    } else {
      setVerdictResult('wrong');
    }
    setPhase(PHASE.VERDICT);
  }, [selectedCulprit, selectedEvidence]);

  // 所有NPC列表
  const allNpcs = Object.entries(worldMap.characters).map(([id, char]) => ({
    id,
    ...char
  }));

  // ===== 渲染函数 =====

  // 开场
  const renderIntro = () => (
    <div className="mystery-intro" onClick={() => phase === PHASE.INTRO && introStep >= 2 && setPhase(PHASE.EXPLORE)}>
      <div className="intro-particles">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>
      <div className="intro-silhouette" />
      <div className={`intro-text ${introStep >= 1 ? 'intro-step-1' : ''} ${introStep >= 2 ? 'intro-step-2' : ''} ${introStep >= 3 ? 'intro-step-3' : ''}`}>
        <div className="intro-title">
          {'冬宫暗奏'.split('').map((ch, i) => (
            <span key={i} className="title-char" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>{ch}</span>
          ))}
        </div>
        <div className="intro-subtitle-ru">Тёмная мелодия Зимнего дворца</div>
        <div className="intro-desc">1881年，圣彼得堡。穆索尔斯基离奇去世，他的手稿被人篡改。<br />你是调查员，穿梭于四条街区，寻找真相。</div>
        <button className="intro-enter-btn" onClick={() => setPhase(PHASE.EXPLORE)}>
          <span className="btn-icon">🕯️</span> 进入调查
        </button>
      </div>
    </div>
  );

  // ===== 360全景街道探索 =====
  const renderExplore = () => {
    const mood = DISTRICT_MOOD[currentDistrictId] || DISTRICT_MOOD.nevsky;
    const district = currentDistrict;

    return (
      <div className="explore-page">
        {/* HUD */}
        <div className="explore-hud">
          <Link href="/" className="hud-back">← 音乐史</Link>
          <div className="hud-case-info">
            <div className="hud-case-title">冬宫暗奏</div>
            <div className="hud-case-sub">Санкт-Петербург · 1881</div>
          </div>
          <div className="hud-district-badge" style={{ borderColor: mood.color, color: mood.color }}>
            <span>{mood.icon}</span>
            <span className="hud-district-name">{district?.name}</span>
          </div>
          <div className="hud-stats">
            <div className="hud-time">
              <span className="time-icon">🕐</span>
              <span className="time-text">{Math.floor(gameTime)}:00</span>
            </div>
            <div className="hud-clues">
              <span className="clue-icon">🔑</span>
              <span>{collectedClues.length}</span>
            </div>
            <button className="hud-evidence-btn" onClick={() => setPhase(PHASE.EVIDENCE)}>
              推理 ⚖️
            </button>
            <button className="hud-minimap-btn" onClick={() => setShowMinimap(true)}>🗺️</button>
          </div>
        </div>

        {/* 360全景视口 */}
        <div className="pano-viewport" ref={panoContainerRef}>
          {/* Three.js canvas inserted here */}
          {/* 暗角遮罩 - 隐藏接缝区域 */}
          <div className="pano-vignette" />

          {/* 建筑热点 */}
          {district?.buildings.map(b => {
            const isLocked = !b.accessible && !unlockedBuildings.has(b.id);
            return (
              <div
                key={b.id}
                ref={el => { hotspotsRef.current[b.id] = el; }}
                className={`pano-hotspot hotspot-building ${isLocked ? 'hotspot-locked' : ''}`}
                onClick={(e) => { e.stopPropagation(); enterBuilding(b); }}
              >
                <div className="hotspot-icon">{b.icon}</div>
                <div className="hotspot-name">{b.name}</div>
                <div className="hotspot-sign">{b.sign}</div>
                {isLocked && <div className="hotspot-lock">🔒</div>}
                <div className="hotspot-pulse" />
              </div>
            );
          })}

          {/* 街道NPC热点 */}
          {district?.npcs.map(npc => (
            <div
              key={`npc_${npc.id}`}
              ref={el => { hotspotsRef.current[`npc_${npc.id}`] = el; }}
              className="pano-hotspot hotspot-npc"
              onClick={(e) => { e.stopPropagation(); startDialogue(npc.id); }}
            >
              <img src={npc.portrait} alt={npc.name} className="hotspot-portrait" />
              <div className="hotspot-name">{npc.name}</div>
              <div className="hotspot-npc-location">{npc.location}</div>
              <div className="hotspot-pulse" />
            </div>
          ))}

          {/* 罗盘 */}
          <div className="pano-compass-wrap">
            <div className="pano-compass">
              <div className="compass-ring">
                <div className="compass-needle" ref={compassNeedleRef}>
                  <div className="compass-n">N</div>
                  <div className="compass-s">S</div>
                </div>
              </div>
            </div>
          </div>

          {/* 拖拽提示 */}
          {panoReady && hintVisible && (
            <div className="pano-hint">
              <span className="pano-hint-icon">👆</span>
              拖拽环顾四周 · 点击地点探索
            </div>
          )}

          {/* 雾效（旧巷区和公园区） */}
          {(currentDistrictId === 'alley' || currentDistrictId === 'park') && (
            <div className="fog-layer fog-left" />
          )}
          {currentDistrictId === 'alley' && (
            <div className="fog-layer fog-right" style={{ animationDelay: '-7s' }} />
          )}

          {/* 加载指示 */}
          {!panoReady && (
            <div className="pano-loading">
              <div className="pano-loading-spinner" />
              <div>加载全景中…</div>
            </div>
          )}
        </div>

        {/* 街区出口 */}
        {district?.exits?.left && (
          <div className="district-exit district-exit-left" onClick={() => travelToDistrict(district.exits.left)}>
            <div className="exit-arrow">◀</div>
            <div className="exit-label">{worldMap.getDistrict(district.exits.left)?.name}</div>
          </div>
        )}
        {district?.exits?.right && (
          <div className="district-exit district-exit-right" onClick={() => travelToDistrict(district.exits.right)}>
            <div className="exit-arrow">▶</div>
            <div className="exit-label">{worldMap.getDistrict(district.exits.right)?.name}</div>
          </div>
        )}

        {/* 小地图 */}
        {showMinimap && renderMinimap()}

        {/* 通知 */}
        {notification && (
          <div className={`notification notif-${notification.type}`}>
            {notification.text}
          </div>
        )}
      </div>
    );
  };

  // 小地图
  const renderMinimap = () => (
    <div className="minimap-overlay" onClick={() => setShowMinimap(false)}>
      <div className="minimap-panel" onClick={e => e.stopPropagation()}>
        <div className="minimap-title">🗺️ 圣彼得堡街区</div>
        <div className="minimap-grid">
          {worldMap.districts.map(d => {
            const isCurrent = d.id === currentDistrictId;
            const mood = DISTRICT_MOOD[d.id];
            return (
              <div
                key={d.id}
                className={`minimap-district ${isCurrent ? 'minimap-current' : ''}`}
                style={{ '--district-color': mood.color }}
                onClick={() => { travelToDistrict(d.id); setShowMinimap(false); }}
              >
                <div className="minimap-district-icon">{mood.icon}</div>
                <div className="minimap-district-name">{d.name}</div>
                <div className="minimap-district-ru">{d.nameRu}</div>
                <div className="minimap-district-buildings">
                  {d.buildings.length}个地点
                  {d.npcs.length > 0 && ` · ${d.npcs.length}人`}
                </div>
                {isCurrent && <div className="minimap-you">📍 你在这里</div>}
              </div>
            );
          })}
        </div>
        <div className="minimap-hint">点击任意街区前往</div>
      </div>
    </div>
  );

  // 转场
  const renderTransition = () => {
    const target = worldMap.getDistrict(transitionTarget);
    const mood = DISTRICT_MOOD[transitionTarget];
    return (
      <div className="district-transition">
        <div className="transition-overlay">
          <div className="transition-icon">{mood?.icon || '🏛️'}</div>
          <div className="transition-name" style={{ color: mood?.color }}>{target?.name}</div>
          <div className="transition-name-ru">{target?.nameRu}</div>
          <div className="transition-desc">{target?.description}</div>
        </div>
      </div>
    );
  };

  // 建筑内部
  const renderInterior = () => {
    if (!currentBuilding) return null;
    const npc = currentBuilding.npcInside ? worldMap.characters[currentBuilding.npcInside] : null;

    return (
      <div className="interior-page">
        <div className="interior-hud">
          <button className="hud-back" onClick={leaveBuilding}>
            ← 返回{currentDistrict?.name || '街道'}
          </button>
          <div className="interior-title">{currentBuilding.name}</div>
          <div className="interior-subtitle">{currentBuilding.nameRu}</div>
        </div>

        <div className="interior-scene">
          <div className="interior-bg">
            <img src={currentBuilding.interior} alt={currentBuilding.name} className="interior-bg-img" />
            <div className="interior-overlay" />
          </div>

          <div className="interior-items">
            {currentBuilding.clueItems?.map(item => (
              <div
                key={item.id}
                className={`interior-item ${inspectedItems.has(item.id) ? 'item-inspected' : ''} ${item.isKey ? 'item-key' : ''}`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={() => inspectItem(item)}
              >
                <span className="interior-item-icon">{item.icon}</span>
                {!inspectedItems.has(item.id) && item.isKey && <span className="item-sparkle">✨</span>}
                {inspectedItems.has(item.id) && <span className="item-checked">✓</span>}
              </div>
            ))}
          </div>

          {npc && (
            <div className="interior-npc" onClick={() => startDialogue(currentBuilding.npcInside)}>
              <img src={npc.portrait} alt={npc.name} className="interior-npc-portrait" />
              <div className="interior-npc-name">{npc.name}</div>
              <div className="interior-npc-hint">点击对话</div>
              <div className="npc-pulse" />
            </div>
          )}
        </div>

        {notification && (
          <div className={`notification notif-${notification.type}`}>
            {notification.text}
          </div>
        )}
      </div>
    );
  };

  // 对话
  const renderDialogue = () => {
    if (!currentNpc) return null;
    const roundsDone = npcRoundsDone[currentNpc.id] || 0;
    const currentRound = Math.min(roundsDone, 2);
    const roundKey = `round${currentRound + 1}`;
    const questions = currentNpc.dialogues[roundKey];
    const askedKey = `${currentNpc.id}_r${currentRound}`;
    const asked = dialogueHistory[askedKey];

    return (
      <div className="dialogue-overlay">
        <div className="dialogue-container">
          <div className="dialogue-portrait-side">
            <img src={currentNpc.portrait} alt={currentNpc.name} className="dialogue-portrait-lg" />
            <div className="dialogue-npc-name">{currentNpc.name}</div>
            <div className="dialogue-npc-ru">{currentNpc.nameRu}</div>
            <div className="dialogue-round-info">第{currentRound + 1}/3轮</div>
            <button className="dialogue-exit" onClick={exitDialogue}>✕ 离开</button>
          </div>

          <div className="dialogue-main">
            {!asked ? (
              <div className="dialogue-questions">
                <div className="dialogue-greeting">
                  {currentNpc.greeting || `${currentNpc.name}看着你，等待你的提问。`}
                </div>
                {questions.map((q, idx) => (
                  <button key={idx} className="dialogue-question-btn" onClick={() => askQuestion(q)}>
                    <span className="q-num">{idx + 1}</span>
                    <span className="q-text">{q.question}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="dialogue-response-area">
                <div className="dialogue-asked-q">
                  <span className="q-marker">你：</span>{asked.question}
                </div>
                <div className="dialogue-answer">
                  <span className="a-marker">{currentNpc.name}：</span>{asked.answer}
                </div>
                {asked.hint && (
                  <div className="dialogue-hint-box">💡 {asked.hint}</div>
                )}
                <button className="dialogue-continue" onClick={endDialogueRound}>
                  {currentRound < 2 ? '继续 →' : '结束审讯'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 证据板
  const renderEvidence = () => (
    <div className="evidence-page">
      <header className="mystery-header">
        <button className="back-link" onClick={() => setPhase(PHASE.EXPLORE)}>
          <span className="back-arrow">←</span> 返回街道
        </button>
        <h1 className="mystery-page-title">推理</h1>
      </header>

      <div className="evidence-board">
        <div className="evidence-section">
          <h3 className="evidence-label">物证线索</h3>
          <div className="evidence-cards">
            {collectedClues.length === 0 ? (
              <p className="clue-empty">还没有收集到线索，去四个街区探索吧</p>
            ) : (
              collectedClues.map(clue => (
                <div
                  key={clue.id}
                  className={`evidence-item ${selectedEvidence.includes(clue.id) ? 'evidence-selected' : ''}`}
                  onClick={() => {
                    setSelectedEvidence(prev =>
                      prev.includes(clue.id) ? prev.filter(e => e !== clue.id) : [...prev, clue.id]
                    );
                  }}
                >
                  <span className="evidence-icon">{clue.icon}</span>
                  <span className="evidence-name">{clue.name}</span>
                  <p className="evidence-clue">{clue.clue}</p>
                  <span className="evidence-source">📍 {clue.source}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="evidence-section">
          <h3 className="evidence-label">证词记录</h3>
          <div className="testimony-cards">
            {allNpcs.filter(npc => talkedNpcs.has(npc.id)).map(npc => (
              <div key={npc.id} className="testimony-suspect">
                <div className="testimony-header">
                  <img src={npc.portrait} alt={npc.name} className="testimony-portrait" />
                  <span className="testimony-name">{npc.name}</span>
                </div>
                {[0, 1, 2].map(r => {
                  const key = `${npc.id}_r${r}`;
                  if (!dialogueHistory[key]) return null;
                  return (
                    <div key={r} className="testimony-entry">
                      <span className="testimony-round">第{r + 1}轮</span>
                      <p className="testimony-q">{dialogueHistory[key].question}</p>
                      <p className="testimony-a">{dialogueHistory[key].answer}</p>
                      {dialogueHistory[key].hint && (
                        <p className="testimony-hint">💡 {dialogueHistory[key].hint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {talkedNpcs.size === 0 && <p className="clue-empty">还没有与任何人对话</p>}
          </div>
        </div>
      </div>

      <div className="verdict-section">
        <h3 className="verdict-label">指认凶手</h3>
        <div className="culprit-select">
          {allNpcs.map(npc => (
            <div
              key={npc.id}
              className={`culprit-option ${selectedCulprit === npc.id ? 'culprit-selected' : ''}`}
              onClick={() => setSelectedCulprit(npc.id)}
            >
              <img src={npc.portrait} alt={npc.name} className="culprit-portrait" />
              <span className="culprit-name">{npc.name}</span>
              {selectedCulprit === npc.id && <span className="culprit-check">✓</span>}
            </div>
          ))}
        </div>
        <button className="submit-verdict-btn" onClick={submitVerdict} disabled={!selectedCulprit}>
          提交指认 ⚖️
        </button>
      </div>
    </div>
  );

  // 结案
  const renderVerdict = () => {
    const isCorrect = verdictResult !== 'wrong';
    return (
      <div className={`verdict-page ${isCorrect ? 'verdict-correct' : 'verdict-wrong'}`}>
        <div className="verdict-dramatic">
          <div className="verdict-stamp">{isCorrect ? '破案' : '误判'}</div>
        </div>
        <div className="verdict-content">
          {verdictResult === 'perfect' && (
            <><h2>🎯 完美破案！</h2><p>你不仅找到了真凶，还构建了完整的证据链。</p></>
          )}
          {verdictResult === 'correct' && (
            <><h2>✅ 凶手找对了</h2><p>但证据链还不够完整。下次多收集一些线索吧。</p></>
          )}
          {verdictResult === 'wrong' && (
            <><h2>❌ 误判！</h2><p>你指认了无辜的人。真凶：<strong>{worldMap.caseResult.culpritName}</strong></p></>
          )}
          <button className="reveal-truth-btn" onClick={() => setPhase(PHASE.TRUTH)}>
            揭示真相 →
          </button>
        </div>
      </div>
    );
  };

  // 真相
  const renderTruth = () => (
    <div className="truth-page">
      <div className="truth-reveal">
        <h2 className="truth-title">真相还原</h2>
        <div className="truth-portrait-row">
          <div className="truth-victim">
            <img src={worldMap.caseResult.victimPortrait} alt="" />
            <p>{worldMap.caseResult.victimName}</p>
            <span className="truth-label">受害者</span>
          </div>
          <div className="truth-culprit">
            <img src={worldMap.caseResult.culpritPortrait} alt="" />
            <p>{worldMap.caseResult.culpritName}</p>
            <span className="truth-label culprit-label">真凶</span>
          </div>
        </div>
        <div className="truth-text">
          {worldMap.caseResult.truth.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="knowledge-cards">
          <h3 className="knowledge-title">📚 本案涉及的音乐史知识</h3>
          {worldMap.caseResult.knowledge.map((k, i) => (
            <div key={i} className="knowledge-card">
              <h4>{k.title}</h4>
              <p>{k.content}</p>
              <span className="knowledge-source">{k.source}</span>
            </div>
          ))}
        </div>
        <div className="truth-actions">
          <button className="replay-btn" onClick={() => {
            setPhase(PHASE.EXPLORE);
            setCollectedClues([]);
            setInspectedItems(new Set());
            setTalkedNpcs(new Set());
            setNpcRoundsDone({});
            setDialogueHistory({});
            setSelectedCulprit(null);
            setSelectedEvidence([]);
            setVerdictResult(null);
            setGameTime(14);
            setDayPhase('afternoon');
            setCurrentDistrictId('nevsky');
            setUnlockedBuildings(new Set());
          }}>🔄 重新调查</button>
          <Link href="/" className="back-home-btn">🏠 返回音乐史</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mystery-app">
      {phase === PHASE.INTRO && renderIntro()}
      {phase === PHASE.EXPLORE && renderExplore()}
      {phase === PHASE.INTERIOR && renderInterior()}
      {phase === PHASE.EVIDENCE && renderEvidence()}
      {phase === PHASE.VERDICT && renderVerdict()}
      {phase === PHASE.TRUTH && renderTruth()}
      {phase === PHASE.TRANSITION && renderTransition()}
      {phase === PHASE.DIALOGUE && renderDialogue()}
    </div>
  );
}
