import { ACHIEVEMENT_STANDARD, GUIDANCE } from '../curriculum';
import { latestCompletedSession, scoreSession } from '../scoring';
import type { Profile, Session } from '../types';

export default function PrintReport({ profile, sessions }: { profile: Profile; sessions: Session[] }) {
  const mine = sessions.filter((s) => s.profileId === profile.id);
  const last = latestCompletedSession(mine, profile.id);
  const result = last ? scoreSession(last) : null;
  const gloss = (status: string) => (status === 'secure' ? '● Secure (80–100%)' : status === 'developing' ? '◐ Developing (50–79%)' : '○ Emerging (<50%)').replace(/([●◐○]) /, '$1 ');

  const today = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  const checkinDate = last?.completedAt ? new Date(last.completedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  const strengths = result?.codeScores.filter((c) => c.status === 'secure') ?? [];
  const focus = result?.codeScores.filter((c) => c.status !== 'secure') ?? [];

  return (
    <div className="print-report">
      <h1>Maths Map — Level 1 Mathematics</h1>
      <div style={{ borderBottom: '2.5pt solid #0e7490', paddingBottom: '10pt', marginBottom: '4pt' }}>
        <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>{profile.name} · {profile.yearLevel}</div>
        <div style={{ fontSize: '9.5pt', color: '#444' }}>Victorian Curriculum F–10 (Version 2.0) · Mathematics · dated {today}{checkinDate ? ` · based on check-in of ${checkinDate}` : ''}</div>
      </div>

      {!result && <p>No completed check-in on record for {profile.name} yet. Complete the Level 1 check-in, then print this report.</p>}

      {result && (
        <>
          <h2>Where things stand</h2>
          <p style={{ margin: '4pt 0' }}>{ACHIEVEMENT_STANDARD}</p>
          <p style={{ margin: '4pt 0' }}>
            <strong>Overall: {result.overallPercent}%</strong> across 15 content descriptions —&nbsp;
            <strong>{result.secureCount}</strong> strong · <strong>{result.developingCount}</strong> developing · <strong>{result.emergingCount}</strong> needs work.
          </p>

          <h2>Strand summary</h2>
          <table>
            <thead><tr><th>Strand</th><th>Score</th><th>Verdict</th></tr></thead>
            <tbody>
              {result.strands.map((s) => (
                <tr key={s.id}><td>{s.name}</td><td>{s.percent}%</td><td>{s.status === 'secure' ? 'Secure' : s.status === 'developing' ? 'Developing' : 'Emerging'}</td></tr>
              ))}
            </tbody>
          </table>

          <h2>Content codes in detail (tap for the parent notes at home)</h2>
          <table>
            <thead><tr><th>Code</th><th>Content (short)</th><th>Score</th><th>Status</th></tr></thead>
            <tbody>
              {result.strands.flatMap((s) => s.codes).map((c) => (
                <tr key={c.code}>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.code}</td>
                  <td>{GUIDANCE[c.code]?.plainWords}</td>
                  <td>{c.earned}/{c.max} ({c.percent}%)</td>
                  <td>{gloss(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {strengths.length > 0 && (
            <>
              <h2>Strengths to build on</h2>
              <ul>
                {strengths.map((c) => <li key={c.code}><strong>{c.code}</strong> — {GUIDANCE[c.code]?.plainWords}</li>)}
              </ul>
            </>
          )}

          {focus.length > 0 && (
            <>
              <h2>Focus next — at home</h2>
              {focus.map((c) => (
                <div key={c.code} style={{ marginBottom: '8pt' }}>
                  <div><strong>{c.code}</strong> — {GUIDANCE[c.code]?.plainWords}</div>
                  <div style={{ fontSize: '9pt', color: '#333' }}>Watch for: {GUIDANCE[c.code]?.watchFor}</div>
                  <div style={{ fontSize: '9pt', color: '#333' }}>Try: {GUIDANCE[c.code]?.activities.slice(0, 2).join(' · ')}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      <div className="foot">
        Prepared by a parent using Maths Map. Based on Victorian Curriculum F–10 (Version 2.0) Mathematics, Level 1 (© VCAA, licensed CC-BY-NC 3.0). This is a guided check-in, not a validated diagnostic and not a school report — please share with {profile.yearLevel === 'Foundation' ? 'Foundation' : profile.yearLevel} teachers as a conversation starter.
      </div>
    </div>
  );
}
