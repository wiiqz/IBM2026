import { useMemo, useState, type ReactNode } from "react";
import { fmt, type ExposureRow, type Status, type TriageResult } from "../api";
import { StatusLabel } from "./ui";

const ORDER: Status[] = ["AFFECTED", "NOT_CONFIRMED", "UNKNOWN_COVERAGE", "PREVIOUSLY_AFFECTED"];
const MEANS: Record<Status, string> = {
  AFFECTED: "The deployed version is listed by the advisory: an exact package and version match in NEEDLE.ADV_AFFECTED.",
  NOT_CONFIRMED: "The service deploys the package, but the deployed version is not listed. The advisory may use ranges, or the data may be incomplete. Never \"safe\".",
  UNKNOWN_COVERAGE: "The advisory names a package the service deploys, but OSV gives only version ranges for it, with no enumerated versions. Not checked.",
  PREVIOUSLY_AFFECTED: "An earlier, now-ended run of listed versions in the deploy history.",
};

export default function Exposure({ result, modeIds }: { result: TriageResult; modeIds: Set<string> }) {
  const rows = useMemo(() => result.exposure.filter((r) => modeIds.has(r.ADV_ID)), [result, modeIds]);
  const counts = useMemo(() => Object.fromEntries(ORDER.map((s) => [s, rows.filter((r) => r.STATUS === s).length])) as Record<Status, number>, [rows]);
  const [tab, setTab] = useState<Status>(() => ORDER.find((s) => counts[s] > 0) ?? "AFFECTED");
  if (result.exposure_error) return null;
  const shown = rows.filter((r) => r.STATUS === tab).sort(sorter(tab));
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
      <div role="tablist" aria-label="Exposure status" className="mt-3 flex gap-1 overflow-x-auto border-b border-hair px-3 sm:px-4">
        {ORDER.map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}
            className={`relative flex items-center gap-2 px-2 py-2.5 whitespace-nowrap transition-colors duration-150 ${tab === s ? "" : "opacity-70 hover:opacity-100"}`}>
            <StatusLabel status={s} />
            <span className="font-mono text-xs text-ink-2 num">{counts[s]}</span>
            {tab === s && <span className="absolute inset-x-2 bottom-0 h-[2px] bg-ink" />}
          </button>
        ))}
      </div>
      <p className="px-4 pt-3 text-xs text-mute sm:px-5">{MEANS[tab]}</p>
      {shown.length === 0 ? (
        <p className="px-4 py-6 text-sm text-mute sm:px-5">
          {tab === "AFFECTED"
            ? "No exact package and version match for the ranked advisories. That is not a clean bill of health: see NOT_CONFIRMED."
            : `No ${tab} rows for these advisories.`}
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-hair bg-surface/60 text-left text-xs text-mute">
                <Th>Service</Th><Th>Team</Th><Th>Package</Th><Th>Version now</Th><Th>Advisory</Th>
                {dated && <><Th>Exposed since</Th>{tab === "PREVIOUSLY_AFFECTED" && <Th>Fixed on</Th>}<Th right>Days</Th><Th>Listed versions in window</Th></>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={`${r.SERVICE_ID}-${r.ADV_ID}-${i}`} className="border-b border-hair last:border-b-0 hover:bg-ground">
                  <Td className="font-semibold">{r.SERVICE}</Td>
                  <Td className="text-mute">{r.OWNER_TEAM}</Td>
                  <Td mono>{r.PACKAGE}</Td>
                  <Td mono>{r.VERSION_NOW ?? "–"}</Td>
                  <Td mono><a href={`https://osv.dev/vulnerability/${r.ADV_ID}`} target="_blank" rel="noreferrer noopener">{r.ADV_ID}</a></Td>
                  {dated && <>
                    <Td mono>{r.EXPOSED_SINCE?.slice(0, 10) ?? "–"}</Td>
                    {tab === "PREVIOUSLY_AFFECTED" && <Td mono>{r.EXPOSED_UNTIL?.slice(0, 10) ?? "–"}</Td>}
                    <Td mono right className={tab === "AFFECTED" ? "font-semibold text-affected" : ""}>{fmt.int(r.DAYS_EXPOSED)}</Td>
                    <Td mono className="text-mute">{r.VERSIONS ?? "–"}</Td>
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

function sorter(tab: Status) {
  return (a: ExposureRow, b: ExposureRow) =>
    tab === "AFFECTED" ? (b.DAYS_EXPOSED ?? 0) - (a.DAYS_EXPOSED ?? 0)
      : tab === "PREVIOUSLY_AFFECTED" ? String(a.EXPOSED_SINCE).localeCompare(String(b.EXPOSED_SINCE))
        : a.SERVICE.localeCompare(b.SERVICE);
}
function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2 font-medium whitespace-nowrap first:pl-4 sm:first:pl-5 ${right ? "text-right" : ""}`}>{children}</th>;
}
function Td({ children, mono, right, className = "" }: { children: ReactNode; mono?: boolean; right?: boolean; className?: string }) {
  return <td className={`px-4 py-2 align-top whitespace-nowrap first:pl-4 sm:first:pl-5 ${mono ? "font-mono text-[13px] num" : ""} ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}
