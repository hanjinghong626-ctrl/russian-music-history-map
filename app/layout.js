import './globals.css';

export const metadata = {
  title: '斯拉夫之魂 — 俄罗斯音乐史交互地图',
  description: '沉浸式探索俄罗斯音乐史：50位作曲家、城市浮雕地图、学派传承、关系网络。从格林卡到肖斯塔科维奇，用指尖触摸三百年的音乐灵魂。',
  keywords: '俄罗斯音乐, 音乐史, 交互地图, 作曲家, 柴可夫斯基, 肖斯塔科维奇, 强力集团',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
