export default function ShareIsland({ url, title }: { url: string; title: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="mt-8 flex flex-wrap gap-2 text-sm">
      <button type="button" className="btn-ghost" onClick={copy}>نسخ الرابط</button>
      <a className="btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}>واتساب</a>
      <a className="btn-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}>تيليغرام</a>
    </div>
  );
}
