import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GUIDANCE, ITEMS, PROFICIENCY_LABEL, strandOfCode } from '../curriculum';
import { scoreSession } from '../scoring';
import type { Session } from '../types';
import type { Proficiency } from '../types';

export default function ResultScreen({
  sessionId,
  sessions,
  onDashboard,
  onDone,
}: {
  sessionId: string;
  sessions: Session[];
  onDashboard: () => void;
  onDone: () => void;
}) {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return <div className="card"><p>Session not found.</p><button className="btn btn-primary" onClick={onDone}>Done</button></div>;

  const result = scoreSession(session);

  useEffect(() => {
    const palette = ['#0e7490', '#ea580c', '#fbbf24', '#16a34a', '#ddd6fe'];
    let timers: number[] = [];
    if (result.overallPercent >= 80) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors: palette, scalar: 0.9 });
      timers.push(window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.25 }, colors: palette, scalar: 0.8, startVelocity: 35 }), 350));
    } else if (result.overallPercent >= 50) {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.3 }, colors: palette, scalar: 0.75 });
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const gaps = result.codeScores.filter((c) => c.status === 'emerging');
  const developing = result.codeScores.filter((c) => c.status === 'developing');
  const weakest = result.weakestProficiency ? PROFICIENCY_LABEL[result.weakestProficiency as Proficiency] : null;

  const dateStr = session.completedAt
    ? new Date(session.completedAt).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Today';

  return (
    <>
      <div className="card result-hero">
        <div className="big" aria-hidden="true">{result.overallPercent >= 80 ? '🌟' : result.overallPercent >= 50 ? '🧭' : '🌱'}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 1 }}>Check-in complete · {dateStr}</div>
        <div className="pct">{result.overallPercent}%</div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '2px 0 0' }}>Grow-ups use this to pick better practice games — it isn&rsquo;t school, it isn&rsquo;t a verdict.</p>
        <div style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '4px 0 12px' }}>across all 15 Level 1 content codes</div>
        <div className="coverage-row">
          <div className="coverage-chip"><div className="n" style={{ color: 'var(--secure)' }}>{result.secureCount}</div><div className="l">Strong</div></div>
          <div className="coverage-chip"><div className="n" style={{ color: 'var(--developing)' }}>{result.developingCount}</div><div className="l">Developing</div></div>
          <div className="coverage-chip"><div className="n" style={{ color: 'var(--emerging)' }}>{result.emergingCount}</div><div className="l">Needs work</div></div>
        </div>
        {weakest && (
          <p style={{ fontSize: 13, marginTop: 12 }}>
            Proficiency lens: weakest area so far is <strong>{weakest}</strong> — see the dashboard for the breakdown.
          </p>
        )}
      </div>

      <h2 className="section">Strand snapshot</h2>
      <div className="card flat" style={{ padding: '8px 16px' }}>
        {result.strands.map((s) => (
          <div key={s.id} className="strand-block">
            <div className="strand-head">
              <h3>{s.name}</h3>
              <span className="pct">{s.percent}%</span>
            </div>
            <div className="strand-bar"><div style={{ width: `${s.percent}%` }} /></div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {s.codes.map((c) => `${c.code.replace('VC2M1', 'VC2M1')} ${c.status === 'secure' ? '●' : c.status === 'developing' ? '◐' : '○'}`).join('   ')}
            </div>
          </div>
        ))}
      </div>

      {(gaps.length > 0 || developing.length > 0) && (
        <>
          <h2 className="section">Where to focus next</h2>
          {gaps.slice(0, 3).map((g) => (
            <div key={g.code} className="card" style={{ borderLeft: '6px solid var(--emerging)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--emerging)', textTransform: 'uppercase', letterSpacing: 1 }}>Needs work · {g.code}</div>
              <div style={{ fontWeight: 800, margin: '4px 0' }}>{GUIDANCE[g.code]?.plainWords}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}><b>Try this at home:</b> {GUIDANCE[g.code]?.activities[0]}</div>
            </div>
          ))}
          {gaps.length === 0 && developing.slice(0, 3).map((g) => (
            <div key={g.code} className="card" style={{ borderLeft: '6px solid var(--developing)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--developing)', textTransform: 'uppercase', letterSpacing: 1 }}>Developing · {g.code}</div>
              <div style={{ fontWeight: 800, margin: '4px 0' }}>{GUIDANCE[g.code]?.plainWords}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}><b>Try this at home:</b> {GUIDANCE[g.code]?.activities[0]}</div>
            </div>
          ))}
        </>
      )}

      {gaps.length === 0 && developing.length === 0 && (
        <div className="card" style={{ borderLeft: '6px solid var(--secure)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--secure)', textTransform: 'uppercase', letterSpacing: 1 }}>Level 1 looking strong</div>
          <div style={{ fontWeight: 800, marginTop: 4 }}>Every code came out Secure. Lovely — Level 2 is opening up.</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>Keep the joy in it: keep playing number and shape games; the school will stretch them from here.</div>
        </div>
      )}

      <div className="action-stack" style={{ marginTop: 14 }}>
        <button className="btn btn-primary btn-block" onClick={onDashboard}>For grown-ups: open the gap dashboard →</button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)', margin: '4px 4px 0' }}>
          A check-in, not a validated report — bring this to the teacher as a conversation-starter.
        </p>
        <button className="btn btn-ghost btn-block" onClick={onDone}>Back to home</button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)', marginTop: 12 }}>
        {ITEMS.length} questions · no timers · VCAA Level 1 content descriptions (© VCAA, CC-BY-NC 3.0)
      </p>
    </>
  );
}
