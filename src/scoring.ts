import { ALL_CODES, ITEMS_BY_CODE, STRANDS, strandOfCode } from './curriculum';
import { ITEM_MAP } from './curriculum';
import type { Session } from './types';
import type { Proficiency } from './types';

export type CodeStatus = 'secure' | 'developing' | 'emerging' | 'notAssessed';

export interface CodeScore {
  code: string;
  strand: string;
  earned: number;
  max: number;
  percent: number; // 0-100, -1 if not assessed
  status: CodeStatus;
}

export interface StrandScore {
  id: string;
  name: string;
  percent: number; // mean of code percents (assessed only)
  status: CodeStatus;
  codes: CodeScore[];
}

export type ProficiencyPercent = Record<Proficiency, number>;
export interface SessionResult {
  codeScores: CodeScore[];
  strands: StrandScore[];
  overallPercent: number;
  secureCount: number;
  developingCount: number;
  emergingCount: number;
  proficiencyPercent: ProficiencyPercent;
  weakestProficiency: Proficiency | null;
}

function statusFor(percent: number): CodeStatus {
  if (percent >= 80) return 'secure';
  if (percent >= 50) return 'developing';
  return 'emerging';
}

export function scoreSession(session: Session): SessionResult {
  const pointsByItem = new Map(session.responses.map((r) => [r.itemId, r.points]));

  const codeScores: CodeScore[] = ALL_CODES.map((cd) => {
    const items = ITEMS_BY_CODE.get(cd.code) ?? [];
    const max = items.length * 2;
    let earned = 0;
    for (const item of items) {
      earned += pointsByItem.get(item.id) ?? 0;
    }
    const assessed = items.some((i) => pointsByItem.has(i.id));
    const percent = max === 0 ? 0 : Math.round((earned / max) * 100);
    return {
      code: cd.code,
      strand: strandOfCode(cd.code),
      earned,
      max,
      percent: assessed ? percent : 0,
      status: assessed ? statusFor(percent) : 'notAssessed',
    };
  });

  const strands: StrandScore[] = STRANDS.map((s) => {
    const codes = codeScores.filter((c) => c.strand === s.name);
    const assessed = codes.filter((c) => c.status !== 'notAssessed');
    const percent =
      assessed.length === 0
        ? 0
        : Math.round(assessed.reduce((sum, c) => sum + c.percent, 0) / assessed.length);
    return {
      id: s.id,
      name: s.name,
      percent,
      status: assessed.length === 0 ? 'notAssessed' : statusFor(percent),
      codes,
    };
  });

  const assessedAll = codeScores.filter((c) => c.status !== 'notAssessed');
  const overallPercent =
    assessedAll.length === 0
      ? 0
      : Math.round(assessedAll.reduce((sum, c) => sum + c.percent, 0) / assessedAll.length);

  const proficiencyPercent = { understanding: 0, fluency: 0, reasoning: 0, problemSolving: 0 } as Record<Proficiency, number>;
  const proficiencyMax: Record<Proficiency, number> = { understanding: 0, fluency: 0, reasoning: 0, problemSolving: 0 };
  const proficiencyEarned: Record<Proficiency, number> = { understanding: 0, fluency: 0, reasoning: 0, problemSolving: 0 };
  for (const [itemId, pts] of pointsByItem) {
    const item = ITEM_MAP.get(itemId);
    if (!item) continue;
    for (const p of item.proficiency) {
      proficiencyMax[p] += 2;
      proficiencyEarned[p] += pts;
    }
  }
  for (const p of Object.keys(proficiencyMax) as Proficiency[]) {
    proficiencyPercent[p] = proficiencyMax[p] === 0 ? 0 : Math.round((proficiencyEarned[p] / proficiencyMax[p]) * 100);
  }
  let weakestProficiency: Proficiency | null = null;
  let weakest = 101;
  for (const p of Object.keys(proficiencyMax) as Proficiency[]) {
    if (proficiencyMax[p] > 0 && proficiencyPercent[p] < weakest) {
      weakest = proficiencyPercent[p];
      weakestProficiency = p;
    }
  }

  return {
    codeScores,
    strands,
    overallPercent,
    secureCount: codeScores.filter((c) => c.status === 'secure').length,
    developingCount: codeScores.filter((c) => c.status === 'developing').length,
    emergingCount: codeScores.filter((c) => c.status === 'emerging').length,
    proficiencyPercent,
    weakestProficiency,
  };
}

export function latestCompletedSession(sessions: Session[], profileId: string): Session | null {
  const done = sessions.filter((s) => s.profileId === profileId && s.completedAt);
  if (done.length === 0) return null;
  return done.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))[0];
}

export function inProgressSession(sessions: Session[], profileId: string): Session | null {
  return sessions.find((s) => s.profileId === profileId && !s.completedAt) ?? null;
}
