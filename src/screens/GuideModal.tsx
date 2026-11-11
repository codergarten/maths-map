export default function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Grown-ups’ guide to Maths Map" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: 1 }}>For grown-ups</div>
        <h3>How to run a check-in</h3>

        <div className="guidance-label">Before you start</div>
        <ul className="activity-list">
          <li>Pick a calm time — not right before dinner or bed. Full check-in is 25–35 minutes and can be paused (Save &amp; exit) and finished later.</li>
          <li>Have the household kit ready for the parent-observed tasks: small buttons/pasta/coins, string or ribbon, paper cups, blocks, a few $1 coins if you use cash.</li>
          <li>Tell your child: “This isn’t a test, it helps us know what to play with next. We’ll celebrate trying, not the score.”</li>
        </ul>

        <div className="guidance-label">During</div>
        <ul className="activity-list">
          <li>Read questions aloud if your child prefers — Level 1 reading is still wobbly at this age.</li>
          <li>Don’t coach, hint, or say “are you sure?” — we want the honest picture, not the best one. Wrong answers are information, not disaster.</li>
          <li>For the 👀 parent tasks, demonstrate nothing. Give the script, watch, and tick the honest box: Secure / Developing / Not yet.</li>
          <li>If they melt down or disengage, stop. A check-in done tomorrow beats one forced today.</li>
        </ul>

        <div className="guidance-label">After</div>
        <ul className="activity-list">
          <li>Celebrate the sitting — whatever the score. Then look at the dashboard together: green is “you’ve got this”, amber is “let’s play with it more”, red is “grown-up help + maybe school”.</li>
          <li>The gap report lists 3 at-home activities per wobbly code. Ten minutes of one of these, three times a week, shifts the needle.</li>
          <li>Re-run the full check-in once a term, plus once mid-term, to watch movement. Same questions each time — that’s what makes scores comparable.</li>
          <li>Print the A4 report for parent–teacher night: it shows the VCAA codes, which teachers recognise instantly.</li>
        </ul>

        <div className="guidance-label">When to worry (and what this isn’t)</div>
        <ul className="activity-list">
          <li>Maths Map is a guided <em>check-in</em>, not a validated diagnostic like NAPLAN, and not a school report. It shows curriculum coverage, not your child’s potential.</li>
          <li>If most codes land in “Needs work”, or maths tears in every sitting, talk to your child’s teacher — a class-wide or learner-wide pattern may mean something else is going on (vision, hearing, attention, anxiety). Your teacher sees across the whole year, you see your child at the kitchen table; both pictures together are the truth.</li>
          <li>Strong results mean “keep stretching”, not “skip ahead” — bring it up with the teacher before introducing Level 2 content at home.</li>
        </ul>

        <div className="guidance-label">Your data</div>
        <ul className="activity-list">
          <li>Everything (profiles, answers, history) stays on this device in the browser. Nothing is uploaded.</li>
          <li>Tap “Backup” in the footer every month or after each check-in — it downloads a JSON file you can keep in your cloud drive. “Restore” merges it back on a new device or fresh browser.</li>
        </ul>

        <div className="guidance-label">The fine print</div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
          Curriculum codes and content are © VCAA, licensed CC-BY-NC 3.0 — non-commercial use. Maths Map wraps them in a parent-made tool and is not affiliated with or endorsed by VCAA.
        </p>
      </div>
    </div>
  );
}
