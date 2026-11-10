import { useEffect, useRef, useState } from "react";
import { api, fmt, type Finding } from "../api";
import type { CloudInfo, CloudQuery, CloudScene, Lens } from "../components/CloudScene";

const QUERY_LABEL: Record<string, string> = { pyyaml: "PyYAML message", flashpix: "Pillow FlashPix" };
const STEPS = [
  { obj: "CALL NEEDLE.TRIAGE_MODE", says: "Keyword rank (BM25 in plain SQL) and meaning rank (DiskANN vector index, FETCH APPROX), fused by reciprocal rank fusion in one Db2 statement." },
  { obj: "CREATE PERMISSION", says: "Row access control decides which advisories each Db2 identity can read. Embargoed ones never leave Db2 for a junior analyst." },
  { obj: "FOR BUSINESS_TIME AS OF", says: "An exact package and version join over each service's deploy history says who is affected, and since when." },
];

export default function Landing() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-b border-hair py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
          <h2 className="max-w-[16ch] font-display text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">One statement does three jobs</h2>
          <dl className="border-t border-hair">
            {STEPS.map((s) => (
              <div key={s.obj} className="grid gap-1 border-b border-hair py-5 sm:grid-cols-[250px_minmax(0,1fr)] sm:gap-8">
                <dt className="font-mono text-[13px] font-semibold text-accent-strong">{s.obj}</dt>
                <dd className="text-md text-ink-2">{s.says}</dd>
              </div>
            ))}
          </dl>
        </section>
        <FindingTeaser />
        <section className="flex flex-wrap items-center justify-between gap-6 py-16">
          <p className="max-w-[40ch] font-display text-2xl font-semibold tracking-[-0.02em]">Paste the rumour from the chat thread. Get the services, and since when.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#/triage" className="btn btn-primary no-underline">Open the triage console</a>
            <a href="#/how" className="text-sm">How it works</a>
          </div>
        </section>
      </div>
      <footer className="border-t border-hair">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-6 text-xs text-mute sm:px-6 lg:px-8">
          <span><span className="font-mono font-semibold tracking-[0.08em] text-ink">NEEDLE</span> · team Needlepoint · IBM Db2Hack 2026</span>
          <span>Advisories: the OSV PyPI export. The service fleet is synthetic. Runs on 127.0.0.1 against your own Db2.</span>
        </div>
      </footer>
    </>
  );
}

