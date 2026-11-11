import { useState } from 'react';
import { getLevelCtx, PROFICIENCY_LABEL } from '../curriculum';
import { latestCompletedSession, scoreSession } from '../scoring';
import type { Profile, Session } from '../types';
import type { Proficiency } from '../types';

export default function DashboardScreen({
  profile,
  sessions,
  onBack,
}: {
  profile: Profile;
  sessions: Session[];
  onBack: () => void;
}) {
  const [openCode, setOpenCode] = useState<string | null>(null);
  const mine = sessions.filter((s) => s.profileId === profile.id);
  const last = latestCompletedSession(mine, profile.id, profile.levelId);
  const result = last ? scoreSession(last) : null;
  const ctx = getLevelCtx(profile.levelId);
  const scoreByCode = new Map(result?.codeScores.map((c) => [c.code, c]) ?? []);

  const openGuidance = openCode ? ctx.guidance[openCode] : null;
  const openVcaa = openCode ? ctx.codeMap.get(openCode) : null;
  const openScore = openCode ? scoreByCode.get(openCode) : null;

  return (
    <>
      <div className="card child-hero" style={{ paddingBottom: 16 }}>
        <div className="avatar" style={{ background: profile.colour, fontSize: 40, width: 64, height: 64, lineHeight: '64px' }}>{profile.emoji}</div>
        <div>
          <h2 style={{ fontSize: 20 }}>{profile.name}&rsquo;s maths map</h2>
          <div className="sub">Grown-ups only 👀 — {last ? `based on the ${new Date(last.completedAt!).toLocaleDateString('en-AU')} check-in` : 'no check-ins yet'}</div>
        </div>
      </div>

      {!result && (
        <div className="card">
          <strong>No check-in yet.</strong>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>Do the first check-in from {profile.name}&rsquo;s home screen and this dashboard fills in.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onBack}>← Back</button>
        </div>
      )}

      {result && (
        <>
          <div className="std-box">
            <b>Achievement standard (end of {ctx.label})</b>
            <div style={{ marginTop: 6 }}>{ctx.achievementStandard}</div>
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>
              Hitting it in {result.secureCount}/{ctx.codes.length} content codes — everything else is listed below as Developing or Needs work.
            </div>
          </div>

          <div className="coverage-row">
            <div className="coverage-chip" style={{ borderColor: 'var(--secure)' }}><div className="n" style={{ color: 'var(--secure)' }}>{result.secureCount}</div><div className="l">Strong</div></div>
            <div className="coverage-chip" style={{ borderColor: 'var(--developing)' }}><div className="n" style={{ color: 'var(--developing)' }}>{result.developingCount}</div><div className="l">Developing</div></div>
            <div className="coverage-chip" style={{ borderColor: 'var(--emerging)' }}><div className="n" style={{ color: 'var(--emerging)' }}>{result.emergingCount}</div><div className="l">Needs work</div></div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ink-soft)' }}>Proficiency lens</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              {(Object.keys(result.proficiencyPercent) as Proficiency[]).map((p) => (
                <div key={p}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                    <span>{PROFICIENCY_LABEL[p]}</span>
                    <span>{result.proficiencyPercent[p]}%</span>
                  </div>
                  <div className="strand-bar" style={{ margin: '4px 0 0' }}><div style={{ width: `${result.proficiencyPercent[p]}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="section">Strands &amp; content codes — tap any code</h2>
          <div className="card flat" style={{ padding: '8px 14px' }}>
            {result.strands.map((strand) => (
              <div key={strand.id} className="strand-block">
                <div className="strand-head">
                  <h3>{strand.name}</h3>
                  <span className="pct">{strand.percent}%</span>
                </div>
                <div className="strand-bar"><div style={{ width: `${strand.percent}%` }} /></div>
                <div className="code-grid">
                  {strand.codes.map((c) => {
                    const vcaa = ctx.codeMap.get(c.code);
                    return (
                      <button key={c.code} className={`code-chip ${c.status}`} onClick={() => setOpenCode(c.code)}>
                        <span className="code-id">{c.code}</span>
                        <span className="code-desc">{vcaa?.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-ghost btn-block" onClick={onBack}>← Back to {profile.name}</button>
        </>
      )}

      {openCode && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${openCode} details`} onClick={() => setOpenCode(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpenCode(null)} aria-label="Close">✕</button>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: 1 }}>{openCode} · {ctx.label}</div>
            <h3>{openGuidance?.plainWords}</h3>
            {openScore && (
              <p style={{ marginTop: -4 }}>
                Latest result: <strong>{openScore.earned}/{openScore.max} points ({openScore.percent}%)</strong> —{' '}
                <span className={`status-pill status-${openScore.status}`}>{openScore.status === 'secure' ? 'Strong' : openScore.status === 'developing' ? 'Developing' : 'Needs work'}</span>
              </p>
            )}
            <div className="guidance-label">Why it matters next</div>
            <p style={{ marginTop: 0 }}>{openGuidance?.whyItMatters}</p>
            <div className="guidance-label">What to watch for</div>
            <p style={{ marginTop: 0 }}>{openGuidance?.watchFor}</p>
            <div className="guidance-label">Build it at home</div>
            <ul className="activity-list">
              {openGuidance?.activities.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
            {openVcaa && (
              <>
                <div className="guidance-label">The curriculum says (VCAA)</div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0 }}>{openVcaa.stem} {openVcaa.description}</p>
                <ul className="activity-list" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {openVcaa.elaborations.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
