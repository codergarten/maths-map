import { scoreSession } from '../scoring';
import { downloadResultsCsv } from '../exportCsv';
import type { Profile, Session } from '../types';

function TrendChart({ points }: { points: number[] }) {
  const W = 640, H = 180, PAD = 28;
  if (points.length === 0) return null;
  const xs = points.map((_, i) => (points.length === 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (points.length - 1)));
  const ys = points.map((p) => H - PAD - (Math.max(0, Math.min(100, p)) / 100) * (H - 2 * PAD));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${H - PAD} L${xs[0].toFixed(1)},${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Overall percentage over time" style={{ width: '100%', height: 'auto' }}>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = H - PAD - (v / 100) * (H - 2 * PAD);
        return (<g key={v}><line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#e5e1d8" strokeDasharray="3 4" /><text x={4} y={y + 4} fontSize="10" fill="#9ca3af">{v}</text></g>);
      })}
      <path d={area} fill="#0e7490" opacity="0.12" />
      <path d={path} fill="none" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="5" fill="#ea580c" stroke="#fff" strokeWidth="2" />
          <text x={x} y={ys[i] - 10} fontSize="11" fontWeight="800" fill="#155e75" textAnchor="middle">{points[i]}%</text>
        </g>
      ))}
    </svg>
  );
}

export default function HistoryScreen({
  profile,
  sessions,
  onBack,
}: {
  profile: Profile;
  sessions: Session[];
  onBack: () => void;
}) {
  const done = sessions
    .filter((s) => s.profileId === profile.id && s.completedAt)
    .slice()
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));

  const results = done.map((s) => scoreSession(s));
  const overallPoints = results.map((r) => r.overallPercent);
  const last = results[results.length - 1];
  const prev = results[results.length - 2];
  const delta = last && prev ? last.overallPercent - prev.overallPercent : null;

  return (
    <>
      <div className="card child-hero">
        <div className="avatar" style={{ background: profile.colour, fontSize: 40, width: 64, height: 64, lineHeight: '64px' }}>{profile.emoji}</div>
        <div>
          <h2 style={{ fontSize: 20 }}>{profile.name}&rsquo;s journey</h2>
          <div className="sub">Fixed assessment, same 75 questions every sitting — so the scores are directly comparable.</div>
        </div>
      </div>

      {done.length === 0 && (
        <div className="card">
          <strong>No completed check-ins yet.</strong>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>Once {profile.name} finishes a check-in, it shows up here with a trend line.</p>
        </div>
      )}

      {done.length > 0 && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong>Overall trend</strong>
              {delta !== null && (
                <span style={{ fontWeight: 900, color: delta >= 0 ? 'var(--secure)' : 'var(--emerging)' }}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last time
                </span>
              )}
            </div>
            <div style={{ marginTop: 10 }}><TrendChart points={overallPoints} /></div>
          </div>

          <div className="card">
            <strong>Strand comparison — latest vs last time</strong>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {last.strands.map((s) => {
                const p = prev?.strands.find((x) => x.id === s.id);
                const d = p ? s.percent - p.percent : null;
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ minWidth: 96, fontWeight: 700 }}>{s.name}</span>
                    <div className="strand-bar" style={{ flex: 1, margin: 0 }}><div style={{ width: `${s.percent}%` }} /></div>
                    <span style={{ fontWeight: 800, minWidth: 38 }}>{s.percent}%</span>
                    <span style={{ minWidth: 52, textAlign: 'right', fontWeight: 800, color: d === null ? 'var(--ink-soft)' : d >= 0 ? 'var(--secure)' : 'var(--emerging)' }}>
                      {d === null ? '—' : `${d >= 0 ? '+' : ''}${d}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <h2 className="section">Every sitting</h2>
          <div className="card flat" style={{ padding: '6px 14px' }}>
            {done.slice().reverse().map((s, i) => {
              const r = results[done.length - 1 - i];
              const prevR = results[done.length - 2 - i];
              const d = prevR ? r.overallPercent - prevR.overallPercent : null;
              return (
                <div key={s.id} className="session-row">
                  <div className="date">{new Date(s.completedAt!).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="meta">{r.secureCount} strong · {r.developingCount} developing · {r.emergingCount} needs work</div>
                  <div className="pct">{r.overallPercent}%{d !== null && <span style={{ fontSize: 11, color: d >= 0 ? 'var(--secure)' : 'var(--emerging)', marginLeft: 6 }}>{d >= 0 ? '▲' : '▼'}{Math.abs(d)}</span>}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button className="btn btn-ghost btn-block" onClick={downloadResultsCsv}>⬇️ Download all results (CSV)</button>
      <button className="btn btn-ghost btn-block" onClick={onBack}>← Back to {profile.name}</button>
    </>
  );
}
