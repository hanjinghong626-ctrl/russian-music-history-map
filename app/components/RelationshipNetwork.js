'use client';

import { useState, useRef, useCallback } from 'react';
import { composers } from '../data/composers';
import { relationships, relationshipConfig } from '../data/relationships';
import './RelationshipNetwork.css';

// 作曲家阵营映射
const composerFactions = {
  glinka: 'foundation',
  dargomyzhsky: 'foundation',
  balakirev: 'mighty_five',
  mussorgsky: 'mighty_five',
  borodin: 'mighty_five',
  rimsky_korsakov: 'mighty_five',
  cui: 'mighty_five',
  anton_rubinstein: 'academic',
  nikolai_rubinstein: 'academic',
  tchaikovsky: 'academic',
  taneev: 'silver_age',
  arensky: 'silver_age',
  glazunov: 'silver_age',
  lyadov: 'silver_age',
  scriabin: 'silver_age',
  rakhmaninov: 'silver_age',
  metner: 'silver_age',
  stravinsky: 'twentieth',
  prokofiev: 'twentieth',
  shostakovich: 'twentieth',
  myaskovsky: 'twentieth',
  khachaturian: 'twentieth',
  kabalevsky: 'twentieth',
  shnitke: 'twentieth',
};

// 阵营配置
const factionConfig = {
  foundation: { name: '奠基期', color: '#8B7355' },
  mighty_five: { name: '强力集团', color: '#D4AF37' },
  academic: { name: '学院派', color: '#4A90D9' },
  silver_age: { name: '白银时代', color: '#9B59B6' },
  twentieth: { name: '20世纪', color: '#E74C3C' },
};

// 阵营区域布局配置（基于 viewBox 1200x800）
const factionLayouts = {
  foundation: { center: [200, 250], radius: 80 },
  mighty_five: { center: [550, 200], radius: 130 },
  academic: { center: [1000, 200], radius: 90 },
  silver_age: { center: [950, 500], radius: 120 },
  twentieth: { center: [350, 550], radius: 130 },
};

// 获取有关系的作曲家ID列表
const getComposersWithRelationships = () => {
  const composerIds = new Set();
  relationships.forEach(rel => {
    composerIds.add(rel.from);
    composerIds.add(rel.to);
  });
  return composerIds;
};

// 计算每个作曲家在阵营内的圆形排布位置
const calculateNodePositions = () => {
  const positions = {};
  const composersWithRel = getComposersWithRelationships();
  
  // 按阵营分组
  const factionComposers = {};
  composersWithRel.forEach(id => {
    const faction = composerFactions[id];
    if (faction && factionComposers[faction]) {
      factionComposers[faction].push(id);
    } else if (faction) {
      factionComposers[faction] = [id];
    }
  });
  
  // 计算每个阵营内作曲家的位置
  Object.entries(factionComposers).forEach(([faction, composerIds]) => {
    const layout = factionLayouts[faction];
    const count = composerIds.length;
    
    composerIds.forEach((id, idx) => {
      // 圆形排布
      const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
      const radius = layout.radius * 0.6;
      positions[id] = {
        x: layout.center[0] + radius * Math.cos(angle),
        y: layout.center[1] + radius * Math.sin(angle),
      };
    });
  });
  
  return positions;
};

// 计算每个作曲家的关系数量（用于确定节点大小）
const calculateRelationshipCounts = () => {
  const counts = {};
  getComposersWithRelationships().forEach(id => {
    counts[id] = relationships.filter(r => r.from === id || r.to === id).length;
  });
  return counts;
};

// 二次贝塞尔曲线路径
const getBezierPath = (x1, y1, x2, y2) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // 垂直偏移，避免直线重叠
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const curveOffset = Math.min(dist * 0.15, 30);
  
  const ctrlX = midX + perpX * curveOffset;
  const ctrlY = midY + perpY * curveOffset;
  
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
};

