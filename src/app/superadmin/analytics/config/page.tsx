"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SuperadminAnalyticsConfig() {
  const { toast } = useToast();
  const [ga4PropertyId, setGa4PropertyId] = useState("");
  const [gscSiteUrl, setGscSiteUrl] = useState("");
  const [requiresAdminKey, setRequiresAdminKey] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const ga4Valid = /^\d{5,}$/.test(ga4PropertyId.trim());
  const gscValid = /^(https?:\/\/[^\s]+|sc-domain:[^\s]+)$/i.test(gscSiteUrl.trim());

  useEffect(() => {
    // Load server config and local admin key
    (async () => {
      try {
        const res = await fetch("/api/settings/analytics");
        const json = await res.json();
        setGa4PropertyId(json?.config?.ga4PropertyId || "");
        setGscSiteUrl(json?.config?.gscSiteUrl || "");
        setRequiresAdminKey(!!json?.requiresAdminKey);
      } catch {}
      try {
        const localAdmin = window.localStorage.getItem("superadmin.adminKey") || "";
        setAdminKey(localAdmin);
      } catch {}
    })();
  }, []);

  const handleSaveServer = async () => {
    setSaving(true);
    try {
      const headers: Record<string, string> = { "content-type": "application/json" };
      const key = adminKey || process.env.NEXT_PUBLIC_SUPERADMIN_API_KEY || "";
      if (key) headers["x-admin-key"] = key;
      const res = await fetch("/api/settings/analytics", {
        method: "POST",
        headers,
        body: JSON.stringify({ ga4PropertyId, gscSiteUrl }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast({ title: "Saved", description: "Analytics configuration updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdminKey = () => {
    try {
      window.localStorage.setItem("superadmin.adminKey", adminKey);
      toast({ title: "Saved", description: "Admin API key stored locally" });
    } catch {}
  };

  const handleTestCredentials = async () => {
    setTesting(true);
    try {
      const headers: Record<string, string> = {};
      const key = adminKey || process.env.NEXT_PUBLIC_SUPERADMIN_API_KEY || "";
      if (key) headers["x-admin-key"] = key;
      const res = await fetch("/api/settings/analytics/health", { headers });
      const json = await res.json();
      setHealth(json);
      const ok = (json?.ga4?.ok && json?.gsc?.ok);
      toast({ title: ok ? "Credentials look good" : "Test completed", description: ok ? "GA4 and GSC are reachable." : "See details below for any errors." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to test credentials" });
    } finally {
      setTesting(false);
    }
  };

  const handleConnectGSC = async () => {
    try {
      const res = await fetch("/api/gsc/oauth/start");
      const json = await res.json();
      const url = json?.url;
      if (!url) throw new Error("Failed to create OAuth URL");
      window.location.href = url;
    } catch (e: any) {
      toast({ title: "OAuth Error", description: e?.message || "Unable to start Search Console OAuth" });
    }
  };

  return (
    <div className="superadmin-scope space-y-6 px-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Configuration</h1>
        <p className="text-sm text-slate-600">Paste your GA4 Property ID and Search Console Site URL. Optionally store an Admin API key to authenticate requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <CardDescription>Configure GA4 and Google Search Console</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="ga4-property-id">GA4 Property ID</Label>
              <Input id="ga4-property-id" placeholder="e.g., 123456789" value={ga4PropertyId} onChange={(e) => setGa4PropertyId(e.target.value)} />
              <p className="text-xs text-slate-500">Find in GA Admin → Property settings. This is the numeric Property ID (not your Measurement ID).</p>
              {ga4PropertyId && !ga4Valid && (
                <p className="text-xs text-red-600">Tip: Paste the numeric Property ID (looks like 123456789), not a code like G-XXXXXXX.</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="gsc-site-url">Search Console Site URL</Label>
              <Input id="gsc-site-url" placeholder="https://example.com/" value={gscSiteUrl} onChange={(e) => setGscSiteUrl(e.target.value)} />
              <p className="text-xs text-slate-500">Paste the exact property as verified in Search Console (URL property or domain property).</p>
              {gscSiteUrl && !gscValid && (
                <p className="text-xs text-red-600">Tip: Use a full URL like https://example.com/ or a domain property like sc-domain:example.com.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="ui-button" data-variant="default" onClick={handleSaveServer} disabled={saving}>
              {saving ? "Saving…" : "Save Server Settings"}
            </Button>
            <Button className="ui-button" data-variant="secondary" onClick={handleConnectGSC}>
              Connect Search Console (OAuth)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validate Credentials</CardTitle>
          <CardDescription>Run a quick connectivity check against GA4 and GSC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button className="ui-button" data-variant="default" onClick={handleTestCredentials} disabled={testing}>
              {testing ? "Testing…" : "Test Credentials"}
            </Button>
            {requiresAdminKey && (
              <div className="text-xs text-slate-500">Requires Admin API key in header</div>
            )}
          </div>
          {health && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-md border p-3 bg-white">
                <div className="font-medium">GA4</div>
                <div className="text-sm mt-1">
                  {health.ga4?.ok ? (
                    <span className="text-emerald-700">OK. Users: {health.ga4?.totals?.totalUsers ?? "—"}, Sessions: {health.ga4?.totals?.sessions ?? "—"}</span>
                  ) : (
                    <span className="text-red-700">Error: {health.ga4?.error || "Unknown"}</span>
                  )}
                </div>
              </div>
              <div className="rounded-md border p-3 bg-white">
                <div className="font-medium">Search Console</div>
                <div className="text-sm mt-1">
                  {health.gsc?.ok ? (
                    <span className="text-emerald-700">OK. Clicks: {health.gsc?.totals?.clicks ?? "—"}, Impressions: {health.gsc?.totals?.impressions ?? "—"}</span>
                  ) : (
                    <span className="text-red-700">Error: {health.gsc?.error || "Unknown"}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin API Key</CardTitle>
          <CardDescription>Used to authenticate calls to protected superadmin routes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label htmlFor="admin-key">Paste Admin API Key</Label>
              <Input id="admin-key" placeholder="Your X-Admin-Key" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
              <p className="text-xs text-slate-500">Set server `SUPERADMIN_API_KEY` and paste the same value here. This will be sent as the `x-admin-key` header from your browser.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="ui-button" data-variant="default" onClick={handleSaveAdminKey}>Save Locally</Button>
            {requiresAdminKey ? (
              <span className="text-xs text-slate-600">Server requires admin key.</span>
            ) : (
              <span className="text-xs text-slate-600">Server has no admin key configured; requests will be allowed.</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What do I paste here?</CardTitle>
          <CardDescription>Quick guidance for IDs and keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-medium">GA4 Property ID</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>From Google Analytics Admin → Property settings → Property ID.</li>
              <li>Numeric only, e.g., <span className="font-mono">123456789</span>.</li>
              <li>Do not paste Measurement ID (e.g., <span className="font-mono">G-XXXXXXX</span>).</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Search Console Site URL</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the exact verified property in Search Console.</li>
              <li>URL property example: <span className="font-mono">https://example.com/</span>.</li>
              <li>Domain property example: <span className="font-mono">sc-domain:example.com</span>.</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Admin API Key</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Server secret in env <span className="font-mono">SUPERADMIN_API_KEY</span>.</li>
              <li>Paste the same value here so client requests include <span className="font-mono">x-admin-key</span>.</li>
              <li>For local dev, you can also set <span className="font-mono">NEXT_PUBLIC_SUPERADMIN_API_KEY</span>.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}