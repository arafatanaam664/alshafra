import { useEffect, useState } from 'react';

export default function CountdownIsland({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(`${iso}T00:00:00+03:00`).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return (
    <div className="my-4 grid grid-cols-3 gap-3 text-center">
      <div className="card p-3"><div className="stat-num text-brand-700">{days}</div><div className="text-xs">يوم</div></div>
      <div className="card p-3"><div className="stat-num text-brand-700">{hours}</div><div className="text-xs">ساعة</div></div>
      <div className="card p-3"><div className="stat-num text-brand-700">{mins}</div><div className="text-xs">دقيقة</div></div>
    </div>
  );
}
