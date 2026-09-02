'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { composers } from '../../data/composers';
import { relationships } from '../../data/relationships';
export default function ComposerDetail({ params }) {
  const [detail, setDetail] = useState(null);
  const [composer, setComposer] = useState(null);
  const [relatedComposers, setRelatedComposers] = useState([]);
  const [loading, setLoading] = useState(true);
  const slug = params.slug;
  useEffect(() => {
    const basic = composers.find(c => c.id === slug);
    setComposer(basic);
    fetch('/data/composer-details.json').then(r => r.json()).then(data => { setDetail(data.composers?.[slug]); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);
  useEffect(() => {
    if (!slug) return;
    const related = relationships.filter(r => r.from === slug || r.to === slug).map(r => { const other = composers.find(c => c.id === (r.from === slug ? r.to : r.from)); return other ? {...other, relationType: r.type} : null; }).filter(Boolean);
    setRelatedComposers(related);
  }, [slug]);
  if (loading) return <div className="p-20 text-center">加载中...</div>;
  if (!composer) return <div className="p-20 text-center"><h2>未找到</h2><Link href="/music-history/composers">返回</Link></div>;
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4"><Link href="/">← 返回</Link> | <Link href="/music-history/composers">作曲家</Link> | <span>{detail?.name_zh || composer.name}</span></header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">{detail?.name_zh || composer.name}</h1>
        <p className="text-gray-600 mb-4">{composer.nameRu} ({composer.birthYear}–{composer.deathYear})</p>
        <p className="text-gray-700">{detail?.bio_zh || composer.description}</p>
        {relatedComposers.length > 0 && <div className="mt-8"><h2 className="text-xl font-bold mb-4">相关作曲家</h2><div className="grid grid-cols-4 gap-4">{relatedComposers.slice(0,8).map(r => <Link key={r.id} href={"/composers/"+r.id} className="bg-white p-4 rounded shadow hover:shadow-md">{r.name}</Link>)}</div></div>}
      </main>
    </div>
  );
}
