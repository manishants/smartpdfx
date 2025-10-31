"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function SuperadminSecurity() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Coming soon: roles, permissions, and session policies.</div>
        </CardContent>
      </Card>
    </div>
  );
}