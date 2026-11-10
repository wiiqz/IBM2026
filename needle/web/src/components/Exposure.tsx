import { useMemo, useState, type ReactNode } from "react";
import { fmt, type ExposureRow, type Status, type TriageResult } from "../api";
import { StatusLabel } from "./ui";

const ORDER: Status[] = ["AFFECTED", "NOT_CONFIRMED", "UNKNOWN_COVERAGE", "PREVIOUSLY_AFFECTED"];
const MEANS: Record<Status, string> = {
  AFFECTED: "The deployed version is listed by the advisory: an exact package and version match in NEEDLE.ADV_AFFECTED.",
  NOT_CONFIRMED: "The service deploys the package, but the deployed version is not listed. The advisory may use ranges, or the data may be incomplete. It is not a clean bill of health.",
  UNKNOWN_COVERAGE: "The advisory names a package the service deploys, but OSV gives only version ranges for it, with no enumerated versions. Not checked.",
  PREVIOUSLY_AFFECTED: "An earlier, now-ended run of listed versions in the deploy history.",
};

/* One line per service + package + version (+ window for past exposure); the advisories that hit it are listed
   together, so the tab counts and the verdict slab both count services. */
interface Group {
  key: string; service: string; team: string; pkg: string; version: string | null; since: string | null;
  until: string | null; days: number | null; versions: string | null; ids: string[];
}
function group(rows: ExposureRow[], status: Status): Group[] {
  const m = new Map<string, Group>();
  for (const r of rows) {
    const key = [r.SERVICE, r.PACKAGE, r.VERSION_NOW, status === "PREVIOUSLY_AFFECTED" ? `${r.EXPOSED_SINCE}|${r.EXPOSED_UNTIL}` : ""].join("|");
    const g = m.get(key) ?? { key, service: r.SERVICE, team: r.OWNER_TEAM, pkg: r.PACKAGE, version: r.VERSION_NOW, since: r.EXPOSED_SINCE,
      until: r.EXPOSED_UNTIL, days: r.DAYS_EXPOSED, versions: r.VERSIONS, ids: [] };
    if (r.EXPOSED_SINCE && (!g.since || r.EXPOSED_SINCE < g.since)) g.since = r.EXPOSED_SINCE;
    if (r.DAYS_EXPOSED != null && (g.days == null || r.DAYS_EXPOSED > g.days)) g.days = r.DAYS_EXPOSED;
    if (!g.ids.includes(r.ADV_ID)) g.ids.push(r.ADV_ID);
    m.set(key, g);
  }
  const list = [...m.values()];
  return status === "AFFECTED" ? list.sort((a, b) => (b.days ?? 0) - (a.days ?? 0))
    : status === "PREVIOUSLY_AFFECTED" ? list.sort((a, b) => String(a.since).localeCompare(String(b.since)))
      : list.sort((a, b) => a.service.localeCompare(b.service));
}

export default function Exposure({ result, modeIds }: { result: TriageResult; modeIds: Set<string> }) {
  const rows = useMemo(() => result.exposure.filter((r) => modeIds.has(r.ADV_ID)), [result, modeIds]);
  const counts = useMemo(() => Object.fromEntries(ORDER.map((s) => [s, new Set(rows.filter((r) => r.STATUS === s).map((r) => r.SERVICE)).size])) as Record<Status, number>, [rows]);
  const [tab, setTab] = useState<Status>(() => ORDER.find((s) => counts[s] > 0) ?? "AFFECTED");
  if (result.exposure_error) return null;
  const shown = group(rows.filter((r) => r.STATUS === tab), tab);
  const dated = tab === "AFFECTED" || tab === "PREVIOUSLY_AFFECTED";

  return (
    <section aria-label="Affected services" className="panel overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pt-4 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em]">Services and since when</h2>
          <p className="mt-0.5 text-sm text-mute">
            <code className="font-mono text-[13px] text-ink-2">SBOM_COMPONENT FOR BUSINESS_TIME AS OF CURRENT DATE</code>, joined to the deploy history.
          </p>
        </div>
        <span className="rounded-[3px] border border-amber/40 bg-amber-wash px-1.5 py-[1px] font-mono text-[11px] font-semibold text-amber">SYNTHETIC FLEET · real PyPI versions</span>
      </div>
      <div role="tablist" aria-label="Exposure status, services per status" className="mt-3 flex gap-1 overflow-x-auto border-b border-hair px-3 sm:px-4">
        {ORDER.map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}
            className="relative flex shrink-0 items-center gap-2 px-2 py-2.5 whitespace-nowrap">
            <StatusLabel status={s} />
            <span className={`font-mono text-xs num ${tab === s ? "font-semibold text-ink" : "text-mute"}`}>{counts[s]}</span>
            {tab === s && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-ink" />}
          </button>
        ))}
      </div>
      <p className="px-4 pt-3 text-xs text-mute sm:px-5">{MEANS[tab]}</p>
      {shown.length === 0 ? (
        <p className="px-4 py-6 text-sm text-mute sm:px-5">
          {tab === "AFFECTED"
            ? "No exact package and version match for the ranked advisories. That is not a clean bill of health: see NOT_CONFIRMED."
            : `No ${tab} services for these advisories.`}
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-hair bg-surface/60 text-left text-xs text-mute">
                <Th>Service</Th><Th>Team</Th><Th>Package</Th><Th>Version now</Th><Th>Advisories</Th>
                {dated && <><Th>Exposed since</Th>{tab === "PREVIOUSLY_AFFECTED" && <Th>Fixed on</Th>}<Th right>Days</Th><Th>Listed versions in window</Th></>}
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.key} className="border-b border-hair last:border-b-0 hover:bg-ground">
                  <Td className="font-semibold">{g.service}</Td>
                  <Td className="text-mute">{g.team}</Td>
                  <Td mono>{g.pkg}</Td>
                  <Td mono>{g.version ?? "–"}</Td>
                  <Td mono className="whitespace-normal">
                    <span className="flex max-w-[22rem] flex-wrap gap-x-3 gap-y-0.5">
                      {g.ids.map((id) => <a key={id} href={`https://osv.dev/vulnerability/${id}`} target="_blank" rel="noreferrer noopener">{id}</a>)}
                    </span>
                  </Td>
                  {dated && <>
                    <Td mono>{g.since?.slice(0, 10) ?? "–"}</Td>
                    {tab === "PREVIOUSLY_AFFECTED" && <Td mono>{g.until?.slice(0, 10) ?? "–"}</Td>}
                    <Td mono right className={tab === "AFFECTED" ? "font-semibold text-affected" : ""}>{fmt.int(g.days)}</Td>
                    <Td mono className="text-mute">{g.versions ?? "–"}</Td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2 font-medium whitespace-nowrap first:pl-4 sm:first:pl-5 ${right ? "text-right" : ""}`}>{children}</th>;
}
function Td({ children, mono, right, className = "" }: { children: ReactNode; mono?: boolean; right?: boolean; className?: string }) {
  return <td className={`px-4 py-2 align-top whitespace-nowrap first:pl-4 sm:first:pl-5 ${mono ? "font-mono text-[13px] num" : ""} ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}
