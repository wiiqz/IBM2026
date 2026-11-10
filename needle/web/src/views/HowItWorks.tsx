import { evidenceUrl } from "../api";

const LOCAL = [
  { name: "React UI", where: "127.0.0.1", says: "Sends your text and k. Holds no SQL and no credentials beyond a session token in memory." },
  { name: "FastAPI · needle.api", where: "127.0.0.1:8600", says: "Signs in as your Db2 user and keeps the password in process memory only. Calls service.do_run." },
  { name: "Router · needle.triage", where: "COUNT(*) under RCAC", says: "Counts what your identity may read and picks the search depth: the vector index, or an exact scan." },
  { name: "Ollama", where: "localhost:11434", says: "nomic-embed-text turns the query into 768 floats. A small local model drafts the memo." },
];
const DB2 = [
  { name: "Vector leg", sql: "ORDER BY VECTOR_DISTANCE(EMB, ?, COSINE)\nFETCH APPROX FIRST depth ROWS ONLY", says: "IXSCAN on the DiskANN index NEEDLE.ADV_DOC_VIX." },
  { name: "Keyword leg", sql: "NEEDLE.BM25_SEARCH(?)", says: "BM25 written in plain SQL over NEEDLE.POSTING, one LATERAL lookup per term." },
  { name: "Fusion", sql: "RANK() per leg, FULL OUTER JOIN\nRRF = Σ 1 / (60 + rank)", says: "Reciprocal rank fusion in the same statement." },
  { name: "Exposure", sql: "SBOM_COMPONENT FOR BUSINESS_TIME\nAS OF CURRENT DATE", says: "Exact package and version join, plus the deploy history for \"since when\"." },
];
const FEATURES = [
  ["VECTOR(768, FLOAT32) + CREATE VECTOR INDEX", "DiskANN index, used by FETCH APPROX with a literal k"],
  ["SQL PL procedure NEEDLE.TRIAGE_MODE", "keyword, vector and fusion in one call; only validated integers are interpolated"],
  ["CREATE PERMISSION / CREATE MASK", "row access on ADV_DOC, POSTING, ADV_ALIAS, ADV_AFFECTED; a mask on SUMMARY"],
  ["PERIOD BUSINESS_TIME", "application-period temporal SBOM history: affected since when"],
  ["EXPLAIN + db2exfmt, MON_GET_PKG_CACHE_STMT", "the evidence that every RCAC user shares one plan and one estimate"],
  ["Least-privilege GRANTs", "analysts get SELECT and EXECUTE only; BM25 statistics are not readable by them"],
];
const EVIDENCE = [
  ["docs/evidence/rcac_real.md", "The finding: recall vs visibility, the shared plan, the router"],
  ["docs/evidence/g1_vector_index.md", "Access plans: IXSCAN on the vector index, and why k must be a literal"],
  ["docs/evidence/eval_final.md", "Retrieval quality: hybrid vs vector vs BM25 on realistic paraphrases"],
  ["docs/evidence/rcac_posting_overhead.md", "The 9x RCAC slowdown in the keyword leg, and the LATERAL fix"],
  ["docs/evidence/triage_router_explain.md", "The router's depth per identity, with plans"],
  ["eval/results/rcac_recall_vs_selectivity.json", "The numbers behind the Finding charts"],
];

export default function HowItWorks() {
  return (
    <article className="grid gap-12">
      <header className="max-w-[72ch]">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">One Db2 statement, on your own connection</h1>
        <p className="mt-3 text-md text-ink-2">
          Retrieval, permission and exposure all happen inside IBM Db2 12.1.5. The app on your machine embeds the text,
          signs in as you, and shows what Db2 returned.
        </p>
      </header>

      <section aria-label="Architecture" className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="grid content-start gap-2">
          <p className="text-xs font-semibold text-mute">On your machine</p>
          {LOCAL.map((b, i) => (
            <div key={b.name}>
              <div className="panel p-4">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{b.name}</span>
                  <span className="font-mono text-xs text-mute">{b.where}</span>
                </p>
                <p className="mt-1 text-sm text-ink-2">{b.says}</p>
              </div>
              {i < LOCAL.length - 1 && <div className="ml-6 h-3 w-px bg-rule" aria-hidden />}
            </div>
          ))}
          <p className="mt-2 rounded-[6px] border border-dashed border-rule px-4 py-3 font-mono text-[12.5px] text-ink-2">
            CALL NEEDLE.TRIAGE_MODE(?, ?, ?, depth, 'HYBRID')<br />
            <span className="text-mute">on the analyst's own connection, through the SSH tunnel to Db2</span>
          </p>
        </div>

        <div className="self-start rounded-[6px] bg-slab p-4 text-paper sm:p-5">
          <p className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">IBM Db2 12.1.5 · database VECDB</span>
            <span className="font-mono text-xs text-slab-mute">GitHub Codespace</span>
          </p>
          <div className="mt-3 rounded-[4px] border border-affected-ink/50 px-3 py-2 text-sm">
            <span className="font-mono text-[12px] font-semibold text-affected-ink">ROW ACCESS CONTROL</span>
            <span className="ml-2 text-slab-mute">applies to every leg below, keyed on SESSION_USER</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DB2.map((b) => (
              <div key={b.name} className="rounded-[4px] bg-slab-2 p-3">
                <p className="text-sm font-semibold">{b.name}</p>
                <pre className="mt-2 font-mono text-[11.5px] leading-5 whitespace-pre-wrap text-accent">{b.sql}</pre>
                <p className="mt-2 text-xs text-slab-mute">{b.says}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slab-mute">
            Returns ADV_ID, RRF, KW_RANK, VEC_RANK, VEC_DIST for the rows this identity may read. The memo's verifier
            then checks every sentence against these rows.
          </p>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold tracking-[-0.01em]">Db2 features in use</h2>
          <dl className="border-t border-hair">
            {FEATURES.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-hair py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6">
                <dt className="font-mono text-[13px] font-semibold text-accent-strong">{k}</dt>
                <dd className="text-sm text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-semibold tracking-[-0.01em]">Evidence for every number</h2>
          <ul className="border-t border-hair">
            {EVIDENCE.map(([path, what]) => (
              <li key={path} className="border-b border-hair py-3">
                <a href={evidenceUrl(path)} target="_blank" rel="noreferrer" className="font-mono text-[13px]">{path}</a>
                <p className="mt-0.5 text-sm text-mute">{what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
