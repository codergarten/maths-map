import { getLevelCtx, LEVELS } from '../curriculum';
import { inProgressSession, latestCompletedSession, scoreSession } from '../scoring';
import { upsertSession, uid, updateProfile } from '../store';
import type { LevelId } from '../curriculum';
import type { Profile, Session } from '../types';

export default function ChildHomeScreen({
  profile,
  sessions,
  onStartAssessment,
  onDashboard,
  onHistory,
  onPrint,
  onChanged,
}: {
  profile: Profile;
  sessions: Session[];
  onStartAssessment: (sessionId: string) => void;
  onDashboard: () => void;
  onHistory: () => void;
  onPrint: () => void;
  onChanged: () => void;
}) {
  if (!profile) return null;
  const ctx = getLevelCtx(profile.levelId);
  const mine = sessions.filter((s) => s.profileId === profile.id);
  const levelMine = mine.filter((s) => s.levelId === ctx.id);
  const inProgress = inProgressSession(mine, profile.id, ctx.id);
  const last = latestCompletedSession(mine, profile.id, ctx.id);
  const lastResult = last ? scoreSession(last) : null;
  const done = mine.filter((s) => s.completedAt && s.levelId === ctx.id);

  const switchLevel = (levelId: LevelId) => {
    updateProfile(profile.id, { levelId });
    onChanged();
  };

  const startNew = () => {
    const session: Session = {
      id: uid(),
      profileId: profile.id,
      levelId: ctx.id,
      startedAt: new Date().toISOString(),
      completedAt: null,
      currentIndex: 0,
      responses: [],
    };
    upsertSession(session);
    onStartAssessment(session.id);
  };

  const answerCount = inProgress?.responses.length ?? 0;

  return (
    <>
      <div className="card child-hero">
        <div className="avatar" style={{ background: profile.colour }}>{profile.emoji}</div>
        <div>
          <h2>Hi {profile.name}!</h2>
          <div className="sub">No pressure, no timers — just a maths chat and some puzzles 🎈</div>
          <div className="sub" style={{ fontSize: 11, opacity: 0.85 }}>{ctx.label} Mathematics · Victorian Curriculum F–10 (2.0)</div>
        </div>
      </div>

      <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ink-soft)' }}>Which level?</span>
        {(Object.keys(LEVELS) as LevelId[]).map((lid) => {
          const active = lid === ctx.id;
          return (
            <button
              key={lid}
              className="btn btn-sm"
              style={{
                background: active ? 'var(--primary)' : 'var(--primary-soft)',
                color: active ? '#fff' : 'var(--primary-dark)',
                minHeight: 44,
              }}
              aria-pressed={active}
              onClick={() => switchLevel(lid)}
            >
              {LEVELS[lid].label}
            </button>
          );
        })}
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', flexBasis: '100%' }}>{ctx.oneLine}</span>
      </div>

      {inProgress && (
        <div className="resume-banner" role="status">
          <span className="icon">⏸️</span>
          <div style={{ flex: 1 }}>
            <strong>Check-in in progress ({ctx.label})</strong>
            <div style={{ fontSize: 13 }}>{answerCount} of {ctx.items.length} questions answered</div>
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => onStartAssessment(inProgress.id)}>Resume ▶</button>
        </div>
      )}

      <div className="action-stack">
        {!inProgress && (
          <button className="btn btn-primary btn-lg btn-block" onClick={startNew}>
            🗺️ Start {ctx.label} maths check-in
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>~25–40 min · all strands · {ctx.items.length} questions</span>
          </button>
        )}
        {inProgress && (
          <button className="btn btn-ghost btn-block" onClick={startNew}>Start a fresh check-in instead (discard the old one)</button>
        )}
        <button className="btn btn-ghost btn-block" onClick={onDashboard}>📊 See the gap dashboard</button>
        <button className="btn btn-ghost btn-block" onClick={onHistory}>📈 Term-by-term history</button>
        <button className="btn btn-ghost btn-block" onClick={onPrint}>🖨️ Printable report (A4)</button>
      </div>

      {lastResult && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ink-soft)' }}>Latest {ctx.label} check-in</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--primary-dark)' }}>{lastResult.overallPercent}%</span>
            <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{last ? new Date(last.completedAt!).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} · {done.length} check-in{done.length === 1 ? '' : 's'} so far</span>
          </div>
          <div className="coverage-row" style={{ marginTop: 12 }}>
            <div className="coverage-chip" style={{ borderColor: 'var(--secure)' }}><div className="n" style={{ color: 'var(--secure)' }}>{lastResult.secureCount}</div><div className="l">Strong</div></div>
            <div className="coverage-chip" style={{ borderColor: 'var(--developing)' }}><div className="n" style={{ color: 'var(--developing)' }}>{lastResult.developingCount}</div><div className="l">Developing</div></div>
            <div className="coverage-chip" style={{ borderColor: 'var(--emerging)' }}><div className="n" style={{ color: 'var(--emerging)' }}>{lastResult.emergingCount}</div><div className="l">Needs work</div></div>
          </div>
        </div>
      )}
      {levelMine.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)', marginTop: 12 }}>
          No {ctx.label} check-ins yet{(profile.levelId ?? 'level-1') === 'level-2' ? ' — ideal if your child has mastered Level 1 (or is in Year 2)' : ''}.
        </p>
      )}
    </>
  );
}
