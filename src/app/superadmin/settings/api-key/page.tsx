"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Key, Eye, EyeOff, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GeminiKeyRow = { id: string; label: string; maskedKey: string; enabled: boolean; createdAt: string };

export default function ApiKeySettingsPage() {
  const { toast } = useToast();
  const [geminiKeys, setGeminiKeys] = useState<GeminiKeyRow[]>([]);
  const [loadingKeys, setLoadingKeys] = useState<boolean>(true);
  const [newKeyLabel, setNewKeyLabel] = useState<string>("");
  const [newKeyValue, setNewKeyValue] = useState<string>("");
  const [rotationEnabled, setRotationEnabled] = useState<boolean>(true);
  const [rotationStrategy, setRotationStrategy] = useState<"hourly" | "minute">("hourly");

  const loadKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch('/api/keys/gemini');
      const data = await res.json();
      setGeminiKeys(Array.isArray(data?.keys) ? data.keys : []);
      setRotationEnabled(Boolean(data?.rotation?.enabled));
      if (data?.rotation?.strategy === 'minute' || data?.rotation?.strategy === 'hourly') {
        setRotationStrategy(data.rotation.strategy);
      }
    } catch (e) {
      toast({ title: 'Failed to load Gemini keys', variant: 'destructive' });
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const handleAddKey = async () => {
    const key = newKeyValue.trim();
    const label = newKeyLabel.trim();
    if (!key) {
      toast({ title: 'Enter API key', description: 'Gemini API key cannot be empty.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/keys/gemini', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, label: label || undefined }),
      });
      if (!res.ok) throw new Error('Failed to add key');
      setNewKeyLabel(''); setNewKeyValue('');
      await loadKeys();
      toast({ title: 'Gemini key added' });
    } catch (e) {
      toast({ title: 'Add failed', description: String((e as Error).message || 'Unknown error'), variant: 'destructive' });
    }
  };

  const toggleKeyEnabled = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/keys/gemini', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      if (!res.ok) throw new Error('Failed to update key');
      setGeminiKeys(prev => prev.map(k => k.id === id ? { ...k, enabled } : k));
      toast({ title: enabled ? 'Key enabled' : 'Key disabled' });
    } catch (e) {
      toast({ title: 'Update failed', description: String((e as Error).message || 'Unknown error'), variant: 'destructive' });
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/gemini?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete key');
      setGeminiKeys(prev => prev.filter(k => k.id !== id));
      toast({ title: 'Key deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: String((e as Error).message || 'Unknown error'), variant: 'destructive' });
    }
  };

  const handleToggleRotation = async (value: boolean) => {
    setRotationEnabled(value);
    try {
      const res = await fetch('/api/keys/gemini', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rotationEnabled: value }),
      });
      if (!res.ok) throw new Error('Failed to update rotation');
      toast({ title: value ? 'Rotation enabled' : 'Rotation disabled' });
    } catch (e) {
      setRotationEnabled(!value);
      toast({ title: 'Rotation update failed', description: String((e as Error).message || 'Unknown error'), variant: 'destructive' });
    }
  };

  const handleChangeStrategy = async (strategy: 'hourly' | 'minute') => {
    setRotationStrategy(strategy);
    try {
      const res = await fetch('/api/keys/gemini', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rotationStrategy: strategy }),
      });
      if (!res.ok) throw new Error('Failed to update strategy');
      toast({ title: `Rotation set to ${strategy}` });
    } catch (e) {
      toast({ title: 'Strategy update failed', description: String((e as Error).message || 'Unknown error'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Key</h1>
        <p className="text-muted-foreground">Manage Gemini API keys and rotation settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Keys
          </CardTitle>
          <CardDescription>Store multiple keys and configure rotation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gemini-key-label">Key Label (optional)</Label>
              <Input id="gemini-key-label" value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} placeholder="e.g., Primary, Backup-1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gemini-key-value">Gemini API Key</Label>
              <Input id="gemini-key-value" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} placeholder="Paste your Gemini API key" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleAddKey}>Add Key</Button>
            <div className="flex items-center gap-2">
              <Label>Rotation Strategy</Label>
              <Select value={rotationStrategy} onValueChange={(v) => handleChangeStrategy(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="minute">Minute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Rotation</Label>
              <Button variant={rotationEnabled ? 'default' : 'outline'} size="sm" onClick={() => handleToggleRotation(!rotationEnabled)}>
                {rotationEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Stored Gemini Keys</h3>
              <Badge variant="outline">{geminiKeys.length} keys</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingKeys ? (
                  <TableRow>
                    <TableCell colSpan={5}><div className="text-sm text-muted-foreground">Loading keys...</div></TableCell>
                  </TableRow>
                ) : geminiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}><div className="text-sm text-muted-foreground">No keys added yet. Add a key above to get started.</div></TableCell>
                  </TableRow>
                ) : (
                  geminiKeys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell>{k.label || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{k.maskedKey}</TableCell>
                      <TableCell>
                        <Badge variant={k.enabled ? 'default' : 'secondary'}>
                          {k.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(k.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleKeyEnabled(k.id, !k.enabled)}>
                            {k.enabled ? (
                              <span className="inline-flex items-center gap-1"><EyeOff className="h-4 w-4" /> Disable</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Enable</span>
                            )}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteKey(k.id)}>
                            <span className="inline-flex items-center gap-1"><Trash2 className="h-4 w-4" /> Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}