function Hero() {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CloudScene | null>(null);
  const [info, setInfo] = useState<CloudInfo | null>(null);
  const [q, setQ] = useState("pyyaml");
  const [who, setWho] = useState<"all" | "p10">("all");
  const [plan, setPlan] = useState<"shared" | "router">("shared");
  const [ready, setReady] = useState(false);
  const [nogl, setNogl] = useState(false);
  const [paused, setPaused] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const lens: Lens = who === "all" ? "all" : plan === "shared" ? "p10-shared" : "p10-router";
  const query: CloudQuery | undefined = info?.queries.find((x) => x.key === q);

  useEffect(() => {
    let disposed = false;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("../components/CloudScene").then(async ({ CloudScene: Scene, loadCloud }) => {
      const data = await loadCloud();
      if (disposed || !host.current) return;
      try {
        const s = new Scene(host.current, data, still);
        s.onFrame = (p) => {
          const el = label.current;
          if (!el) return;
          el.style.opacity = p ? "1" : "0";
          if (!p) return;
          const flip = host.current ? p.x > host.current.clientWidth - 150 : false;
          el.style.transform = `translate(${Math.round(flip ? p.x - 118 : p.x)}px, ${Math.round(p.y)}px)`;
        };
        sceneRef.current = s;
        setInfo(data.info);
        requestAnimationFrame(() => setReady(true));
      } catch {
        setInfo(data.info);
        setNogl(true);
      }
    }).catch(() => setNogl(true));
    const io = new IntersectionObserver(([e]) => sceneRef.current?.setRunning(e.isIntersecting));
    if (host.current) io.observe(host.current);
    return () => { disposed = true; io.disconnect(); sceneRef.current?.dispose(); sceneRef.current = null; };
  }, []);

  useEffect(() => { if (query) sceneRef.current?.setState(query, lens); }, [query, lens, ready]);
  useEffect(() => { sceneRef.current?.setAuto(!paused); }, [paused, ready]);

  const batchVisible = query?.batch_visible_p10 ?? 0;
  const readout = !info || !query ? null
    : lens === "all" ? { n: "10 of 10", tone: "text-[#5fdbe3]", line: `All ${fmt.int(info.n)} public advisories visible. The 10 nearest to the question are lit.` }
      : lens === "p10-shared" ? { n: `${batchVisible} of 10`, tone: "text-affected-ink", line: `The vector index fetches the ${info.batch} nearest, sized as if this analyst saw half the rows. The permission removes ${info.batch - batchVisible} (red). ${batchVisible} ${batchVisible === 1 ? "comes" : "come"} back.` }
        : { n: "10 of 10", tone: "text-[#5fdbe3]", line: `NEEDLE counts the ${fmt.int(info.p10_visible)} rows this analyst may read and runs an exact scan over them instead.` };

  return (
    <section aria-label="NEEDLE" className={`relative overflow-hidden bg-[#0b0d0e] text-paper ${paused ? "hero-paused" : ""}`} data-testid="hero">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 58% 62% at 66% 46%, #172124 0%, #0f1416 52%, #0a0c0d 100%)" }} />

      <div className="relative grid min-h-[calc(100svh-56px)] lg:block lg:h-[calc(100svh-56px)] lg:max-h-[1000px] lg:min-h-[640px]">
        <div ref={host} className={`relative h-[58svh] min-h-[340px] transition-opacity duration-700 ease-out lg:absolute lg:inset-0 lg:h-auto ${ready ? "opacity-100" : "opacity-0"}`}
          role="img" aria-label="Point cloud of the public advisories with a nearest-neighbour graph. Drag to turn it." />
        <div aria-hidden className="hero-vignette pointer-events-none lg:inset-0" />
        <div aria-hidden className="hero-grain pointer-events-none" />
        <div ref={label} aria-hidden className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-300">
          <span className="ml-3 -translate-y-1/2 inline-block whitespace-nowrap rounded-[3px] bg-paper px-1.5 py-[1px] font-mono text-[11px] font-semibold text-ink">your question</span>
        </div>
        {nogl && <p className="absolute top-6 left-6 text-sm text-slab-mute">The 3D view needs WebGL; everything below works without it.</p>}

        <div className="pointer-events-none relative z-10 mx-auto flex max-w-[1600px] flex-col justify-end gap-8 px-4 pb-10 sm:px-6 lg:h-full lg:px-8 lg:pb-14">
          <div className="pointer-events-auto hidden max-w-[40ch] lg:absolute lg:top-8 lg:block">
            <p className="font-mono text-[11px] leading-4 text-slab-mute">
              {info ? `${fmt.int(info.n)} public advisories, each placed by its meaning (nomic-embed-text, 768 dimensions to 3D by PCA). The faint lines link near neighbours; the pulses walk them toward the question, the way a DiskANN index search moves (an illustration). Drag to turn.` : "\u00a0"}
            </p>
            <button onClick={() => setPaused(!paused)} aria-pressed={paused} data-testid="pause-motion"
              className="mt-3 rounded-[4px] border border-slab-rule px-2.5 py-1 text-xs text-[#c9d2d5] transition-colors duration-150 hover:border-slab-mute hover:text-paper">
              {paused ? "Play motion" : "Pause motion"}
            </button>
          </div>
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="pointer-events-auto">
              <h1 className="font-display text-[clamp(3.4rem,8.6vw,8.75rem)] leading-[0.86] font-semibold tracking-[-0.045em]">
                Find the<br />needle.
              </h1>
              <p className="mt-6 max-w-[48ch] text-[17px] leading-7 text-[#c9d2d5]">
                Vulnerability triage inside IBM Db2. Paste a vague advisory: one SQL statement finds it by keyword and by
                meaning, row access control decides what you may see, and a temporal SBOM join names the services it hits.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <a href="#/triage" className="btn btn-primary no-underline" data-testid="hero-cta">Open the triage console</a>
                <a href="#/finding" className="text-sm text-[#9fe3e8] hover:text-paper">Read the finding</a>
              </div>
            </div>
            {info && query && readout && (
              <div className="pointer-events-auto rounded-[6px] border border-slab-rule bg-[#0e1213]/85 p-4 backdrop-blur-[2px]" data-testid="hero-controls">
                <Ctl label="Question" value={q} onChange={setQ} options={info.queries.map((x) => ({ value: x.key, label: QUERY_LABEL[x.key] ?? x.key }))} />
                <Ctl label="Seen by" value={who} onChange={setWho} options={[{ value: "all", label: "Full visibility" }, { value: "p10", label: "10% analyst" }]} />
                {who === "p10" && <Ctl label="Search" value={plan} onChange={setPlan} options={[{ value: "shared", label: "Shared plan" }, { value: "router", label: "NEEDLE router" }]} />}
                <div className="mt-3 border-t border-slab-rule pt-3" aria-live="polite">
                  <p className={`font-mono text-2xl font-semibold num ${readout.tone}`}>{readout.n} <span className="text-sm font-medium text-slab-mute">rows</span></p>
                  <p className="mt-1 text-[13px] leading-5 text-[#b7c1c4]">{readout.line}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Ctl<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="mt-2 grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 first:mt-0">
      <span className="text-xs text-slab-mute">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-[5px] border border-slab-rule p-0.5">
        {options.map((o) => (
          <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
            className={`min-h-8 flex-1 rounded-[3px] px-2 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-150 ${value === o.value ? "bg-paper text-ink" : "text-[#c9d2d5] hover:bg-slab-2"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FindingTeaser() {
  const [f, setF] = useState<Finding | null>(null);
  useEffect(() => { api.finding().then(setF).catch(() => setF(null)); }, []);
  if (!f) return null;
  const p10 = f.selectivity.series.rcac[0], r10 = f.selectivity.series.router[0];
  return (
    <section className="grid gap-10 border-b border-hair py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-24">
      <div>
        <h2 className="font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
          Ask Db2 for 10.<br />Get <span className="text-affected">{Math.round(p10.rows)}</span>.
        </h2>
        <p className="mt-5 max-w-[56ch] text-md text-ink-2">
          Under row access control every analyst shares one plan, and that plan sizes the vector index's first batch as
          if everyone could see about half the rows. An analyst who sees {Math.round(p10.x)}% asks for 10 and gets about{" "}
          {Math.round(p10.rows)}. NEEDLE measured it, found the cause, and routes around it.
        </p>
        <a href="#/finding" className="mt-5 inline-block text-sm">Read the finding</a>
      </div>
      <dl className="grid grid-cols-2 content-end gap-x-8 gap-y-6">
        <Big value={fmt.dec(p10.recall)} label={`recall@10 at ${Math.round(p10.x)}% visible, shared plan`} red />
        <Big value={fmt.dec(r10.recall)} label="same analyst, NEEDLE router" />
        <Big value={fmt.dec(f.estimate.permission_ff)} label="the one permission estimate, every user" />
        <Big value={`${f.correlated.p10_zero_rows} / ${f.correlated.queries}`} label="queries with no rows when visibility follows topics" red />
      </dl>
    </section>
  );
}

function Big({ value, label, red }: { value: string; label: string; red?: boolean }) {
  return (
    <div className="border-t border-ink pt-3">
      <dd className={`font-mono text-3xl font-semibold num ${red ? "text-affected" : "text-ink"}`}>{value}</dd>
      <dt className="mt-1 text-xs text-mute">{label}</dt>
    </div>
  );
}
