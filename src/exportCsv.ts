import { loadProfiles, loadSessions } from './store';
import { scoreSession } from './scoring';
import type { Profile, Session } from './types';

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function rowsForSession(profile: Profile, session: Session): string[] {
  const result = scoreSession(session);
  const date = session.completedAt ? session.completedAt.slice(0, 10) : 'incomplete';
  const level = result.levelLabel;
  const base = (code: string, strand: string, earned: string | number, max: string | number, percent: string | number, status: string) =>
    [profile.name, profile.yearLevel, level, date, strand, code, earned, max, percent, status].map(csvEscape).join(',');
  const lines = result.codeScores.map((c) => base(c.code, c.strand, c.earned, c.max, c.percent, c.status));
  lines.push(base('STRANDS (avg)', '', '', '', result.overallPercent, `${result.secureCount} strong / ${result.developingCount} developing / ${result.emergingCount} needs work`));
  for (const s of result.strands) {
    lines.push(base(`STRAND: ${s.name}`, s.name, '', '', s.percent, s.status));
  }
  return lines;
}

export function buildResultsCsv(profiles: Profile[], sessions: Session[]): string {
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const completed = sessions
    .filter((s) => s.completedAt && profileMap.has(s.profileId))
    .slice()
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));

  const header = ['Child', 'Year level', 'Level', 'Check-in date', 'Strand', 'Code', 'Points earned', 'Points max', 'Percent', 'Status'];
  const lines = ['\ufeff' + header.join(',')]; // BOM for Excel
  for (const session of completed) {
    const profile = profileMap.get(session.profileId)!;
    lines.push(...rowsForSession(profile, session));
  }
  return lines.join('\r\n');
}

export function downloadResultsCsv(): void {
  const csv = buildResultsCsv(loadProfiles(), loadSessions());
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maths-map-results-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
