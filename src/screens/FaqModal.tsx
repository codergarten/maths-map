import { FAQ_ENTRIES, VCAA_URL } from '../faq';

export default function FaqModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Frequently asked questions for parents" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: 1 }}>Straight answers, grown-ups</div>
        <h3>Frequently asked questions</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0 }}>
          Maths Map is free to use, transparent about what it is, and built around the{' '}
          <a href={VCAA_URL} target="_blank" rel="noreferrer"><strong>Victorian Curriculum F–10 (2.0), Australia</strong></a> —{' '}
          always the source of truth.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {FAQ_ENTRIES.map((entry, i) => (
            <details key={i} className="faq-item" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 15 }}>{entry.question}</summary>
              <p style={{ fontSize: 14, color: 'var(--ink)', margin: '10px 0 0' }}>{entry.answer}</p>
            </details>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 14 }}>
          Still stuck? The <a href={VCAA_URL} target="_blank" rel="noreferrer">VCAA curriculum site</a> publishes the full F–10 Mathematics document — free, authoritative, and kept current.
        </p>
      </div>
    </div>
  );
}
