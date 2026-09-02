'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './glossary.css';

export default function GlossaryPage() {
  const [data, setData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list' | 'table'
  const [qualityFilter, setQualityFilter] = useState(null); // null | 'expert' | 'full' | 'detailed' | 'brief'
  const mainRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/data/encyclopedia_unified.json');
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        setData(json);
        setEntries(json.entries || []);
      } catch (e) {
        console.error('Failed to load encyclopedia:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedCategory) {
      result = result.filter(e => e.category_zh === selectedCategory);
    }
    if (qualityFilter) {
      result = result.filter(e => e.quality === qualityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(e =>
        e.ru.toLowerCase().includes(q) ||
        e.zh.toLowerCase().includes(q) ||
        e.definition_zh.toLowerCase().includes(q) ||
        (e.definition_ru && e.definition_ru.toLowerCase().includes(q))
      );
    }
    return result;
  }, [entries, searchQuery, selectedCategory, qualityFilter]);

  // Entry lookup map
  const getEntryById = useMemo(() => {
    const map = {};
    entries.forEach(e => { map[e.id] = e; });
    return map;
  }, [entries]);

  // Quality stats
  const qualityStats = useMemo(() => {
    const s = { expert: 0, full: 0, detailed: 0, brief: 0 };
    entries.forEach(e => { if (s[e.quality] !== undefined) s[e.quality]++; });
    return s;
  }, [entries]);

  // Navigate to entry (cross-view interaction)
  const navigateToEntry = useCallback((entryId) => {
    const entry = getEntryById[entryId];
    if (!entry) return;
    // Switch to card view for detail
    setViewMode('card');
    setActiveEntry(entry);
    // Scroll after state update
    setTimeout(() => {
      const el = document.getElementById(`entry-${entryId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 2000);
      }
    }, 100);
  }, [getEntryById]);

  const handleCrossRefClick = useCallback((entryId) => {
    navigateToEntry(entryId);
  }, [navigateToEntry]);

  const handleEntryClick = useCallback((entry) => {
    setActiveEntry(entry);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActiveEntry(null);
  }, []);

  // Table row click
  const handleTableEntryClick = useCallback((entry) => {
    setActiveEntry(entry);
  }, []);


  // Group filtered entries by category for table view
  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredEntries.forEach(e => {
      const cat = e.category_zh;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(e);
    });
    return groups;
  }, [filteredEntries]);

  if (loading) {
    return (
      <div className="glossary-loading">
        <div className="loading-spinner"></div>
        <p>正在加载知识库...</p>
      </div>
    );
  }

  const categoryTree = data?.category_tree || {};
  const categoryGroups = data?.category_groups || [];
  const stats = data?.stats || {};
  const hasRussianDef = (e) => e.definition_ru && e.definition_ru.length > 0;
  const hasCrossRefs = (e) => e.cross_refs && e.cross_refs.length > 0;

  return (
    <div className="glossary-page">
      {/* Header */}
      <header className="glossary-header">
        <div className="header-left">
          <a href="/" className="back-link">← 返回首页</a>
          <div className="header-title">
            <h1>俄罗斯音乐知识库</h1>
            <p className="header-subtitle">Энциклопедия русской музыки · 百科 + 术语库</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-num">{entries.length}</span>
            <span className="stat-label">词条</span>
          </div>
          <div className="stat-badge">
            <span className="stat-num">{Object.keys(categoryTree).length}</span>
            <span className="stat-label">分类</span>
          </div>
          <div className="stat-badge">
            <span className="stat-num">{stats.cross_references?.entries_with_refs || 0}</span>
            <span className="stat-label">交叉引用</span>
          </div>
        </div>
      </header>

      <div className="glossary-body">
        {/* Left sidebar */}
        <aside className="glossary-sidebar">
          {/* Search */}
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="搜索术语（中/俄）..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Quality filter */}
          <div className="quality-filter-section">
            <h3 className="section-title">内容深度</h3>
            <div className="quality-filters">
              <button
                className={`qf-btn ${!qualityFilter ? 'active' : ''}`}
                onClick={() => setQualityFilter(null)}
              >
                全部 <span>{entries.length}</span>
              </button>
              <button
                className={`qf-btn qf-expert ${qualityFilter === 'expert' ? 'active' : ''}`}
                onClick={() => setQualityFilter(qualityFilter === 'expert' ? null : 'expert')}
              >
                专家级 <span>{qualityStats.expert}</span>
              </button>
              <button
                className={`qf-btn qf-full ${qualityFilter === 'full' ? 'active' : ''}`}
                onClick={() => setQualityFilter(qualityFilter === 'full' ? null : 'full')}
              >
                完整 <span>{qualityStats.full}</span>
              </button>
              <button
                className={`qf-btn qf-detailed ${qualityFilter === 'detailed' ? 'active' : ''}`}
                onClick={() => setQualityFilter(qualityFilter === 'detailed' ? null : 'detailed')}
              >
                详细 <span>{qualityStats.detailed}</span>
              </button>
              <button
                className={`qf-btn qf-brief ${qualityFilter === 'brief' ? 'active' : ''}`}
                onClick={() => setQualityFilter(qualityFilter === 'brief' ? null : 'brief')}
              >
                基础 <span>{qualityStats.brief}</span>
              </button>
            </div>
          </div>

          {/* Category navigation */}
          <div className="category-section">
            <h3 className="section-title">分类导航</h3>
            <button
              className={`group-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(null); setSelectedGroup(null); }}
            >
              全部词条
              <span className="count">{entries.length}</span>
            </button>

            {categoryGroups.map((group, gi) => (
              <div key={gi} className="category-group">
                <button
                  className={`group-header ${selectedGroup === group.group ? 'expanded' : ''}`}
                  onClick={() => setSelectedGroup(selectedGroup === group.group ? null : group.group)}
                >
                  <span className="group-icon">{group.icon}</span>
                  <span className="group-name">{group.group}</span>
                  <span className="group-count">{group.total_entries}</span>
                </button>
                {selectedGroup === group.group && (
                  <div className="group-categories">
                    {group.categories.map((cat, ci) => {
                      const treeEntry = categoryTree[cat];
                      return (
                        <button
                          key={ci}
                          className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                          {cat}
                          <span className="count">{treeEntry?.count || 0}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Learning paths */}
          {data?.learning_paths && (
            <div className="learning-section">
              <h3 className="section-title">学习路径</h3>
              <p className="section-hint">按分类推荐由浅入深的阅读顺序</p>
              <select
                className="path-select"
                onChange={(e) => {
                  const cat = e.target.value;
                  if (cat) setSelectedCategory(cat);
                }}
                defaultValue=""
              >
                <option value="" disabled>选择分类查看</option>
                {Object.keys(data.learning_paths).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="glossary-main" ref={mainRef}>
          {/* Toolbar with view mode switch */}
          <div className="main-toolbar">
            <span className="result-count">
              {selectedCategory ? `${selectedCategory} · ` : ''}
              {filteredEntries.length} 条
              {searchQuery && ` · 搜索"${searchQuery}"`}
            </span>
            <div className="toolbar-right">
              {/* View mode tabs */}
              <div className="view-tabs">
                <button
                  className={`view-tab ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => setViewMode('card')}
                  title="百科视图：卡片展示完整释义"
                >
                  📖 百科
                </button>
                <button
                  className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="术语表视图：紧凑表格快速查阅"
                >
                  📋 术语表
                </button>
                <button
                  className={`view-tab ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="列表视图：简洁列表"
                >
                  📝 列表
                </button>
              </div>
            </div>
          </div>

          {/* View mode descriptions */}
          {viewMode === 'card' && (
            <div className="view-hint">
              💡 百科视图 — 点击词条查看完整释义，通过<span className="hint-link">相关术语</span>标签跳转关联知识
            </div>
          )}
          {viewMode === 'table' && (
            <div className="view-hint">
              💡 术语表视图 — 紧凑表格快速查阅，点击任意行打开详情，点击分类标签可筛选
            </div>
          )}
          {viewMode === 'list' && (
            <div className="view-hint">
              💡 列表视图 — 简洁展示所有词条，适合快速浏览
            </div>
          )}

          {/* ===== CARD VIEW (百科) ===== */}
          {viewMode === 'card' && (
            <div className="entries-container card">
              {filteredEntries.length === 0 ? (
                <div className="no-results">
                  <p>未找到匹配的词条</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); setQualityFilter(null); }}>
                    清除筛选
                  </button>
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div
                    key={entry.id}
                    id={`entry-${entry.id}`}
                    className={`entry-card quality-${entry.quality} ${activeEntry?.id === entry.id ? 'active' : ''}`}
                    onClick={() => handleEntryClick(entry)}
                  >
                    <div className="entry-header">
                      <span className="entry-ru">{entry.ru}</span>
                      <span className="entry-zh">{entry.zh}</span>
                      <span className={`quality-badge quality-${entry.quality}`}>
                        {entry.quality === 'expert' ? '专家' :
                         entry.quality === 'full' ? '完整' :
                         entry.quality === 'detailed' ? '详细' : '基础'}
                      </span>
                    </div>
                    <div className="entry-category">{entry.category_zh}</div>
                    <div className="entry-definition">
                      {entry.definition_zh.length > 200
                        ? entry.definition_zh.slice(0, 200) + '...'
                        : entry.definition_zh}
                      {entry.definition_zh.length > 200 && (
                        <button className="read-more" onClick={(e) => { e.stopPropagation(); handleEntryClick(entry); }}>
                          展开全文
                        </button>
                      )}
                    </div>

                    {/* Cross references */}
                    {hasCrossRefs(entry) && (
                      <div className="cross-refs">
                        <span className="refs-label">🔗 相关术语：</span>
                        <div className="refs-tags">
                          {entry.cross_refs.slice(0, 6).map(refId => {
                            const refEntry = getEntryById[refId];
                            if (!refEntry) return null;
                            return (
                              <button
                                key={refId}
                                className="ref-tag"
                                onClick={(e) => { e.stopPropagation(); handleCrossRefClick(refId); }}
                              >
                                {refEntry.zh}
                              </button>
                            );
                          })}
                          {entry.cross_refs.length > 6 && (
                            <span className="ref-more">+{entry.cross_refs.length - 6}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {hasRussianDef(entry) && (
                      <div className="entry-ru-def">
                        <span className="ru-label">RU:</span>
                        <span className="ru-text">
                          {entry.definition_ru.length > 100
                            ? entry.definition_ru.slice(0, 100) + '...'
                            : entry.definition_ru}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== TABLE VIEW (术语表) ===== */}
          {viewMode === 'table' && (
            <div className="table-view">
              {Object.keys(groupedByCategory).length === 0 ? (
                <div className="no-results">
                  <p>未找到匹配的词条</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); setQualityFilter(null); }}>
                    清除筛选
                  </button>
                </div>
              ) : (
                Object.entries(groupedByCategory).map(([cat, catEntries]) => (
                  <div key={cat} className="table-group">
                    <div className="table-group-header">
                      <h3>{cat}</h3>
                      <span className="table-group-count">{catEntries.length} 条</span>
                    </div>
                    <table className="glossary-table">
                      <thead>
                        <tr>
                          <th className="col-ru">РУССКИЙ</th>
                          <th className="col-zh">中文</th>
                          <th className="col-quality">深度</th>
                          <th className="col-refs">关联</th>
                          <th className="col-ru-def">俄语释义</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catEntries.map(entry => (
                          <tr
                            key={entry.id}
                            id={`table-entry-${entry.id}`}
                            className={`table-row quality-${entry.quality} ${activeEntry?.id === entry.id ? 'active' : ''}`}
                            onClick={() => handleTableEntryClick(entry)}
                          >
                            <td className="col-ru">{entry.ru}</td>
                            <td className="col-zh">{entry.zh}</td>
                            <td className="col-quality">
                              <span className={`quality-dot quality-${entry.quality}`}></span>
                            </td>
                            <td className="col-refs">
                              {hasCrossRefs(entry) && (
                                <div className="table-refs">
                                  {entry.cross_refs.slice(0, 3).map(refId => {
                                    const refEntry = getEntryById[refId];
                                    if (!refEntry) return null;
                                    return (
                                      <button
                                        key={refId}
                                        className="table-ref-tag"
                                        onClick={(e) => { e.stopPropagation(); handleCrossRefClick(refId); }}
                                        title={refEntry.ru}
                                      >
                                        {refEntry.zh}
                                      </button>
                                    );
                                  })}
                                  {entry.cross_refs.length > 3 && (
                                    <span className="table-ref-more">+{entry.cross_refs.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="col-ru-def">
                              {hasRussianDef(entry) ? (
                                <span className="ru-preview">
                                  {entry.definition_ru.length > 60
                                    ? entry.definition_ru.slice(0, 60) + '…'
                                    : entry.definition_ru}
                                </span>
                              ) : (
                                <span className="no-data">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===== LIST VIEW ===== */}
          {viewMode === 'list' && (
            <div className="entries-container list">
              {filteredEntries.length === 0 ? (
                <div className="no-results">
                  <p>未找到匹配的词条</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); setQualityFilter(null); }}>
                    清除筛选
                  </button>
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div
                    key={entry.id}
                    id={`entry-${entry.id}`}
                    className={`list-item quality-${entry.quality} ${activeEntry?.id === entry.id ? 'active' : ''}`}
                    onClick={() => handleEntryClick(entry)}
                  >
                    <span className="list-ru">{entry.ru}</span>
                    <span className="list-zh">{entry.zh}</span>
                    <span className="list-cat">{entry.category_zh}</span>
                    <span className={`quality-dot quality-${entry.quality}`}></span>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detail panel */}
      {activeEntry && (
        <div className="detail-overlay" onClick={handleCloseDetail}>
          <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
            <button className="detail-close" onClick={handleCloseDetail}>✕</button>

            <div className="detail-header">
              <h2 className="detail-ru">{activeEntry.ru}</h2>
              <h3 className="detail-zh">{activeEntry.zh}</h3>
              <div className="detail-meta">
                <button
                  className="detail-category-btn"
                  onClick={() => { setSelectedCategory(activeEntry.category_zh); handleCloseDetail(); }}
                >
                  {activeEntry.category_zh}
                </button>
                <span className={`quality-badge quality-${activeEntry.quality}`}>
                  {activeEntry.quality === 'expert' ? '专家级' :
                   activeEntry.quality === 'full' ? '完整' :
                   activeEntry.quality === 'detailed' ? '详细' : '基础'}
                </span>
              </div>
            </div>

            <div className="detail-body">
              <div className="detail-section">
                <h4>中文释义</h4>
                <p className="detail-definition">{activeEntry.definition_zh}</p>
              </div>

              {hasRussianDef(activeEntry) && (
                <div className="detail-section">
                  <h4>俄语原文</h4>
                  <p className="detail-ru-text">{activeEntry.definition_ru}</p>
                </div>
              )}

              {hasCrossRefs(activeEntry) && (
                <div className="detail-section">
                  <h4>相关术语 ({activeEntry.cross_refs.length})</h4>
                  <div className="detail-refs">
                    {activeEntry.cross_refs.map(refId => {
                      const refEntry = getEntryById[refId];
                      if (!refEntry) return null;
                      return (
                        <button
                          key={refId}
                          className="detail-ref-btn"
                          onClick={() => navigateToEntry(refId)}
                        >
                          <span className="ref-ru">{refEntry.ru}</span>
                          <span className="ref-zh">{refEntry.zh}</span>
                          <span className="ref-cat">{refEntry.category_zh}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeEntry.back_refs && activeEntry.back_refs.length > 0 && (
                <div className="detail-section">
                  <h4>被以下术语引用 ({activeEntry.back_refs.length})</h4>
                  <div className="detail-refs">
                    {activeEntry.back_refs.map(refId => {
                      const refEntry = getEntryById[refId];
                      if (!refEntry) return null;
                      return (
                        <button
                          key={refId}
                          className="detail-ref-btn back-ref"
                          onClick={() => navigateToEntry(refId)}
                        >
                          <span className="ref-ru">{refEntry.ru}</span>
                          <span className="ref-zh">{refEntry.zh}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
