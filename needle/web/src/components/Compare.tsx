import { useState } from "react";
import { api, ApiError, fmt, SAMPLES, type Compare as CompareT, type Session } from "../api";
import { ErrorState, Skeleton, Tag } from "./ui";

export default function Compare({ session, demo }: { session: Session | null; demo: boolean }) {
  const [query, setQuery] = useState(SAMPLES[1].text);
  const [res, setRes] = useState<CompareT | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const run = async () => {
    setBusy(true);
    setErr(null);
    try { setRes(await api.compare(query.trim(), 10)); } catch (e) { setErr(e as ApiError); } finally { setBusy(false); }
  };
  const ready = !!session && demo;

  // ids that one identity sees and another does not (computed from what each identity's own Db2 call returned)
  const seenBy = new Map<string, string[]>();
  for (const i of res?.identities ?? []) for (const r of i.rankings?.hybrid ?? []) seenBy.set(r.id, [...(seenBy.get(r.id) ?? []), i.user]);

  return (
    <section aria-labelledby="compare-title" className="border-t border-hair pt-10" data-testid="compare">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="compare-title" className="text-xl font-semibold tracking-[-0.01em]">Same query, three Db2 identities</h2>
          <p className="mt-1 max-w-[72ch] text-sm text-mute">
            Each column is its own Db2 connection. Nothing is filtered in the app: what a column lacks, Db2 did not return to that identity.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input className="field max-w-[760px] flex-1 font-mono text-[13px]" value={query} onChange={(e) => setQuery(e.target.value)}
          aria-label="Query to compare" maxLength={4000} />
        <button className="btn btn-primary" onClick={run} disabled={!ready || busy || query.trim().length < 3} data-testid="compare-btn">
          {busy ? "Running three times…" : "Compare identities"}
        </button>
      </div>
      {!ready && (
        <p className="mt-3 text-sm text-mute">
          {demo ? "Pick a demo identity in the top bar first." : "Comparing signs in as three demo identities, so it needs the demo identity switcher (NEEDLE_DEMO_SWITCHER=1). With your own sign-in, run the same query on the Triage page as each user."}
        </p>
      )}
      {err && <div className="mt-4"><ErrorState kind={err.kind} message={err.message} onRetry={run} /></div>}
      {busy && <div className="mt-5 grid gap-4 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>}
      {!busy && res && (
        <div className="fade-in mt-5 grid gap-4 lg:grid-cols-3">
          {res.identities.map((i) => (
            <div key={i.user} className="panel min-w-0 overflow-hidden">
              <div className="border-b border-hair px-4 py-3">
                <p className="flex items-center justify-between gap-3">
                  <span className="rounded-[3px] bg-ink px-1.5 py-[1px] font-mono text-[12px] font-semibold text-paper">{i.user}</span>
                  <span className="font-mono text-xs text-mute num">{fmt.int(i.visible_docs ?? null)} visible</span>
                </p>
                <p className="mt-1.5 text-xs text-mute">{i.role}</p>
              </div>
              {i.fatal ? (
                <div className="p-4"><ErrorState kind={i.fatal.kind} message={i.fatal.message} /></div>
              ) : (
                <>
                  <dl className="grid grid-cols-3 border-b border-hair text-center">
                    <Cell label="hybrid rows" value={`${i.rankings?.hybrid.length ?? 0} of ${res.k}`} />
                    <Cell label="router" value={i.router?.how === "exact scan" ? "exact" : `approx ${i.router?.depth}`} />
                    <Cell label="embargoed" value={String(i.embargoed_ids?.length ?? 0)} red={!!i.embargoed_ids?.length} />
                  </dl>
                  <p className="border-b border-hair px-4 py-2 text-xs text-ink-2">{i.router?.line}</p>
                  <ol className="py-1">
                    {(i.rankings?.hybrid ?? []).map((r) => {
                      const d = i.docs?.[r.id];
                      const only = (seenBy.get(r.id) ?? []).length < res.identities.filter((x) => !x.fatal).length;
                      return (
                        <li key={r.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-1.5">
                          <span className="font-mono text-xs text-mute num">{r.rank}</span>
                          <span className="min-w-0 truncate font-mono text-[13px] font-semibold">{r.id}</span>
                          <span className="flex gap-1">
                            {d?.embargoed && <Tag tone="red">EMBARGOED</Tag>}
                            {only && <Tag tone="accent" title={`Returned to: ${(seenBy.get(r.id) ?? []).join(", ")}`}>not for all</Tag>}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Cell({ label, value, red }: { label: string; value: string; red?: boolean }) {
  return (
    <div className="border-r border-hair px-2 py-2.5 last:border-r-0">
      <dd className={`font-mono text-sm font-semibold num ${red ? "text-affected" : ""}`}>{value}</dd>
      <dt className="text-[11px] text-mute">{label}</dt>
    </div>
  );
}
