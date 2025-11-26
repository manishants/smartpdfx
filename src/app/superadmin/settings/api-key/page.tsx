"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

export default function ApiKeySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Key</h1>
        <p className="text-muted-foreground">Managed via environment variable</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </CardTitle>
          <CardDescription>Set GOOGLE_API_KEY in .env only</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            This key is not stored or editable in the dashboard.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
