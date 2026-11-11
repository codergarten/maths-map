import { useEffect, useMemo, useState } from 'react';
import { ITEMS, strandOfCode } from '../curriculum';
import { loadProfiles, loadSessions, upsertSession } from '../store';
import type { Item, Session } from '../types';

export default function AssessmentScreen({
  profileId,
  sessionId,
  onFinish,
  onExit,
}: {
  profileId: string;
  sessionId: string;
  onFinish: (sessionId: string) => void;
  onExit: () => void;
}) {
  const session = useMemo(() => loadSessions().find((s) => s.id === sessionId) ?? null, [sessionId]);
  const profile = useMemo(() => loadProfiles().find((p) => p.id === profileId) ?? null, [profileId]);

  const [index, setIndex] = useState<number>(() => session?.currentIndex ?? 0);
  const [responses, setResponses] = useState(() => session?.responses ?? []);
  const [choiceSel, setChoiceSel] = useState<number | null>(null);
  const [orderSeq, setOrderSeq] = useState<string[]>([]);

  const item: Item | undefined = ITEMS[index];

  useEffect(() => {
    setChoiceSel(null);
    setOrderSeq([]);
  }, [index]);

  if (!session || !profile || !item) {
    return (
      <div className="card">
        <p>That assessment link expired. Let&rsquo;s head back.</p>
        <button className="btn btn-primary" onClick={onExit}>Back</button>
      </div>
    );
  }

  const persist = (nextIndex: number, nextResponses: Session['responses']) => {
    const updated: Session = {
      ...session,
      currentIndex: nextIndex,
      responses: nextResponses,
    };
    upsertSession(updated);
  };

  const commitPoints = (itemId: string, code: string, points: number) => {
    const next = responses.filter((r) => r.itemId !== itemId);
    next.push({ itemId, code, points });
    return next;
  };

  const advanceWith = (points: number) => {
    const next = commitPoints(item.id, item.code, points);
    setResponses(next);
    const nextIndex = index + 1;
    if (nextIndex >= ITEMS.length) {
      const finished: Session = { ...session, responses: next, currentIndex: index, completedAt: new Date().toISOString() };
      upsertSession(finished);
      onFinish(session.id);
    } else {
      persist(nextIndex, next);
      setIndex(nextIndex);
    }
  };

  const goNextChoice = () => {
    if (choiceSel === null || item.type !== 'choice') return;
    advanceWith(choiceSel === item.answer ? 2 : 0);
  };
  const goNextOrder = () => {
    if (item.type !== 'order') return;
    const ok = JSON.stringify(orderSeq) === JSON.stringify(item.answer);
    advanceWith(ok ? 2 : 0);
  };
  const goBack = () => {
    if (index === 0) return;
    const prev = index - 1;
    const prevItem = ITEMS[prev];
    const next = responses.filter((r) => r.itemId !== prevItem.id);
    setResponses(next);
    persist(prev, next);
    setIndex(prev);
  };
  const saveAndExit = () => {
    persist(index, responses);
    onExit();
  };

  const answered = responses.length;
  const pct = Math.round((index / ITEMS.length) * 100);

  return (
    <>
      <div className="assess-head">
        <div className="progress" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
        <div className="assess-count">{Math.min(index + 1, ITEMS.length)}/{ITEMS.length}</div>
      </div>

      <div className="card">
        <span className="strand-tag">{strandOfCode(item.code)} · {item.code}</span>

        {item.type === 'choice' && (
          <>
            <div className="item-prompt">{item.prompt}</div>
            <div className="options" role="radiogroup" aria-label={item.prompt}>
              {item.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${choiceSel === i ? 'selected' : ''}`}
                  onClick={() => setChoiceSel(i)}
                  aria-pressed={choiceSel === i}
                >
                  <span className="key">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {item.type === 'order' && (
          <>
            <div className="item-prompt">{item.prompt}</div>
            <div className="item-sub">Tap the cards in the right order:</div>
            <div className="order-answer" aria-label="Your order">
              {orderSeq.length === 0 && <span className="placeholder">Tap the numbers below…</span>}
              {orderSeq.map((v, i) => (
                <button key={`${v}-${i}`} className="chip" style={{ background: 'var(--primary-soft)' }} onClick={() => setOrderSeq(orderSeq.filter((_, j) => j !== i))} aria-label={`Remove ${v}`}>{v}</button>
              ))}
            </div>
            <div className="order-pool">
              {item.items.filter((v) => !orderSeq.includes(v)).map((v) => (
                <button key={v} className="chip" onClick={() => setOrderSeq([...orderSeq, v])}>{v}</button>
              ))}
            </div>
            {orderSeq.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setOrderSeq([])}>Clear order</button>}
          </>
        )}

        {item.type === 'observe' && (
          <>
            <div className="item-prompt" style={{ fontSize: 19 }}>👀 Parent task: {item.prompt}</div>
            <div className="observe-script">
              <b>Do this with {profile.name}</b>
              <div style={{ marginTop: 6 }}>{item.observeScript}</div>
            </div>
            <button className="rubric-btn secure" onClick={() => advanceWith(2)}>
              <span className="r-label">✅ Secure (2 points)</span>{item.observeRubric.secure}
            </button>
            <button className="rubric-btn partial" onClick={() => advanceWith(1)}>
              <span className="r-label">🌤️ Developing (1 point)</span>{item.observeRubric.partial}
            </button>
            <button className="rubric-btn notyet" onClick={() => advanceWith(0)}>
              <span className="r-label">🌱 Not yet (0 points)</span>{item.observeRubric.notYet}
            </button>
          </>
        )}

        {item.type !== 'observe' && (
          <div className="assess-foot">
            <button className="btn btn-ghost btn-sm" onClick={saveAndExit}>💾 Save &amp; exit</button>
            <div style={{ display: 'flex', gap: 8 }}>
              {index > 0 && <button className="btn btn-ghost btn-sm" onClick={goBack}>← Back</button>}
              {item.type === 'choice' && (
                <button className="btn btn-primary" onClick={goNextChoice} disabled={choiceSel === null}>
                  {index === ITEMS.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              )}
              {item.type === 'order' && (
                <button className="btn btn-primary" onClick={goNextOrder} disabled={orderSeq.length !== item.items.length}>
                  {index === ITEMS.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              )}
            </div>
          </div>
        )}
        {item.type === 'observe' && (
          <div className="assess-foot">
            <button className="btn btn-ghost btn-sm" onClick={saveAndExit}>💾 Save &amp; exit</button>
            {index > 0 && <button className="btn btn-ghost btn-sm" onClick={goBack}>← Back</button>}
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)' }}>
        {item.type === 'observe' ? 'Observe honestly — this only helps if it reflects reality.' : 'Read it aloud if your child prefers. No timers.'}
      </p>
    </>
  );
}
