"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Mail } from "lucide-react";

type Subscriber = {
  id: number;
  email: string;
  category: string;
  unsubscribed: boolean;
  created_at: string;
  updated_at: string;
};

export default function SuperadminNewsletterPage() {
  const supabase = createClient();
  const [allSubscribers, setAllSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  async function loadSubscribers() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAllSubscribers((data || []) as Subscriber[]);
    } catch (e: any) {
      console.error("Load subscribers error:", e);
      setError(e?.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of allSubscribers) {
      set.add(s.category || "general");
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allSubscribers]);

  const filtered = useMemo(() => {
    let rows = allSubscribers.slice();
    if (category !== "all") rows = rows.filter((r) => r.category === category);
    if (search) rows = rows.filter((r) => r.email.toLowerCase().includes(search.toLowerCase()));
    return rows;
  }, [allSubscribers, category, search]);

  const exportUrl = useMemo(() => {
    const base = "/api/newsletter/export";
    if (category && category !== "all") return `${base}?category=${encodeURIComponent(category)}`;
    return base;
  }, [category]);

  async function toggleSubscribe(id: number, nextUnsub: boolean) {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed: nextUnsub })
        .eq("id", id);
      if (error) throw error;
      setAllSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, unsubscribed: nextUnsub } : s)));
    } catch (e: any) {
      console.error("Update subscriber error:", e);
      alert(e?.message || "Failed to update subscriber");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscribers</span>
            <div className="flex items-center gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email"
                className="w-64"
              />
              <Button asChild variant="outline">
                <a href={exportUrl} download>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </a>
              </Button>
              <Button variant="ghost" onClick={loadSubscribers} disabled={loading}>
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-destructive mb-3">{error}</div>
          )}
          <div className="text-sm text-muted-foreground mb-2">
            Showing {filtered.length} of {allSubscribers.length} subscribers
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>
                    {s.unsubscribed ? (
                      <span className="text-muted-foreground">unsubscribed</span>
                    ) : (
                      <span className="text-green-600">active</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {s.unsubscribed ? (
                      <Button size="sm" variant="outline" onClick={() => toggleSubscribe(s.id, false)}>
                        Resubscribe
                      </Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => toggleSubscribe(s.id, true)}>
                        Unsubscribe
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}