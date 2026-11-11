import curriculumLevel1Raw from '../data/curriculum.level-1.json';
import curriculumLevel2Raw from '../data/curriculum.level-2.json';
import itemBankL1 from '../data/item-bank-level-1.json';
import itemBankL2 from '../data/item-bank-level-2.json';
import guidanceL1 from '../data/level-1-guidance.json';
import guidanceL2 from '../data/level-2-guidance.json';
import type { Item, Proficiency } from './types';

export type LevelId = 'level-1' | 'level-2';

export interface ContentDescription {
  code: string;
  stem: string;
  description: string;
  elaborations: string[];
}
export interface Strand {
  id: string;
  name: string;
  contentDescriptions: ContentDescription[];
}
export interface CurriculumLevel {
  id: string;
  label: string;
  achievementStandard: string;
  strands: Strand[];
}

export interface Guidance {
  plainWords: string;
  whyItMatters: string;
  watchFor: string;
  activities: string[];
}

export interface LevelCtx {
  id: LevelId;
  label: string;
  oneLine: string;
  strands: Strand[];
  achievementStandard: string;
  allCodes: ContentDescription[];
  codes: string[];
  codeMap: Map<string, ContentDescription>;
  strandOfCode: Map<string, string>;
  strandIdOfCode: Map<string, string>;
  items: Item[];
  itemMap: Map<string, Item>;
  itemsByCode: Map<string, Item[]>;
  guidance: Record<string, Guidance>;
}

interface RawCurriculum {
  meta: { sourceUrl: string; licence: string };
  levels: CurriculumLevel[];
}

const raw1 = curriculumLevel1Raw as unknown as RawCurriculum;
const raw2 = curriculumLevel2Raw as unknown as RawCurriculum;

export const CURRICULUM_META = raw1.meta;
export const LEVEL_SOURCE_URL = CURRICULUM_META.sourceUrl;

const bank1 = itemBankL1 as unknown as { items: Item[] };
const bank2 = itemBankL2 as unknown as { items: Item[] };
const guid1 = guidanceL1 as unknown as { guidance: Record<string, Guidance> };
const guid2 = guidanceL2 as unknown as { guidance: Record<string, Guidance> };

function buildCtx(id: LevelId, raw: RawCurriculum, label: string, oneLine: string, items: Item[], guidance: Record<string, Guidance>): LevelCtx {
  const level = raw.levels.find((l) => l.id === id);
  if (!level) throw new Error(`curriculum.${id}.json is missing level ${id}`);

  const allCodes = level.strands.flatMap((s) => s.contentDescriptions);
  const codes = allCodes.map((c) => c.code);
  const codeMap = new Map(allCodes.map((c) => [c.code, c]));
  const strandOfCode = new Map<string, string>();
  const strandIdOfCode = new Map<string, string>();
  for (const s of level.strands) {
    for (const c of s.contentDescriptions) {
      strandOfCode.set(c.code, s.name);
      strandIdOfCode.set(c.code, s.id);
    }
  }
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const itemsByCode = new Map<string, Item[]>();
  for (const item of items) {
    const list = itemsByCode.get(item.code) ?? [];
    list.push(item);
    itemsByCode.set(item.code, list);
  }

  return {
    id,
    label,
    oneLine,
    strands: level.strands,
    achievementStandard: level.achievementStandard,
    allCodes,
    codes,
    codeMap,
    strandOfCode,
    strandIdOfCode,
    items,
    itemMap,
    itemsByCode,
    guidance,
  };
}

export const LEVELS: Record<LevelId, LevelCtx> = {
  'level-1': buildCtx('level-1', raw1, 'Level 1', 'Numbers to 120, patterns, informal measuring, simple data (≈ Year 1)', bank1.items, guid1.guidance),
  'level-2': buildCtx('level-2', raw2, 'Level 2', 'Numbers to 1000, place value, fractions-halves, time (≈ Year 2)', bank2.items, guid2.guidance),
};

export const DEFAULT_LEVEL: LevelId = 'level-1';

export function getLevelCtx(levelId?: string | null): LevelCtx {
  return LEVELS[(levelId as LevelId) ?? DEFAULT_LEVEL] ?? LEVELS[DEFAULT_LEVEL];
}

export function levelLabel(levelId?: string | null): string {
  return getLevelCtx(levelId).label;
}

export const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  understanding: 'Understanding',
  fluency: 'Fluency',
  reasoning: 'Reasoning',
  problemSolving: 'Problem-solving',
};
