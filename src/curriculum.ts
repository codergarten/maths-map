import curriculumRaw from '../data/curriculum.json';
import itemBankRaw from '../data/item-bank-level-1.json';
import guidanceRaw from '../data/level-1-guidance.json';
import type { Item, Proficiency } from './types';

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

const curriculum = curriculumRaw as unknown as { meta: { sourceUrl: string; licence: string }; levels: CurriculumLevel[] };

export const LEVEL: CurriculumLevel =
  curriculum.levels.find((l) => l.id === 'level-1') ?? curriculum.levels[0];

export const STRANDS = LEVEL.strands;

export const ALL_CODES: ContentDescription[] = STRANDS.flatMap((s) => s.contentDescriptions);
export const CODES = ALL_CODES.map((c) => c.code);
export const CODE_SET = new Set(CODES);
export const CODE_MAP = new Map(ALL_CODES.map((c) => [c.code, c]));

export function strandOfCode(code: string): string {
  const s = STRANDS.find((st) => st.contentDescriptions.some((c) => c.code === code));
  return s ? s.name : '';
}
export function strandIdOfCode(code: string): string {
  const s = STRANDS.find((st) => st.contentDescriptions.some((c) => c.code === code));
  return s ? s.id : '';
}

export const ACHIEVEMENT_STANDARD = LEVEL.achievementStandard;

export const ITEMS = (itemBankRaw as unknown as { items: Item[] }).items;
export const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));
export const ITEMS_BY_CODE = new Map<string, Item[]>();
for (const item of ITEMS) {
  const list = ITEMS_BY_CODE.get(item.code) ?? [];
  list.push(item);
  ITEMS_BY_CODE.set(item.code, list);
}

export interface Guidance {
  plainWords: string;
  whyItMatters: string;
  watchFor: string;
  activities: string[];
}

export const GUIDANCE = (guidanceRaw as unknown as { guidance: Record<string, Guidance> }).guidance;
export const GUIDANCE_META = (guidanceRaw as unknown as { meta: { level: string; licence: string } }).meta;

export const CURRICULUM_META = curriculum.meta;

export const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  understanding: 'Understanding',
  fluency: 'Fluency',
  reasoning: 'Reasoning',
  problemSolving: 'Problem-solving',
};
