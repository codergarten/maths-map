import { useCallback, useEffect, useState } from 'react';
import ProfilesScreen from './screens/ProfilesScreen';
import ChildHomeScreen from './screens/ChildHomeScreen';
import AssessmentScreen from './screens/AssessmentScreen';
import ResultScreen from './screens/ResultScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import PrintReport from './screens/PrintReport';
import GuideModal from './screens/GuideModal';
import FaqModal from './screens/FaqModal';
import { downloadBackup, importBackup, loadProfiles, loadSessions } from './store';
import { CURRICULUM_META } from './curriculum';
import type { Profile, Session } from './types';

export type Screen =
  | { name: 'profiles' }
  | { name: 'home'; profileId: string }
  | { name: 'assessment'; profileId: string; sessionId: string }
  | { name: 'result'; sessionId: string }
  | { name: 'dashboard'; profileId: string }
  | { name: 'history'; profileId: string }
  | { name: 'print'; profileId: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const refresh = useCallback(() => {
    setProfiles(loadProfiles());
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const go = useCallback((s: Screen) => {
    refresh();
    setScreen(s);
  }, [refresh]);

  const handleImport = useCallback((file: File | null) => {
    if (!file) return;
    importBackup(file)
      .then(({ profiles: p, sessions: s }) => {
        setImportMsg(`Imported ${p} profile(s), ${s} session(s).`);
        refresh();
      })
      .catch((err: Error) => setImportMsg(`Import failed: ${err.message}`));
  }, [refresh]);

  if (screen.name === 'print') {
    const profile = profiles.find((p) => p.id === screen.profileId);
    if (!profile) {
      return (
        <div className="app">
          <div className="card">
            <p>That child’s profile no longer exists on this device.</p>
            <button className="btn btn-primary" onClick={() => go({ name: 'profiles' })}>Back to children</button>
          </div>
        </div>
      );
    }
    return (
      <div className="print-area">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="no-print" style={{ position: 'fixed', top: 12, right: 12, zIndex: 50, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={() => go({ name: 'home', profileId: profile.id })}>✕ Close</button>
        </div>
        <PrintReport profile={profile} sessions={sessions} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo" aria-hidden="true">🗺️</span>
        <div>
          <h1>Maths Map</h1>
          <small>Victorian Curriculum F–10 (2.0) · Mathematics · Australia 🇦🇺</small>
        </div>
        <div className="spacer" />
        <button className="backbtn" aria-label="Frequently asked questions" title="FAQ for parents" onClick={() => setShowFaq(true)} style={{ fontSize: 15, fontWeight: 900 }}>FAQ</button>
        <button className="backbtn" aria-label="Grown-ups’ guide" title="Grown-ups’ guide" onClick={() => setShowGuide(true)}>?</button>
        {screen.name !== 'profiles' && (
          <button className="backbtn" aria-label="Back to children" title="All children" onClick={() => go({ name: 'profiles' })}>👨‍👩‍👧</button>
        )}
      </header>
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showFaq && <FaqModal onClose={() => setShowFaq(false)} />}

      {screen.name === 'profiles' && <ProfilesScreen profiles={profiles} onSelect={(id) => go({ name: 'home', profileId: id })} onChanged={refresh} />}
      {screen.name === 'home' && (
        <ChildHomeScreen
          profile={profiles.find((p) => p.id === screen.profileId)!}
          sessions={sessions}
          onStartAssessment={(sessionId) => go({ name: 'assessment', profileId: screen.profileId, sessionId })}
          onDashboard={() => go({ name: 'dashboard', profileId: screen.profileId })}
          onHistory={() => go({ name: 'history', profileId: screen.profileId })}
          onPrint={() => go({ name: 'print', profileId: screen.profileId })}
          onChanged={refresh}
        />
      )}
      {screen.name === 'assessment' && (
        <AssessmentScreen
          profileId={screen.profileId}
          sessionId={screen.sessionId}
          onFinish={(sessionId) => go({ name: 'result', sessionId })}
          onExit={() => go({ name: 'home', profileId: screen.profileId })}
        />
      )}
      {screen.name === 'result' && (
        <ResultScreen
          sessionId={screen.sessionId}
          sessions={sessions}
          onDashboard={() => {
            const s = sessions.find((x) => x.id === screen.sessionId);
            go({ name: 'dashboard', profileId: s?.profileId ?? '' });
          }}
          onDone={() => {
            const s = sessions.find((x) => x.id === screen.sessionId);
            go({ name: 'home', profileId: s?.profileId ?? '' });
          }}
        />
      )}
      {screen.name === 'dashboard' && (
        <DashboardScreen
          profile={profiles.find((p) => p.id === screen.profileId)!}
          sessions={sessions}
          onBack={() => go({ name: 'home', profileId: screen.profileId })}
        />
      )}
      {screen.name === 'history' && (
        <HistoryScreen
          profile={profiles.find((p) => p.id === screen.profileId)!}
          sessions={sessions}
          onBack={() => go({ name: 'home', profileId: screen.profileId })}
        />
      )}

      <footer className="appfoot">
        <div><strong>Maths Map</strong> is a parent-guided check-in tool — not a validated diagnostic. For concerns, please speak with your child&rsquo;s teacher.</div>
        <div>Victorian Curriculum F–10 (2.0) (Australia) · Mathematics · Content © VCAA, licensed <a href={CURRICULUM_META.sourceUrl} target="_blank" rel="noreferrer">CC-BY-NC 3.0</a> · Source &amp; authority: <a href="https://f10.vcaa.vic.edu.au/" target="_blank" rel="noreferrer">f10.vcaa.vic.edu.au</a></div>
        <div>Your data never leaves this device.</div>
        <div className="foot-actions">
          <button className="btn btn-ghost btn-sm" onClick={downloadBackup}>⬇️ Backup</button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            ⬆️ Restore
            <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => handleImport(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {importMsg && <div style={{ marginTop: 6, fontWeight: 600 }}>{importMsg}</div>}
      </footer>
    </div>
  );
}
