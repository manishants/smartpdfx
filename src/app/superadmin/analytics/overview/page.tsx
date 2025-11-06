"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type GAOverview = { totals: { totalUsers: number; sessions: number; pageViews: number; events: number }; series: { date: string; users: number; sessions: number; pageViews: number }[] };
type GSCOverview = { totals: { clicks: number; impressions: number; ctr: number; position: number }; series: { date: string; clicks: number; impressions: number; ctr: number; position: number }[] };

export default function AnalyticsOverviewPage() {
  const [ga, setGa] = useState<GAOverview | null>(null);
  const [gsc, setGsc] = useState<GSCOverview | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const envAdminKey = process.env.NEXT_PUBLIC_SUPERADMIN_API_KEY || "";
  const [propertyId, setPropertyId] = useState<string>("");
  const [siteUrl, setSiteUrl] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Load server-side defaults and local overrides
      try {
        const cfgRes = await fetch(`/api/settings/analytics`);
        const cfgJson = await cfgRes.json();
        const prop = cfgJson?.config?.ga4PropertyId || "";
        const site = cfgJson?.config?.gscSiteUrl || "";
        // Update state for UI, but also use local variables to avoid stale state in this tick
        setPropertyId(prop);
        setSiteUrl(site);
        
        const localAdminKey = typeof window !== "undefined" ? (window.localStorage.getItem("superadmin.adminKey") || "") : "";
        const headers = (localAdminKey || envAdminKey) ? { "x-admin-key": localAdminKey || envAdminKey } : {};

        const qsProp = prop ? `?propertyId=${encodeURIComponent(prop)}` : "";
        const qsSite = site ? `?siteUrl=${encodeURIComponent(site)}` : "";

        const [gaRes, gscRes, pagesRes, keywordsRes, suggRes] = await Promise.all([
          fetch(`/api/analytics/ga4/overview${qsProp}`, { headers }),
          fetch(`/api/seo/gsc/overview${qsSite}`, { headers }),
          fetch(`/api/seo/gsc/top-pages${site ? `?siteUrl=${encodeURIComponent(site)}&limit=10` : `?limit=10`}`, { headers }),
          fetch(`/api/seo/gsc/keywords${site ? `?siteUrl=${encodeURIComponent(site)}&limit=10` : `?limit=10`}`, { headers }),
          fetch(`/api/seo/suggestions${qsSite}`, { headers }),
        ]);
        const gaJson = await gaRes.json();
        const gscJson = await gscRes.json();
        const pagesJson = await pagesRes.json();
        const keywordsJson = await keywordsRes.json();
        const suggJson = await suggRes.json();
        setGa(gaJson);
        setGsc(gscJson);
        setPages(pagesJson.pages || []);
        setKeywords(keywordsJson.keywords || []);
        setSuggestions(suggJson.suggestions || []);
        setLoading(false);
        return; // early return since we finished inside try
      } catch {}
      // Fallback path using existing state (should rarely execute)
      const localAdminKey = typeof window !== "undefined" ? (window.localStorage.getItem("superadmin.adminKey") || "") : "";
      const headers = (localAdminKey || envAdminKey) ? { "x-admin-key": localAdminKey || envAdminKey } : {};
      const qsProp = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : "";
      const qsSite = siteUrl ? `?siteUrl=${encodeURIComponent(siteUrl)}` : "";
      const [gaRes, gscRes, pagesRes, keywordsRes, suggRes] = await Promise.all([
        fetch(`/api/analytics/ga4/overview${qsProp}`, { headers }),
        fetch(`/api/seo/gsc/overview${qsSite}`, { headers }),
        fetch(`/api/seo/gsc/top-pages${siteUrl ? `?siteUrl=${encodeURIComponent(siteUrl)}&limit=10` : `?limit=10`}`, { headers }),
        fetch(`/api/seo/gsc/keywords${siteUrl ? `?siteUrl=${encodeURIComponent(siteUrl)}&limit=10` : `?limit=10`}`, { headers }),
        fetch(`/api/seo/suggestions${qsSite}`, { headers }),
      ]);
      const gaJson = await gaRes.json();
      const gscJson = await gscRes.json();
      const pagesJson = await pagesRes.json();
      const keywordsJson = await keywordsRes.json();
      const suggJson = await suggRes.json();
      setGa(gaJson);
      setGsc(gscJson);
      setPages(pagesJson.pages || []);
      setKeywords(keywordsJson.keywords || []);
      setSuggestions(suggJson.suggestions || []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  return (
    <div className="superadmin-scope px-6 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics Overview</h1>
        <Button className="ui-button" data-variant="default" onClick={() => location.reload()}>Refresh</Button>
      </div>

      {loading && <div className="text-sm text-slate-500">Loading analytics…</div>}

      {!loading && (
        <div className="space-y-10">
          {/* Error callouts if credentials missing or APIs returned errors */}
          {((ga as any)?.error || (gsc as any)?.error) && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-800">
              <div className="font-medium">Analytics not loading</div>
              <div className="text-sm mt-1">{(ga as any)?.error || (gsc as any)?.error || "Please ensure server credentials (GA4 service account or GSC OAuth/Service) are configured in environment variables."}</div>
            </div>
          )}
          <section>
            <h2 className="text-lg font-medium mb-3">Traffic (GA4)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat label="Users" value={ga?.totals?.totalUsers} />
              <Stat label="Sessions" value={ga?.totals?.sessions} />
              <Stat label="Page Views" value={ga?.totals?.pageViews} />
              <Stat label="Events" value={ga?.totals?.events} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Search (GSC)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat label="Clicks" value={gsc?.totals?.clicks} />
              <Stat label="Impressions" value={gsc?.totals?.impressions} />
              <Stat label="Avg CTR" value={formatPct(gsc?.totals?.ctr)} />
              <Stat label="Avg Position" value={gsc?.totals?.position?.toFixed(1)} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Top Pages</h2>
            <Table cols={["Page", "Clicks", "Impressions", "CTR", "Position"]} rows={
              pages.map((p) => [
                p.page,
                String(p.clicks),
                String(p.impressions),
                formatPct(p.ctr),
                String(Number(p.position).toFixed(1)),
              ])
            } />
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Top Keywords</h2>
            <Table cols={["Query", "Clicks", "Impressions", "CTR", "Position"]} rows={
              keywords.map((k) => [k.query, String(k.clicks), String(k.impressions), formatPct(k.ctr), String(Number(k.position).toFixed(1))])
            } />
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">SEO Suggestions</h2>
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="rounded-md border border-slate-200 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{s.title}</div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 uppercase">{s.impact}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{s.description}</p>
                  {s.targets?.length ? (
                    <div className="mt-2 text-xs text-slate-500">Targets: {s.targets.slice(0, 5).join(", ")}{s.targets.length > 5 ? "…" : ""}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold mt-1">{value ?? "—"}</div>
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="text-left">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 border-b bg-slate-50 text-slate-700">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {r.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-700 max-w-[32rem] truncate">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPct(n: number | undefined) {
  if (typeof n !== "number") return "—";
  return `${(n * 100).toFixed(2)}%`;
}