import type { Profile, Session } from './types';

const PROFILES_KEY = 'mc.profiles.v1';
const SESSIONS_KEY = 'mc.sessions.v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Maths Map: could not save', err);
  }
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadProfiles(): Profile[] {
  return readJson<Profile[]>(PROFILES_KEY, []);
}
export function saveProfiles(profiles: Profile[]): void {
  writeJson(PROFILES_KEY, profiles);
}
export function addProfile(input: Omit<Profile, 'id' | 'createdAt'>): Profile {
  const profile: Profile = { ...input, id: uid(), createdAt: new Date().toISOString() };
  saveProfiles([...loadProfiles(), profile]);
  return profile;
}
export function deleteProfile(id: string): void {
  saveProfiles(loadProfiles().filter((p) => p.id !== id));
  saveSessions(loadSessions().filter((s) => s.profileId !== id));
}
export function updateProfile(id: string, patch: Partial<Pick<Profile, 'name' | 'yearLevel' | 'emoji' | 'colour' | 'levelId'>>): Profile | null {
  const profiles = loadProfiles();
  const i = profiles.findIndex((p) => p.id === id);
  if (i === -1) return null;
  profiles[i] = { ...profiles[i], ...patch, name: (patch.name ?? profiles[i].name).trim() || profiles[i].name };
  saveProfiles(profiles);
  return profiles[i];
}
export function deleteSessionsForProfile(id: string): number {
  const sessions = loadSessions();
  const remaining = sessions.filter((s) => s.profileId !== id);
  saveSessions(remaining);
  return sessions.length - remaining.length;
}

export function loadSessions(): Session[] {
  return readJson<Session[]>(SESSIONS_KEY, []);
}
export function saveSessions(sessions: Session[]): void {
  writeJson(SESSIONS_KEY, sessions);
}
export function upsertSession(session: Session): void {
  const all = loadSessions();
  const i = all.findIndex((s) => s.id === session.id);
  if (i === -1) all.push(session);
  else all[i] = session;
  saveSessions(all);
}

export interface Backup {
  app: 'maths-map';
  version: 1;
  exportedAt: string;
  profiles: Profile[];
  sessions: Session[];
}
export function buildBackup(): Backup {
  return { app: 'maths-map', version: 1, exportedAt: new Date().toISOString(), profiles: loadProfiles(), sessions: loadSessions() };
}
export function downloadBackup(): void {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maths-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
export function importBackup(file: File): Promise<{ profiles: number; sessions: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Backup;
        // Accept both the new 'maths-map' tag and the original 'maths-compass' tag.
        if ((data.app as string) !== 'maths-map' && (data.app as string) !== 'maths-compass') throw new Error('Not a Maths Map backup file');
        const profiles = [...loadProfiles()];
        const sessions = [...loadSessions()];
        const profileIds = new Set(profiles.map((p) => p.id));
        const sessionIds = new Set(sessions.map((s) => s.id));
        for (const p of data.profiles ?? []) {
          if (!profileIds.has(p.id)) { profiles.push(p); profileIds.add(p.id); }
        }
        for (const s of data.sessions ?? []) {
          if (!sessionIds.has(s.id)) { sessions.push(s); sessionIds.add(s.id); }
        }
        saveProfiles(profiles);
        saveSessions(sessions);
        resolve({ profiles: data.profiles?.length ?? 0, sessions: data.sessions?.length ?? 0 });
      } catch (err) {
        reject(err as Error);
      }
    };
    reader.readAsText(file);
  });
}