export default function RelationshipNetwork({ onClose }) {
  const [nodePositions] = useState(calculateNodePositions);
  const [relCounts] = useState(calculateRelationshipCounts);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPositions, setCustomPositions] = useState({});
  const svgRef = useRef(null);
  
  // 合并预设位置和自定义位置
  const getNodePosition = useCallback((id) => {
    const base = nodePositions[id] || { x: 600, y: 400 };
    return customPositions[id] || base;
  }, [nodePositions, customPositions]);
  
  // 计算节点半径
  const getNodeRadius = (id) => {
    const baseRadius = 25;
    const extraRadius = Math.min((relCounts[id] || 1) * 2, 15);
    return baseRadius + extraRadius;
  };
  
  // 鼠标拖动处理
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const pos = getNodePosition(nodeId);
    const svgRect = svgRef.current.getBoundingClientRect();
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - svgRect.left - pos.x,
      y: e.clientY - svgRect.top - pos.y,
    });
  };
  
  const handleMouseMove = (e) => {
    if (!draggingNode) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left - dragOffset.x;
    const y = e.clientY - svgRect.top - dragOffset.y;
    setCustomPositions(prev => ({
      ...prev,
      [draggingNode]: { x, y }
    }));
  };
  
  const handleMouseUp = () => {
    setDraggingNode(null);
  };
  
  // 点击背景取消选择
  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };
  
  // 节点点击处理
  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  };
  
  // 确定线的高亮状态
  const isLineHighlighted = (rel) => {
    const activeNode = selectedNode || hoveredNode;
    if (!activeNode) return false;
    return rel.from === activeNode || rel.to === activeNode;
  };
  
  // 确定线的透明度
  const getLineOpacity = (rel) => {
    const highlighted = isLineHighlighted(rel);
    const isHovered = hoveredLine === rel;
    if (highlighted) return isHovered ? 1 : 0.85;
    if (selectedNode || hoveredNode) return 0.05;
    return 0.4;
  };
  
  // 节点样式
  const getNodeOpacity = (nodeId) => {
    const activeNode = selectedNode || hoveredNode;
    if (!activeNode) return 1;
    if (nodeId === activeNode) return 1;
    
    // 检查是否有关系
    const hasRelation = relationships.some(
      r => (r.from === activeNode && r.to === nodeId) ||
           (r.to === activeNode && r.from === nodeId)
    );
    return hasRelation ? 0.7 : 0.15;
  };
  
  // 获取中文姓氏首字
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0);
  };
  
  // 渲染关系线
  const renderLines = () => {
    return relationships.map((rel, idx) => {
      const fromPos = getNodePosition(rel.from);
      const toPos = getNodePosition(rel.to);
      const config = relationshipConfig[rel.type];
      const opacity = getLineOpacity(rel);
      const isHovered = hoveredLine === rel;
      
      // 计算线宽
      let strokeWidth = 1.5;
      if (isHovered) strokeWidth = 2.5;
      
      // 虚线样式
      let strokeDasharray = 'none';
      if (config.pattern === 'dashed') strokeDasharray = '8, 6';
      else if (config.pattern === 'dotted') strokeDasharray = '3, 5';
      
      const path = getBezierPath(fromPos.x, fromPos.y, toPos.x, toPos.y);
      
      return (
        <g key={`line-${idx}`}>
          {/* 鼠标感应区域（更宽） */}
          <path
            d={path}
            fill="none"
            stroke="transparent"
            strokeWidth="12"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredLine(rel)}
            onMouseLeave={() => setHoveredLine(null)}
          />
          {/* 可见线条 */}
          <path
            d={path}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
            markerEnd={config.arrow ? `url(#arrow-${rel.type})` : undefined}
            style={{ transition: 'opacity 0.3s ease, stroke-width 0.2s ease' }}
          />
        </g>
      );
    });
  };
  
  // 渲染节点
  const renderNodes = () => {
    const composerIds = getComposersWithRelationships();
    
    return Array.from(composerIds).map(id => {
      const composer = composers.find(c => c.id === id);
      if (!composer) return null;
      
      const pos = getNodePosition(id);
      const radius = getNodeRadius(id);
      const faction = composerFactions[id] || 'foundation';
      const color = factionConfig[faction].color;
      const opacity = getNodeOpacity(id);
      const isActive = selectedNode === id || hoveredNode === id;
      const isSelected = selectedNode === id;
      
      return (
        <g
          key={id}
          className={`network-node ${isSelected ? 'selected' : ''}`}
          transform={`translate(${pos.x}, ${pos.y})`}
          onMouseEnter={() => setHoveredNode(id)}
          onMouseLeave={() => setHoveredNode(null)}
          onMouseDown={(e) => handleMouseDown(e, id)}
          onClick={(e) => handleNodeClick(e, id)}
          style={{ cursor: draggingNode === id ? 'grabbing' : 'grab', opacity }}
        >
          {/* 外圈光晕 */}
          <circle
            r={radius + 6}
            fill={color}
            opacity={isActive ? 0.25 : 0.1}
            style={{ transition: 'opacity 0.3s ease' }}
          />
          {/* 主圆 */}
          <circle
            r={radius}
            fill="#141B2D"
            stroke={color}
            strokeWidth={isSelected ? 3 : 2}
          />
          {/* 头像或首字 */}
          {composer.portrait ? (
              <foreignObject
                x={-(radius - 3)}
                y={-(radius - 3)}
                width={(radius - 3) * 2}
                height={(radius - 3) * 2}
                clipPath={`url(#clip-${id})`}
              >
                <img
                  src={composer.portrait}
                  alt={composer.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    display: 'block'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </foreignObject>
          ) : (
            <text
              textAnchor="middle"
              dy="5"
              fill={color}
              fontSize={radius * 0.8}
              fontWeight="600"
              fontFamily="'Noto Serif SC', serif"
            >
              {getInitial(composer.name)}
            </text>
          )}
          {/* 名字标签 */}
          <text
            textAnchor="middle"
            y={radius + 16}
            fill="#B8C5D6"
            fontSize="10"
            fontFamily="'Noto Sans SC', sans-serif"
          >
            {composer.name}
          </text>
        </g>
      );
    });
  };
  
  // 渲染所有节点的clipPath（统一在defs中）
  // 渲染所有节点的clipPath（统一在defs中）
  const renderClipPaths = () => {
    const composerIds = getComposersWithRelationships();
    return Array.from(composerIds).map(id => {
      const composer = composers.find(c => c.id === id);
      if (!composer || !composer.portrait) return null;
      
      const radius = getNodeRadius(id);
      
      return (
        <clipPath key={`clip-${id}`} id={`clip-${id}`}>
          <circle r={radius - 3} />
        </clipPath>
      );
    });
  };

  // 渲染箭头标记
  const renderArrowMarkers = () => {
    return Object.entries(relationshipConfig).map(([type, config]) => (
      <marker
        key={`arrow-${type}`}
        id={`arrow-${type}`}
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="5"
        orient="auto"
      >
        <path d="M0 0 L10 5 L0 10 Z" fill={config.color} opacity="0.85" />
      </marker>
    ));
  };
  
  return (
    <div className="relationship-network-overlay" onClick={handleBackgroundClick}>
      <div className="relationship-network-panel" onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="network-header">
          <h2 className="network-title">俄罗斯音乐家关系网</h2>
          <button className="network-close-btn" onClick={onClose} title="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        {/* SVG画布 */}
        <svg
          ref={svgRef}
          className="network-svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 定义 */}
          <defs>
            {renderClipPaths()}
            {renderArrowMarkers()}
          </defs>
          
          {/* 阵营背景区域 */}
          {Object.entries(factionLayouts).map(([faction, layout]) => (
            <circle
              key={`bg-${faction}`}
              cx={layout.center[0]}
              cy={layout.center[1]}
              r={layout.radius * 0.75}
              fill={factionConfig[faction].color}
              opacity="0.03"
              stroke={factionConfig[faction].color}
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.08"
            />
          ))}
          
          {/* 关系线 */}
          {renderLines()}
          
          {/* 节点 */}
          {renderNodes()}
          
          {/* Tooltip */}
          {hoveredLine && (
            <g className="network-tooltip" transform={`translate(600, 380)`}>
              <rect
                x="-80"
                y="-20"
                width="160"
                height="40"
                rx="6"
                fill="#141B2D"
                stroke={relationshipConfig[hoveredLine.type].color}
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                textAnchor="middle"
                y="-5"
                fill={relationshipConfig[hoveredLine.type].color}
                fontSize="10"
                fontWeight="600"
              >
                [{relationshipConfig[hoveredLine.type].label}]
              </text>
              <text
                textAnchor="middle"
                y="10"
                fill="#F5F5F5"
                fontSize="11"
              >
                {hoveredLine.label}
              </text>
            </g>
          )}
        </svg>
        
        {/* 图例 */}
        <div className="network-legend">
          <div className="legend-title">阵营图例</div>
          {Object.entries(factionConfig).map(([faction, config]) => (
            <div key={faction} className="legend-item">
              <span className="legend-dot" style={{ background: config.color }} />
              <span className="legend-text">{config.name}</span>
            </div>
          ))}
          <div className="legend-divider" />
          <div className="legend-title">关系图例</div>
          {Object.entries(relationshipConfig).map(([type, config]) => (
            <div key={type} className="legend-item">
              <span
                className="legend-line"
                style={{
                  background: config.color,
                  backgroundImage: config.pattern === 'dashed' 
                    ? 'linear-gradient(90deg, transparent 50%, #141B2D 50%)'
                    : config.pattern === 'dotted'
                    ? 'linear-gradient(90deg, transparent 30%, #141B2D 30%)'
                    : 'none',
                  backgroundSize: config.pattern !== 'solid' ? '8px 2px' : 'auto',
                }}
              />
              <span className="legend-text">{config.label}</span>
            </div>
          ))}
        </div>
        
        {/* 操作提示 */}
        <div className="network-hint">
          <span>拖动节点调整位置 · 点击节点展开关系 · 点击空白处取消选择</span>
        </div>
      </div>
    </div>
  );
}
