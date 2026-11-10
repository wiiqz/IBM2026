import { useMemo, useRef, useState } from "react";
import { api, ApiError, fmt, MODES, SAMPLES, type Memo, type Mode, type Session, type TriageResult } from "../api";
import { ErrorState, Kbd, Segmented, Skeleton } from "../components/ui";
import Verdict from "../components/Verdict";
import Rankings from "../components/Rankings";
import Exposure from "../components/Exposure";
import SqlPanel from "../components/SqlPanel";
import MemoCard from "../components/MemoCard";

export function useTriageState() {
  const [query, setQuery] = useState(SAMPLES[0].text);
  const [k, setK] = useState(10);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const reset = () => { setResult(null); setMemo(null); };
  return { query, setQuery, k, setK, mode, setMode, result, setResult, memo, setMemo, reset };
}
export type TriageState = ReturnType<typeof useTriageState>;

const MODE_LABEL: Record<Mode, string> = { keyword: "Keyword", vector: "Vector", hybrid: "Hybrid" };

export default function Triage({ session, state }: { session: Session; state: TriageState }) {
  const { query, setQuery, k, setK, mode, setMode, result, setResult, memo, setMemo } = state;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const run = async () => {
    if (query.trim().length < 3 || busy) { box.current?.focus(); return; }
    setBusy(true);
    setErr(null);
    setMemo(null);
    try {
      setResult(await api.triage(query.trim(), k));
    } catch (e) {
      setResult(null);
      setErr(e as ApiError);
    } finally {
      setBusy(false);
    }
  };

  const modeIds = useMemo(() => new Set((result?.rankings?.[mode] ?? []).map((r) => r.id)), [result, mode]);
  const ok = result && !result.fatal;
  const empty = ok && MODES.every((m) => (result.rankings[m] ?? []).length === 0);

  return (
    <div className="grid gap-6">
      <section aria-label="Query" className="panel p-4 sm:p-5">
        <label htmlFor="q" className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-semibold">Advisory or chat message</span>
          <span className="hidden text-xs text-mute sm:inline">Runs as <span className="font-mono font-semibold text-ink-2">{session.user}</span> · <Kbd>⌘</Kbd> <Kbd>Enter</Kbd></span>
        </label>
        <textarea id="q" ref={box} value={query} onChange={(e) => setQuery(e.target.value)} rows={3} maxLength={4000}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(); }}
          className="field mt-2 min-h-[5.5rem] resize-y text-[15px] leading-6" spellCheck={false} />
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-mute">Try</span>
            {SAMPLES.map((s) => (
              <button key={s.label} onClick={() => setQuery(s.text)}
                className={`rounded-[6px] border px-2.5 py-1 text-[13px] transition-colors duration-150 ${query === s.text ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:border-ink"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs whitespace-nowrap text-mute" id="k-label">Top k</span>
            <Segmented label="Top k" value={String(k)} onChange={(v) => setK(Number(v))}
              options={[5, 10, 20].map((n) => ({ value: String(n), label: <span className="font-mono num">{n}</span> }))} />
            <button className="btn btn-primary min-w-[9.5rem]" onClick={run} disabled={busy} data-testid="run-triage">
              {busy ? "Running…" : "Run triage"}
            </button>
          </div>
        </div>
      </section>

      {busy && <Loading user={session.user} />}
      {!busy && err && <ErrorState kind={err.kind} message={err.message} onRetry={run} />}
      {!busy && result?.fatal && <ErrorState kind={result.fatal.kind} message={result.fatal.message} onRetry={run} />}
      {!busy && !result && !err && <FirstRun />}

      {!busy && ok && (
        <div className="fade-in grid gap-6">
          <RouterLine result={result} />
          {empty ? (
            <div className="panel p-6">
              <p className="font-semibold">No advisory visible to {result.user} matched this text.</p>
              <p className="mt-1 text-sm text-mute">
                Row access control lets this identity read {fmt.int(result.visible_docs)} advisories. Try naming the package or the
                kind of flaw, or sign in as an identity with wider access.
              </p>
            </div>
          ) : (
            <>
              <Verdict result={result} modeIds={modeIds} mode={mode} />
              <section aria-label="Ranked advisories">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.01em]">One statement, three orderings</h2>
                    <p className="mt-0.5 text-sm text-mute">
                      The same candidate set from <code className="font-mono text-[13px] text-ink-2">{result.sql.path}</code>, ranked by each leg.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-mute">Exposure and memo use</span>
                    <Segmented label="Ranking used for exposure and memo" value={mode} onChange={(m) => { setMode(m); setMemo(null); }}
                      options={MODES.map((m) => ({ value: m, label: MODE_LABEL[m] }))} />
                  </div>
                </div>
                <Rankings result={result} mode={mode} />
              </section>
              <SqlPanel result={result} />
              <Exposure result={result} modeIds={modeIds} />
              <MemoCard result={result} mode={mode} memo={memo} setMemo={setMemo} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RouterLine({ result }: { result: TriageResult }) {
  const t = result.timings_ms;
  const exact = result.router.how === "exact scan";
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-hair py-3" data-testid="router-line">
      <p className="flex min-w-0 items-center gap-2.5 text-sm">
        <span className={`rounded-[3px] px-1.5 py-[1px] font-mono text-[11px] font-semibold ${exact ? "bg-ink text-paper" : "bg-accent-wash text-accent-strong"}`}>
          {exact ? "EXACT" : "APPROX"}
        </span>
        <span className="font-medium text-ink">{result.router.line}</span>
      </p>
      <p className="ml-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-mute num">
        <span>embed {fmt.ms(t.embed)}</span>
        <span>triage SQL {fmt.ms(t.triage_sql)}</span>
        <span>docs {fmt.ms(t.docs_sql)}</span>
        <span>exposure {fmt.ms(t.exposure_sql)}</span>
        <span className="text-ink-2">{result.user} · {result.ts}</span>
      </p>
    </div>
  );
}

function Loading({ user }: { user: string }) {
  return (
    <div className="grid gap-6" aria-busy="true" aria-live="polite">
      <p className="text-sm text-mute">Running <span className="font-mono text-ink-2">NEEDLE.TRIAGE_MODE</span> as <span className="font-mono text-ink-2">{user}</span>…</p>
      <Skeleton className="h-[148px] rounded-[6px]" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[420px] rounded-[6px]" />)}
      </div>
    </div>
  );
}

function FirstRun() {
  return (
    <div className="grid gap-4 border-t border-hair pt-6 text-sm text-mute md:grid-cols-3">
      <p><span className="font-semibold text-ink">Ranked advisories.</span> Keyword, vector and fused orderings from one Db2 call, each with its rank in the other legs.</p>
      <p><span className="font-semibold text-ink">Affected services.</span> Exact package and version matches over the synthetic fleet's deploy history, with the date each exposure began.</p>
      <p><span className="font-semibold text-ink">A checked memo.</span> A local model drafts it; any sentence naming an ID, service or status the SQL did not return is removed.</p>
    </div>
  );
}
