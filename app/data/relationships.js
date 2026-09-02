// 俄罗斯作曲家关系数据
// 基于《俄罗斯音乐史纲》《西方音乐通史》《世界名曲欣赏》等知识库资料构建
// type: mentor=师承, influence=影响, collaboration=合作, opposition=对立

export const relationships = [
  // ===== 格林卡影响线 =====
  { from: 'glinka', to: 'dargomyzhsky', type: 'influence', label: '民族音乐影响' },
  { from: 'glinka', to: 'balakirev', type: 'influence', label: '格林卡精神传承' },
  { from: 'glinka', to: 'tchaikovsky', type: 'influence', label: '民族音乐影响' },
  { from: 'glinka', to: 'mussorgsky', type: 'influence', label: '民族音乐传统' },
  { from: 'glinka', to: 'borodin', type: 'influence', label: '民族音乐传统' },
  { from: 'glinka', to: 'rimsky_korsakov', type: 'influence', label: '民族音乐+东方主义' },

  // ===== 达戈梅日斯基 =====
  { from: 'dargomyzhsky', to: 'mussorgsky', type: 'influence', label: '朗诵调手法' },
  { from: 'dargomyzhsky', to: 'rimsky_korsakov', type: 'influence', label: '朗诵调传统' },

  // ===== 强力集团 - 巴拉基列夫 =====
  { from: 'balakirev', to: 'mussorgsky', type: 'mentor', label: '师承指导' },
  { from: 'balakirev', to: 'borodin', type: 'mentor', label: '师承指导' },
  { from: 'balakirev', to: 'rimsky_korsakov', type: 'mentor', label: '师承指导' },
  { from: 'balakirev', to: 'cui', type: 'mentor', label: '师承指导' },
  { from: 'balakirev', to: 'tchaikovsky', type: 'influence', label: '两度折服(1868/1882)' },

  // ===== 鲁宾斯坦兄弟 =====
  { from: 'anton_rubinstein', to: 'tchaikovsky', type: 'mentor', label: '圣彼得堡音乐学院师承' },
  { from: 'nikolai_rubinstein', to: 'tchaikovsky', type: 'collaboration', label: '莫斯科音乐学院同事' },

  // ===== 里姆斯基-科萨科夫 =====
  { from: 'rimsky_korsakov', to: 'glazunov', type: 'mentor', label: '师承' },
  { from: 'rimsky_korsakov', to: 'stravinsky', type: 'mentor', label: '师承' },
  { from: 'rimsky_korsakov', to: 'lyadov', type: 'mentor', label: '师承' },
  { from: 'rimsky_korsakov', to: 'prokofiev', type: 'influence', label: '配器影响' },
  { from: 'rimsky_korsakov', to: 'mussorgsky', type: 'collaboration', label: '修改配器' },
  { from: 'rimsky_korsakov', to: 'borodin', type: 'collaboration', label: '续写《伊戈尔王》' },

  // ===== 伊戈尔王续写 =====
  { from: 'glazunov', to: 'borodin', type: 'collaboration', label: '续写《伊戈尔王》' },

  // ===== 石客续写 =====
  { from: 'cui', to: 'dargomyzhsky', type: 'collaboration', label: '续写《石客》' },
  { from: 'rimsky_korsakov', to: 'dargomyzhsky', type: 'collaboration', label: '续写《石客》' },

  // ===== 柴可夫斯基 =====
  { from: 'tchaikovsky', to: 'rakhmaninov', type: 'influence', label: '浪漫主义影响' },
  { from: 'tchaikovsky', to: 'arensky', type: 'mentor', label: '莫斯科音乐学院师承' },
  { from: 'tchaikovsky', to: 'taneev', type: 'mentor', label: '莫斯科音乐学院师承' },
  { from: 'tchaikovsky', to: 'shostakovich', type: 'influence', label: '交响曲传统' },
  { from: 'tchaikovsky', to: 'scriabin', type: 'influence', label: '浪漫主义影响' },

  // ===== 阿连斯基 =====
  { from: 'arensky', to: 'rakhmaninov', type: 'mentor', label: '师承' },

  // ===== 塔涅耶夫 =====
  { from: 'taneev', to: 'rakhmaninov', type: 'influence', label: '对位法影响' },
  { from: 'taneev', to: 'scriabin', type: 'influence', label: '对位法影响' },

  // ===== 格拉祖诺夫 =====
  { from: 'rimsky_korsakov', to: 'scriabin', type: 'influence', label: '早期影响' },
  { from: 'glazunov', to: 'shostakovich', type: 'mentor', label: '师承' },
  { from: 'glazunov', to: 'myaskovsky', type: 'influence', label: '交响传统' },
  { from: 'glazunov', to: 'prokofiev', type: 'mentor', label: '彼得堡音乐学院师承' },

  // ===== 米亚斯科夫斯基 =====
  { from: 'myaskovsky', to: 'shostakovich', type: 'mentor', label: '师承' },

  // ===== 穆索尔斯基 =====
  { from: 'mussorgsky', to: 'shostakovich', type: 'influence', label: '现实主义影响' },

  // ===== 斯特拉文斯基 =====
  { from: 'stravinsky', to: 'prokofiev', type: 'influence', label: '新古典主义影响' },

  // ===== 利亚多夫 =====
  { from: 'lyadov', to: 'prokofiev', type: 'mentor', label: '师承' },

  // ===== 肖斯塔科维奇 =====
  { from: 'shostakovich', to: 'kabalevsky', type: 'influence', label: '苏联音乐传统' },
  { from: 'shostakovich', to: 'shnitke', type: 'influence', label: '多风格影响' },

  // ===== 施尼特凯 =====
  { from: 'prokofiev', to: 'shnitke', type: 'influence', label: '新古典主义影响' },
  { from: 'stravinsky', to: 'shnitke', type: 'influence', label: '多风格影响' },

  // ===== 哈恰图良 =====
  { from: 'khachaturian', to: 'shostakovich', type: 'influence', label: '苏联交响传统' },

  // ===== 对立关系 =====
  { from: 'balakirev', to: 'anton_rubinstein', type: 'opposition', label: '民族主义vs学院派' },
  { from: 'cui', to: 'anton_rubinstein', type: 'opposition', label: '批评攻击' },
];

// 关系类型配置
export const relationshipConfig = {
  mentor: {
    color: '#D4AF37',
    label: '师承',
    pattern: 'solid', // solid dashed dotted
    arrow: true,
  },
  influence: {
    color: '#888888',
    label: '影响',
    pattern: 'dashed',
    arrow: true,
  },
  collaboration: {
    color: '#4A90D9',
    label: '合作',
    pattern: 'dotted',
    arrow: false,
  },
  opposition: {
    color: '#FF4444',
    label: '对立',
    pattern: 'dashed',
    arrow: false,
  },
};
