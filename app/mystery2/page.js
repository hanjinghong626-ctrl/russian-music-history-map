'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import worldMap from './worldData2';
import './mystery2.css';

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
  theater: { icon: '🎭', color: '#c9a84c', skyClass: 'sky-night' },
  conservatory: { icon: '🎹', color: '#8b6b4a', skyClass: 'sky-dusk' },
  mansion: { icon: '🏡', color: '#9b7a5a', skyClass: 'sky-afternoon' },
  riverbank: { icon: '🌙', color: '#5a7a9b', skyClass: 'sky-dawn' }
};

export default function MysteryPage() {
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [introStep, setIntroStep] = useState(0);

  // 街区与漫游状态
  const [currentDistrictId, setCurrentDistrictId] = useState('theater');
  const [scrollX, setScrollX] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [playerDirection, setPlayerDirection] = useState('right');

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
  const [playerWalking, setPlayerWalking] = useState(false);

  const streetRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStartX = useRef(0);
  const walkTimer = useRef(null);

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

  // 切换街区（带转场动画）
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
      setScrollX(0);
      setPlayerX(50);
      setTransitionTarget(null);
      setPhase(PHASE.EXPLORE);
      advanceTime(0.5);
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, transitionTarget, advanceTime]);

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

  // 拖拽漫游街道
  const handlePointerDown = useCallback((e) => {
    if (phase !== PHASE.EXPLORE) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStartX.current = scrollX;
  }, [phase, scrollX]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || phase !== PHASE.EXPLORE) return;
    const delta = startX.current - e.clientX;
    const maxScroll = 2000;
    const newScroll = Math.max(0, Math.min(maxScroll, scrollStartX.current + delta));
    setScrollX(newScroll);
    setPlayerX(50 + (newScroll / maxScroll) * 50);
    setPlayerDirection(delta > 0 ? 'right' : 'left');
  }, [phase]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // 提交指认
  const submitVerdict = useCallback(() => {
    if (!selectedCulprit) return;
    const isCorrect = selectedCulprit === worldMap.caseResult.culprit;
    const hasEvidence = selectedEvidence.length > 0;
    let result;
    if (isCorrect && hasEvidence) result = 'perfect';
    else if (isCorrect) result = 'correct';
    else result = 'wrong';
    setVerdictResult(result);
    setPhase(PHASE.VERDICT);
  }, [selectedCulprit, selectedEvidence]);

  // 获取当前街区的有效建筑（处理解锁状态）
  const getEffectiveBuildings = useCallback((district) => {
    if (!district) return [];
    return district.buildings.map(b => ({
      ...b,
      accessible: b.accessible || unlockedBuildings.has(b.id)
    }));
  }, [unlockedBuildings]);

  const allNpcs = Object.entries(worldMap.characters).map(([id, char]) => ({ id, ...char }));
  const mood = DISTRICT_MOOD[currentDistrictId] || DISTRICT_MOOD.nevsky;

  // ==================== 渲染 ====================

  const renderIntro = () => (
    <div className="mystery-intro" onClick={() => setPhase(PHASE.EXPLORE)}>
      <div className="intro-particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>
      <div className="intro-silhouette" />
      <div className={`intro-text intro-step-${introStep}`}>
        <h1 className="intro-title">
          <span className="title-char" style={{ animationDelay: '0s' }}>案</span>
          <span className="title-char" style={{ animationDelay: '0.1s' }}>中</span>
          <span className="title-char" style={{ animationDelay: '0.2s' }}>曲</span>
        </h1>
        <p className="intro-subtitle-ru">Эхо Москвы</p>
        <p className="intro-desc">1893年·莫斯科<br />柴可夫斯基首演《悲怆》九日后离世——你是侦探<br />四个街区，六名关联人，一个被掩盖的真相</p>
        <button className="intro-enter-btn">
          <span className="btn-icon">🔍</span> 踏入莫斯科
        </button>
      </div>
    </div>
  );

  // 街区转场动画
  const renderTransition = () => {
    const target = worldMap.getDistrict(transitionTarget);
    if (!target) return null;
    const targetMood = DISTRICT_MOOD[transitionTarget] || DISTRICT_MOOD.nevsky;
    return (
      <div className="district-transition">
        <div className="transition-overlay" style={{ '--accent': targetMood.color }}>
          <div className="transition-icon">{targetMood.icon}</div>
          <div className="transition-name">{target.name}</div>
          <div className="transition-name-ru">{target.nameRu}</div>
          <div className="transition-desc">{target.description}</div>
        </div>
      </div>
    );
  };

  // 街道探索（多街区版）
  const renderExplore = () => {
    if (!currentDistrict) return null;
    const buildings = getEffectiveBuildings(currentDistrict);

    return (
      <div className="explore-page">
        {/* HUD */}
        <div className="explore-hud">
          <Link href="/" className="hud-back">← 返回</Link>
          <div className="hud-case-info">
            <span className="hud-case-title">案中曲</span>
            <span className="hud-case-sub">莫斯科的回声 · 1893</span>
          </div>
          <div className="hud-stats">
            <div className="hud-district-badge" style={{ borderColor: mood.color }}>
              <span>{mood.icon}</span>
              <span className="hud-district-name">{currentDistrict.name}</span>
            </div>
            <div className="hud-time">
              <span className="time-icon">{dayPhase === 'night' ? '🌙' : dayPhase === 'evening' ? '🌆' : '☀️'}</span>
              <span className="time-text">{Math.floor(gameTime)}:00</span>
            </div>
            <div className="hud-clues">
              <span className="clue-icon">🔑</span>
              <span>{collectedClues.length}</span>
            </div>
            <button className="hud-evidence-btn" onClick={() => setPhase(PHASE.EVIDENCE)}>
              📋 推理
            </button>
            <button className="hud-minimap-btn" onClick={() => setShowMinimap(!showMinimap)}>
              🗺️
            </button>
          </div>
        </div>

        {/* 街道场景 */}
        <div
          className="street-viewport"
          ref={streetRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="street-scroll" style={{ transform: `translateX(${-scrollX}px)` }}>
            <div className="street-bg">
              <img src={currentDistrict.background} alt={currentDistrict.name} className="street-bg-img" />
            </div>

            {/* 建筑热区 */}
            {buildings.map(b => (
              <div
                key={b.id}
                className="building-hotspot"
                style={{ left: `${b.x}%`, width: `${b.width}%` }}
                onClick={() => enterBuilding(b)}
              >
                <div className="building-sign">
                  <span className="sign-text">{b.icon} {b.sign}</span>
                </div>
                <div className="building-door">
                  <span className="door-icon">{b.accessible ? '🚪' : '🔒'}</span>
                </div>
                <div className="building-label">{b.name}</div>
                {b.npcInside && worldMap.characters[b.npcInside] && (
                  <div className="building-npc-indicator">
                    <img src={worldMap.characters[b.npcInside].portrait} alt="" className="npc-thumb" />
                  </div>
                )}
              </div>
            ))}

            {/* 街道NPC */}
            {currentDistrict.npcs.map(npc => (
              <div
                key={npc.id}
                className="street-npc"
                style={{ left: `${npc.x}%` }}
                onClick={() => startDialogue(npc.id)}
              >
                <div className="street-npc-portrait">
                  <img src={npc.portrait} alt={npc.name} />
                  {talkedNpcs.has(npc.id) && <div className="npc-talked-badge">✓</div>}
                </div>
                <div className="street-npc-name">{npc.name}</div>
                <div className="street-npc-location">{npc.location}</div>
                <div className="npc-pulse" />
              </div>
            ))}

            {/* 氛围效果 */}
            <div className="street-atmosphere">
              {currentDistrict.weather === 'snow' && [...Array(25)].map((_, i) => (
                <div key={`snow-${i}`} className="snowflake" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }} />
              ))}
              {currentDistrict.weather === 'fog' && [...Array(8)].map((_, i) => (
                <div key={`fog-${i}`} className="fog-layer" style={{
                  left: `${i * 15}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${12 + i * 2}s`
                }} />
              ))}
            </div>

            {/* 天色 */}
            <div className={`sky-overlay ${mood.skyClass}`} />
          </div>

          {/* 街区出口指示 */}
          {currentDistrict.exits.left && (
            <div className="district-exit district-exit-left" onClick={() => travelToDistrict(currentDistrict.exits.left)}>
              <span className="exit-arrow">←</span>
              <span className="exit-label">{worldMap.getDistrict(currentDistrict.exits.left)?.name}</span>
            </div>
          )}
          {currentDistrict.exits.right && (
            <div className="district-exit district-exit-right" onClick={() => travelToDistrict(currentDistrict.exits.right)}>
              <span className="exit-label">{worldMap.getDistrict(currentDistrict.exits.right)?.name}</span>
              <span className="exit-arrow">→</span>
            </div>
          )}

          {/* 滚动提示 */}
          {scrollX < 100 && (
            <div className="scroll-hint scroll-hint-center">
              ← 滑动漫游街道 →
            </div>
          )}
        </div>

        {/* 玩家位置指示器 */}
        <div className="player-indicator">
          <div className="player-dot" />
          <span className="player-label">{currentDistrict.name} · {currentDistrict.nameRu}</span>
        </div>

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
        <div className="minimap-title">🗺️ 圣彼得堡地图</div>
        <div className="minimap-grid">
          {worldMap.districts.map((d, idx) => {
            const dMood = DISTRICT_MOOD[d.id];
            const isCurrent = d.id === currentDistrictId;
            const hasVisited = true; // 简化：所有区域都可见
            return (
              <div
                key={d.id}
                className={`minimap-district ${isCurrent ? 'minimap-current' : ''}`}
                style={{ '--district-color': dMood.color }}
                onClick={() => {
                  if (!isCurrent) travelToDistrict(d.id);
                  setShowMinimap(false);
                }}
              >
                <div className="minimap-district-icon">{dMood.icon}</div>
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
        <h3 className="verdict-label">谁杀死了柴可夫斯基？</h3>
        <p className="verdict-hint" style={{color: 'var(--mystery-text-dim)', fontSize: '0.85rem', marginBottom: '1rem'}}>仔细思考——凶手可能不只是一个具体的人</p>
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
          <div
            className={`culprit-option culprit-option-system ${selectedCulprit === 'system' ? 'culprit-selected' : ''}`}
            onClick={() => setSelectedCulprit('system')}
          >
            <div className="culprit-system-icon">⚖️</div>
            <span className="culprit-name">整个体制</span>
            {selectedCulprit === 'system' && <span className="culprit-check">✓</span>}
          </div>
        </div>
        <button className="submit-verdict-btn" onClick={submitVerdict} disabled={!selectedCulprit}>
          提交判断 ⚖️
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
            <div className="truth-system-icon" style={{width: 100, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'rgba(139,34,82,0.3)', borderRadius: '8px', border: '2px solid var(--mystery-blood)'}}>⚖️</div>
            <p>{worldMap.caseResult.culpritName}</p>
            <span className="truth-label culprit-label">共谋者</span>
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
            setScrollX(0);
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
