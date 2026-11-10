import { useEffect, useState } from "react";
import { api, ApiError, evidenceUrl, fmt, type Finding, type Session } from "../api";
import { ErrorState, Skeleton } from "../components/ui";
import RecallChart, { Legend } from "../components/RecallChart";
import Compare from "../components/Compare";

export default function FindingView({ session, demo }: { session: Session | null; demo: boolean }) {
  const [f, setF] = useState<Finding | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);
  useEffect(() => { api.finding().then(setF).catch((e) => setErr(e)); }, []);
  if (err) return <ErrorState kind={err.kind} message={err.message} />;
  if (!f) return <div className="grid gap-4"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-80" /></div>;

  const s = f.selectivity.series;
  const p10 = s.rcac[0], p10w = s.where[0];
  const k = 10;
  const data = { rcac: s.rcac, where: s.where, router: s.router };

  return (
    <article className="grid gap-12">
      <header className="grid gap-6 border-b border-hair pb-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Ask Db2 for {k}. Get <span className="text-affected">{Math.round(p10.rows)}</span>.
          </h1>
          <p className="mt-4 max-w-[62ch] text-md text-ink-2">
            Under row access control, Db2's vector index search returns far fewer rows than asked for to any analyst who
            may see only part of the table, and nothing tells the application. NEEDLE measured it, found the cause in
            the optimizer's estimate, and routes around it.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-[6px] border border-hair bg-hair">
          <Stat value={fmt.dec(p10.recall)} label={`recall@${k} for an analyst who sees ${Math.round(p10.x)}% of rows`} red />
          <Stat value={fmt.dec(p10.rows, 2)} label={`rows returned of ${k}, same analyst`} red />
          <Stat value={fmt.dec(f.estimate.permission_ff)} label="the optimizer's one estimate of the permission, for every user" />
          <Stat value={fmt.int(f.estimate.vector_ixscan_est_rows)} label={`candidates the vector index fetches for k = ${k}`} />
        </dl>
      </header>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
        <div className="max-w-[64ch] text-[15px] leading-7 text-ink-2">
          <h2 className="mb-3 text-xl font-semibold tracking-[-0.01em] text-ink">What happens, in plain words</h2>
          <p>
            <code className="font-mono text-[13px] text-ink">FETCH APPROX FIRST {k} ROWS</code> walks the DiskANN index and
            collects a small batch of likely matches first. Filters are applied to that batch.
          </p>
          <p className="mt-3">
            Under row access control, every analyst runs the same cached plan. The optimizer sizes the batch with one
            fixed estimate of the permission, a filter factor of <b className="font-mono text-ink">{fmt.dec(f.estimate.permission_ff)}</b>,
            so <b className="font-mono text-ink">{fmt.int(f.estimate.vector_ixscan_est_rows)}</b> candidates for k = {k}, as if
            every user could see about half the rows. Then the permission drops the rows this analyst may not see.
          </p>
          <p className="mt-3">
            An analyst who sees {Math.round(p10.x)}% of rows asks for {k} and gets <b className="font-mono text-affected">{fmt.dec(p10.rows, 2)}</b> on
            average. The answer looks complete. Write the same permission as a literal <code className="font-mono text-[13px] text-ink">WHERE</code> and
            the optimizer sees it: recall rises from {fmt.dec(p10.recall)} to {fmt.dec(p10w.recall)}.
          </p>
          <p className="mt-3">
            So the cause is how visible the predicate is to the optimizer. It is a selectivity-estimation and filtered
            top-k interaction, not an RCAC defect. RCAC makes it unavoidable, and invisible to the application.
          </p>
        </div>
        <div className="grid content-start gap-4">
          <Legend />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <RecallChart data={data} metric="recall" title={`Recall@${k}`} />
            <RecallChart data={data} metric="rows" title={`Rows returned of ${k}`} />
          </div>
          <p className="text-xs text-mute">
            {f.selectivity.n_queries} held-out queries, {f.selectivity.db2}. Source{" "}
            <a href={evidenceUrl(f.sources.selectivity)} target="_blank" rel="noreferrer">{f.sources.selectivity}</a>.
          </p>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-16">
        <div className="max-w-[64ch] text-[15px] leading-7 text-ink-2">
          <h2 className="mb-3 text-xl font-semibold tracking-[-0.01em] text-ink">The fix: count first, then choose</h2>
          <p>
            Before it searches, NEEDLE's router counts how many advisories the signed-in identity may read. Narrow
            visibility gets an exact scan; wide visibility gets the vector index with a deeper search list. Every triage
            run shows the choice it made.
          </p>
          <p className="mt-3">
            The worst case is visibility by topic, when the visible {Math.round(f.correlated.coverage_by_p["10"] * 100)}% is
            whole clusters of related advisories: <b className="font-mono text-affected">{f.correlated.p10_zero_rows}</b> of{" "}
            {f.correlated.queries} queries returned <b className="text-ink">no rows at all</b> through the index.
            Source <a href={evidenceUrl(f.sources.correlated)} target="_blank" rel="noreferrer">{f.sources.correlated}</a>.
          </p>
        </div>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hair bg-surface/60 text-left text-xs text-mute">
                <th className="px-4 py-2 font-medium">Identity</th>
                <th className="px-4 py-2 text-right font-medium">Visible</th>
                <th className="px-4 py-2 text-right font-medium">Shared plan</th>
                <th className="px-4 py-2 font-medium">Router chose</th>
                <th className="px-4 py-2 text-right font-medium">Router recall</th>
                <th className="px-4 py-2 text-right font-medium">Rows</th>
              </tr>
            </thead>
            <tbody>
              {s.router.map((r, i) => (
                <tr key={r.user} className="border-b border-hair last:border-b-0">
                  <td className="px-4 py-2 font-mono text-[13px] font-semibold">{r.user}</td>
                  <td className="px-4 py-2 text-right font-mono text-[13px] num">{fmt.dec(r.x, 0)}%</td>
                  <td className="px-4 py-2 text-right font-mono text-[13px] text-affected num">{fmt.dec(s.rcac[i].recall)}</td>
                  <td className="px-4 py-2 font-mono text-[13px]">{r.mode === "EXACT" ? "exact scan" : `index, depth ${r.depth}, L ${r.L}`}</td>
                  <td className="px-4 py-2 text-right font-mono text-[13px] font-semibold text-accent-strong num">{fmt.dec(r.recall)}</td>
                  <td className="px-4 py-2 text-right font-mono text-[13px] num">{fmt.dec(r.rows, 0)} of {k}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-hair px-4 py-2 text-xs text-mute">
            Held-out recall@{k}, {s.router.reduce((a, r) => a + (r.fallbacks ?? 0), 0)} fallbacks. No returned row was outside
            the identity's permission in any cell: <a href={evidenceUrl(f.sources.write_up)} target="_blank" rel="noreferrer">{f.sources.write_up}</a>.
          </p>
        </div>
      </section>

      <Compare session={session} demo={demo} />
    </article>
  );
}

function Stat({ value, label, red }: { value: string; label: string; red?: boolean }) {
  return (
    <div className="flex flex-col justify-between gap-3 bg-paper p-4">
      <dd className={`font-mono text-2xl font-semibold num ${red ? "text-affected" : "text-ink"}`}>{value}</dd>
      <dt className="text-xs text-mute">{label}</dt>
    </div>
  );
}
