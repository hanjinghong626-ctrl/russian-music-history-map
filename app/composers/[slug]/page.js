import { composers } from '../../data/composers';
export async function generateStaticParams() { return composers.map(c => ({ slug: c.id })); }
export default async function Page({ params }) { const { default: ComposerDetail } = await import('./ComposerDetail'); return <ComposerDetail params={params} />; }
