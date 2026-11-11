import { useState } from 'react';
import { addProfile, deleteProfile } from '../store';
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
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [colour, setColour] = useState(COLOURS[0]);
  const [showForm, setShowForm] = useState(profiles.length === 0);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addProfile({ name: trimmed, yearLevel, emoji, colour });
    setName('');
    setYearLevel('Year 1');
    setEmoji(EMOJIS[0]);
    setColour(COLOURS[0]);
    setShowForm(false);
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

      <div className="profile-grid">
        {profiles.map((p) => (
          <button key={p.id} className="profile-card" onClick={() => onSelect(p.id)} aria-label={`Open ${p.name}`}>
            <div className="avatar" style={{ background: p.colour }}>{p.emoji}</div>
            <div className="name">{p.name}</div>
            <div className="year">{p.yearLevel}</div>
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
          </button>
        ))}
        {profiles.length > 0 && (
          <button className="profile-card" style={{ borderStyle: 'dashed' }} onClick={() => setShowForm((v) => !v)}>
            <div className="avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)' }}>＋</div>
            <div className="name">Add a child</div>
          </button>
        )}
      </div>

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
