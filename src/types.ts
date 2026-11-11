export type ItemType = 'choice' | 'order' | 'observe';
export type Proficiency = 'understanding' | 'fluency' | 'reasoning' | 'problemSolving';

export interface BaseItem {
  id: string;
  code: string;
  strand: string;
  type: ItemType;
  proficiency: Proficiency[];
  prompt: string;
}
export interface ChoiceItem extends BaseItem {
  type: 'choice';
  options: string[];
  answer: number;
}
export interface OrderItem extends BaseItem {
  type: 'order';
  items: string[];
  answer: string[];
}
export interface ObserveItem extends BaseItem {
  type: 'observe';
  observeScript: string;
  observeRubric: { secure: string; partial: string; notYet: string };
}
export type Item = ChoiceItem | OrderItem | ObserveItem;

export interface Profile {
  id: string;
  name: string;
  yearLevel: string;
  emoji: string;
  colour: string;
  createdAt: string;
  /** Which VC2 Mathematics level this child is checked against. Defaults to Level 1. */
  levelId?: 'level-1' | 'level-2';
}

export interface SessionResponse {
  itemId: string;
  code: string;
  points: number; // 0 | 1 | 2
}

export interface Session {
  id: string;
  profileId: string;
  levelId: string;
  startedAt: string;
  completedAt: string | null;
  currentIndex: number;
  responses: SessionResponse[];
}
