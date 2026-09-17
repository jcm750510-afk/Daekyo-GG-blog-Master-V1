import { useEffect, useMemo, useState } from 'react';

type Notice = {
  institution?: string;
  title: string;
  date?: string;
  type?: string;
  url: string;
  matchedKeywords?: string[];
};

const DATA_URL = './data/public-notices.json';

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('ko-KR');
}

export default function PublicNoticePanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${DATA_URL}?t=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error('수집 결과 파일을 불러오지 못했습니다.');
        return r.json();
      })
      .then((data) => {
        if (!active) return;
        setNotices(Array.isArray(data.notices) ? data.notices : []);
        setUpdatedAt(data.updatedAt || '');
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter((n) => `${n.institution || ''} ${n.title} ${(n.matchedKeywords || []).join(' ')}`.toLowerCase().includes(q));
  }, [keyword, notices]);

  return (
    <section className="border-b border-slate-200 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-wide text-slate-300">PUBLIC NOTICE CRAWLER</div>
            <h2 className="mt-1 text-lg font-bold">최근 1주일 공공기관 공고·고시</h2>
            <p className="mt-1 text-xs text-slate-300">웹 크롤러 레포의 원칙을 적용해 수집된 결과를 표시합니다. 기준: 최근 7일</p>
          </div>
          <div className="text-right text-xs text-slate-300">
            <div>{updatedAt ? `최근 갱신 ${formatDate(updatedAt)}` : '자동 수집 결과'}</div>
            <div className="mt-1">{filtered.length}건</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="기관명·공고명·키워드 검색" className="min-w-[260px] flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-400" />
          <button onClick={() => window.location.reload()} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900">새로고침</button>
        </div>

        {loading && <div className="mt-4 rounded-xl bg-slate-800 p-4 text-sm text-slate-300">최근 공고 데이터를 불러오는 중입니다.</div>}
        {error && <div className="mt-4 rounded-xl bg-red-950 p-4 text-sm text-red-200">{error} · GitHub Actions 수집이 아직 실행되지 않았을 수 있습니다.</div>}
        {!loading && !error && filtered.length === 0 && <div className="mt-4 rounded-xl bg-slate-800 p-4 text-sm text-slate-300">최근 7일 조건에 맞는 공고가 없습니다.</div>}

        {filtered.length > 0 && (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {filtered.slice(0, 20).map((n, i) => (
              <a key={`${n.url}-${i}`} href={n.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 bg-slate-800 p-4 transition hover:border-slate-400">
                <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400"><span>{n.institution || '공공기관'}</span><span>{formatDate(n.date)}</span></div>
                <div className="mt-1 text-sm font-semibold leading-6">{n.title}</div>
                {(n.matchedKeywords || []).length > 0 && <div className="mt-2 text-[11px] text-slate-300">키워드: {(n.matchedKeywords || []).join(', ')}</div>}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
