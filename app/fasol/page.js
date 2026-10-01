'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FasolPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <main
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 800px at 70% -10%, rgba(88,124,176,0.25), transparent 60%), radial-gradient(900px 700px at 10% 110%, rgba(90,150,138,0.18), transparent 60%), #070b16',
      }}
    >
      {/* 顶部导航 */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-sm tracking-widest text-slate-300/80 transition hover:text-white"
        >
          ← 返回星图
        </Link>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400/70">
          FASOL · 寻找失踪的音符
        </span>
      </header>

      {/* 标题区 */}
      <section className="relative z-10 px-6 pt-1 text-center">
        <h1
          className="text-xl font-semibold text-slate-100 sm:text-2xl"
          style={{ textShadow: '0 0 30px rgba(140,180,230,0.35)' }}
        >
          В поисках пропавших нот
        </h1>
        <p className="mt-1.5 text-xs text-slate-400 sm:text-sm">
          俄罗斯音乐学院跑酷音游 · 沿音符穿越格林卡、柴可夫斯基与肖斯塔科维奇
        </p>
      </section>

      {/* 游戏容器 */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-4 py-5">
        <div
          className="relative flex overflow-hidden rounded-2xl border border-white/10"
          style={{
            width: 'min(430px, calc((100vh - 220px) * 0.6094), 92vw)',
            height: 'min(calc(430px * 1.641), calc(100vh - 220px), calc(92vw * 1.641))',
            background: '#000',
            boxShadow:
              '0 0 60px rgba(90,130,190,0.25), inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {!loaded && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
              <span className="text-sm tracking-widest">Загрузка… 加载中</span>
            </div>
          )}
          <iframe
            src="/fasol/index.html"
            title="FASOL — 寻找失踪的音符"
            onLoad={() => setLoaded(true)}
            className="flex-none border-0"
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            allow="autoplay; fullscreen; gamepad"
          />
        </div>
      </section>

      <footer className="relative z-10 pb-5 text-center text-[11px] text-slate-500">
        建议竖屏体验 · 音源与画面均已本地化托管，可离线访问
      </footer>
    </main>
  );
}
