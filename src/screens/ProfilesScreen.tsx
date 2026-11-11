import { useState } from 'react';
import { addProfile, deleteProfile, updateProfile, deleteSessionsForProfile } from '../store';
import type { Profile } from '../types';

const EMOJIS = ['🦊', '🐼', '🐨', '🦁', '🐸', '🦄', '🐯', '🐰', '🐙', '🦖', '🐧', '⭐'];
const COLOURS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecaca', '#ddd6fe', '#fed7aa'];
const YEARS = ['Foundation', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

export default function ProfilesScreen({
  profiles,
  onSelect,
  onChanged,
}: {
  profiles: Profile[];
  onSelect: (id: string) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState('');
  const [yearLevel, setYearLevel] = useState('Year 1');
  const [levelId, setLevelId] = useState<'level-1' | 'level-2'>('level-1');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [colour, setColour] = useState(COLOURS[0]);
  const [showForm, setShowForm] = useState(profiles.length === 0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [eName, setEName] = useState('');
  const [eYear, setEYear] = useState('Year 1');
  const [eLevelId, setELevelId] = useState<'level-1' | 'level-2'>('level-1');
  const [eEmoji, setEEmoji] = useState(EMOJIS[0]);
  const [eColour, setEColour] = useState(COLOURS[0]);

  const editing = profiles.find((p) => p.id === editingId) ?? null;

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setShowForm(false);
    setEName(p.name);
    setEYear(p.yearLevel);
    setELevelId(p.levelId ?? 'level-1');
    setEEmoji(p.emoji);
    setEColour(p.colour);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addProfile({ name: trimmed, yearLevel, emoji, colour, levelId });
    setName('');
    setYearLevel('Year 1');
    setLevelId('level-1');
    setEmoji(EMOJIS[0]);
    setColour(COLOURS[0]);
    setShowForm(false);
    onChanged();
  };

  const saveEdit = () => {
    if (!editing) return;
    const trimmed = eName.trim();
    if (!trimmed) return;
    updateProfile(editing.id, { name: trimmed, yearLevel: eYear, emoji: eEmoji, colour: eColour, levelId: eLevelId });
    setEditingId(null);
    onChanged();
  };

  return (
    <>
      <div className="card">
        <strong style={{ fontSize: 15 }}>Who&rsquo;s doing maths today?</strong>
        <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
          Tap a child to start a check-in, see their dashboard, or print a report.
        </div>
      </div>

      <div className="card flat" style={{ border: '1.5px solid var(--primary-soft)', background: 'var(--primary-soft)' }}>
        <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-dark)' }}>What this is built on</div>
        <p style={{ margin: '6px 0 4px', fontSize: 14 }}>
          Maths Map maps your child against the <strong>Victorian Curriculum F–10 (Version 2.0), Mathematics — Australia 🇦🇺</strong>. Published by the Victorian Curriculum and Assessment Authority (VCAA).
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--primary-dark)' }}>
          Source &amp; authority: <a href="https://f10.vcaa.vic.edu.au/" target="_blank" rel="noreferrer">f10.vcaa.vic.edu.au</a> · it&rsquo;s the only official version. Other states differ — see the FAQ.
        </p>
      </div>

      <div className="profile-grid">
        {profiles.map((p) => (
          <button key={p.id} className="profile-card" onClick={() => onSelect(p.id)} aria-label={`Open ${p.name}`}>
            <div className="avatar" style={{ background: p.colour }}>{p.emoji}</div>
            <div className="name">{p.name}</div>
            <div className="year">{p.yearLevel} · {(p.levelId ?? 'level-1') === 'level-2' ? 'Level 2' : 'Level 1'}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
              <span
                className="del"
                role="button"
                tabIndex={0}
                style={{ color: 'var(--primary-dark)' }}
                onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
              >
                ✎ edit
              </span>
              <span
                className="del"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Remove ${p.name} and all their assessment history from this device?`)) {
                    deleteProfile(p.id);
                    onChanged();
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
              >
                remove
              </span>
            </div>
          </button>
        ))}
        {profiles.length > 0 && (
          <button className="profile-card" style={{ borderStyle: 'dashed' }} onClick={() => { setShowForm((v) => !v); setEditingId(null); }}>
            <div className="avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>＋</div>
            <div className="name">Add a child</div>
          </button>
        )}
      </div>

      {editing && (
        <div className="card" style={{ border: '1.5px solid var(--primary)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-dark)' }}>Edit {editing.name}</div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <label htmlFor="edit-name">Name</label>
            <input id="edit-name" value={eName} autoFocus onChange={(e) => setEName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} />
          </div>
          <div className="form-row">
            <label htmlFor="edit-year">Year level</label>
            <select id="edit-year" value={eYear} onChange={(e) => setEYear(e.target.value)}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="edit-level">Maths level (VC2)</label>
            <select id="edit-level" value={eLevelId} onChange={(e) => setELevelId(e.target.value as 'level-1' | 'level-2')}>
              <option value="level-1">Level 1 (≈ Year 1)</option>
              <option value="level-2">Level 2 (≈ Year 2)</option>
            </select>
          </div>
          <div className="form-row">
            <label>Avatar</label>
            <div className="emoji-pick">
              {EMOJIS.map((e) => (
                <button key={e} className={e === eEmoji ? 'selected' : ''} onClick={() => setEEmoji(e)} aria-label={`Avatar ${e}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Background colour</label>
            <div className="emoji-pick">
              {COLOURS.map((c) => (
                <button key={c} style={{ background: c }} className={c === eColour ? 'selected' : ''} onClick={() => setEColour(c)} aria-label={`Colour ${c}`} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={!eName.trim()}>Save changes</button>
            <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', border: '1px dashed var(--emerging)', borderRadius: 12, background: 'var(--emerging-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--emerging)' }}>Danger zone</div>
            <p style={{ fontSize: 13, margin: '6px 0 8px' }}>Erase all check-in answers and history for <strong>{editing.name}</strong> — the profile itself stays.</p>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Erase all check-ins and history for ${editing.name}? This cannot be undone (backup first if unsure).`)) {
                  deleteSessionsForProfile(editing.id);
                  setEditingId(null);
                  onChanged();
                }
              }}
            >
              Erase check-ins
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <div className="form-row">
            <label htmlFor="child-name">Child&rsquo;s name</label>
            <input id="child-name" value={name} placeholder="e.g. Aarav" autoFocus onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          <div className="form-row">
            <label htmlFor="child-year">Year level</label>
            <select id="child-year" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="child-level">Maths level (VC2)</label>
            <select id="child-level" value={levelId} onChange={(e) => setLevelId(e.target.value as 'level-1' | 'level-2')}>
              <option value="level-1">Level 1 (≈ Year 1)</option>
              <option value="level-2">Level 2 (≈ Year 2)</option>
            </select>
          </div>
          <div className="form-row">
            <label>Pick an avatar</label>
            <div className="emoji-pick">
              {EMOJIS.map((e) => (
                <button key={e} className={e === emoji ? 'selected' : ''} onClick={() => setEmoji(e)} aria-label={`Avatar ${e}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Background colour</label>
            <div className="emoji-pick">
              {COLOURS.map((c) => (
                <button key={c} style={{ background: c }} className={c === colour ? 'selected' : ''} onClick={() => setColour(c)} aria-label={`Colour ${c}`} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>Save child</button>
            {profiles.length > 0 && <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 12, marginTop: 10 }}>
        All profiles and results live only on this device. Nothing is uploaded anywhere.
      </p>
    </>
  );
}
