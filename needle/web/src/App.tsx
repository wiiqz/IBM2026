import { useCallback, useEffect, useState } from "react";
import { api, ApiError, fmt, setToken, type Config, type Health, type Session } from "./api";
import { Dot } from "./components/ui";
import SignIn from "./views/SignIn";
import Triage, { useTriageState } from "./views/Triage";
import FindingView from "./views/Finding";
import HowItWorks from "./views/HowItWorks";

type View = "triage" | "finding" | "how";
const VIEWS: { id: View; label: string }[] = [
  { id: "triage", label: "Triage" },
  { id: "finding", label: "The finding" },
  { id: "how", label: "How it works" },
];
const viewFromHash = (): View => {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (VIEWS.find((v) => v.id === h)?.id ?? "triage") as View;
};

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="6" fill="#101213" />
      <path d="M8 25 L23 8" stroke="#f3f7f9" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="22" cy="9" rx="2.6" ry="1.3" transform="rotate(-48 22 9)" fill="none" stroke="#009aa6" strokeWidth="1.6" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [health, setHealth] = useState<Health | null>(null);
  const [healthErr, setHealthErr] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchErr, setSwitchErr] = useState<ApiError | null>(null);
  const triage = useTriageState();

  useEffect(() => {
    const on = () => setView(viewFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const loadHealth = useCallback(() => {
    api.health().then((h) => { setHealth(h); setHealthErr(false); }).catch(() => setHealthErr(true));
  }, []);
  useEffect(() => {
    loadHealth();
    api.config().then(setConfig).catch(() => setConfig(null));
    const t = window.setInterval(loadHealth, 15000);
    return () => window.clearInterval(t);
  }, [loadHealth]);

  const go = (v: View) => { window.location.hash = `/${v}`; setView(v); };

  const signedIn = (s: Session) => {
    setToken(s.token);
    setSession(s);
    triage.reset(); // results belong to the identity that ran them
  };
  const signOut = async () => {
    await api.logout().catch(() => undefined);
    setToken(null);
    setSession(null);
    triage.reset();
  };
  const switchTo = async (user: string) => {
    if (!user || user === session?.user) return;
    setSwitching(true);
    setSwitchErr(null);
    try { signedIn(await api.login(user)); } catch (e) { setSwitchErr(e as ApiError); } finally { setSwitching(false); }
  };

  const demo = !!config?.demo_switcher;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-hair bg-ground/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <a href="#/triage" onClick={() => go("triage")} className="flex items-center gap-2.5 text-ink no-underline">
            <Mark />
            <span className="font-mono text-[15px] font-semibold tracking-[0.08em]">NEEDLE</span>
          </a>
          <nav aria-label="Views" className="flex h-full items-stretch gap-1 overflow-x-auto">
            {VIEWS.map((v) => (
              <a key={v.id} href={`#/${v.id}`} onClick={() => go(v.id)} aria-current={view === v.id ? "page" : undefined}
                className={`relative flex items-center px-3 text-sm font-medium whitespace-nowrap no-underline transition-colors duration-150 ${view === v.id ? "text-ink" : "text-mute hover:text-ink"}`}>
                {v.label}
                {view === v.id && <span className="absolute inset-x-3 bottom-0 h-[2px] bg-accent" />}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5">
            <div className="hidden items-center gap-4 md:flex">
              <Dot ok={healthErr ? false : health ? health.db.ok : null} label={`Db2 ${health?.db.database ?? ""}`.trim()}
                detail={healthErr ? "API not reachable" : health?.db.detail} />
              <Dot ok={healthErr ? false : health ? health.ollama.ok : null} label="Ollama"
                detail={healthErr ? "API not reachable" : health ? `${health.ollama.detail}; ${health.ollama.embed_model} ${health.ollama.embed_ok ? "ready" : "missing"}, ${health.ollama.llm_model} ${health.ollama.llm_ok ? "ready" : "missing"}` : undefined} />
            </div>
            {session && !demo && (
              <div className="flex items-center gap-3">
                <IdentityChip user={session.user} visible={session.visible_docs} />
                <button className="text-sm text-mute hover:text-ink" onClick={signOut}>Sign out</button>
              </div>
            )}
            {demo && (
              <label className="flex items-center gap-2">
                <span className="sr-only">Demo identity</span>
                <select value={session?.user ?? ""} disabled={switching} onChange={(e) => switchTo(e.target.value)}
                  data-testid="demo-identity"
                  className="h-9 rounded-[6px] border border-rule bg-paper pr-8 pl-3 font-mono text-[13px] font-semibold">
                  <option value="" disabled>Pick a demo identity</option>
                  {config!.demo_users.map((u) => <option key={u.user} value={u.user}>{u.user}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>
        {demo && (
          <div className="border-t border-amber/25 bg-amber-wash">
            <div className="mx-auto flex max-w-[1600px] items-center gap-x-4 px-4 py-1.5 text-xs text-amber sm:px-6 lg:px-8">
              <span className="shrink-0 font-mono font-semibold tracking-[0.02em]" data-testid="demo-badge">DEMO IDENTITY SWITCHER — NOT AUTHENTICATION</span>
              <span className="hidden min-w-0 truncate lg:inline">Passwords for these identities come from the server's .env. Default mode: sign in with your own Db2 user.</span>
              {switchErr && <span className="font-semibold text-affected">{switchErr.message}</span>}
              {session && <span className="ml-auto shrink-0 font-mono text-ink-2 num">{fmt.int(session.visible_docs)} advisories visible to {session.user}</span>}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1600px] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        {view === "triage" && (
          session
            ? <Triage key={session.user} session={session} state={triage} />
            : <SignIn demo={demo} demoUsers={config?.demo_users ?? []} health={health} onSignedIn={signedIn} />
        )}
        {view === "finding" && <FindingView session={session} demo={demo} />}
        {view === "how" && <HowItWorks />}
      </main>
    </div>
  );
}

function IdentityChip({ user, visible }: { user: string; visible: number | null }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[6px] border border-hair bg-paper py-1 pr-2.5 pl-1.5" data-testid="identity">
      <span className="rounded-[3px] bg-ink px-1.5 py-[1px] font-mono text-[12px] font-semibold text-paper">{user}</span>
      <span className="font-mono text-xs text-mute num">{fmt.int(visible)} visible</span>
    </span>
  );
}
