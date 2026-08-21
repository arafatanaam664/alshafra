import { useEffect, useMemo, useState } from 'react';
import { CatalogSearchProvider, type SearchDocument, type SearchHit } from '@alshafra/search';

function readQuery(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q') || '';
}

export default function SearchIsland() {
  const [q, setQ] = useState('');
  const [docs, setDocs] = useState<SearchDocument[] | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const provider = useMemo(() => (docs ? new CatalogSearchProvider(docs) : null), [docs]);

  useEffect(() => {
    setQ(readQuery());
    fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('index');
        return res.json() as Promise<{ documents: SearchDocument[] }>;
      })
      .then((data) => setDocs(data.documents || []))
      .catch(() => setError('تعذر تحميل فهرس البحث.'));
  }, []);

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;
    (async () => {
      const result = await provider.search({ q });
      const suggest = await provider.suggest(q);
      if (cancelled) return;
      setHits(result.hits);
      setTotal(result.total);
      setSuggestions(suggest);
    })();
    return () => {
      cancelled = true;
    };
  }, [provider, q]);

  return (
    <div>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" action="/search" method="get" role="search">
        <label className="sr-only" htmlFor="search-q">
          ابحث في Alshafra
        </label>
        <input
          id="search-q"
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="w-full rounded-xl bg-sand-50 px-3 py-2.5 text-sm text-brand-900 ring-1 ring-brand-200 focus:ring-2 focus:ring-brand-500"
          placeholder="مثال: تحويل التاريخ، أم القرى، الرواتب"
          maxLength={80}
          autoComplete="off"
        />
        <button className="btn-primary shrink-0" type="submit">
          بحث
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {!q && suggestions.length > 0 && (
        <p className="mt-4 text-sm text-brand-700/80">
          اقتراحات:{' '}
          {suggestions.map((item) => (
            <a key={item} className="ml-2 underline" href={`/search?q=${encodeURIComponent(item)}`}>
              {item}
            </a>
          ))}
        </p>
      )}

      {q && (
        <p className="mt-4 text-sm text-brand-700/80">
          {total} نتيجة لـ «{q}»
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {hits.map((hit) => (
          <li key={hit.path} className="card p-4">
            <a className="font-display font-bold text-brand-900 hover:underline" href={hit.path}>
              {hit.title}
            </a>
            {hit.description && <p className="mt-1 text-sm text-brand-700/80">{hit.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
