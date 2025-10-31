"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function SuperadminAnalyticsConfig() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Coming soon: configure GA, GSC, and custom tracking.</div>
        </CardContent>
      </Card>
    </div>
  );
}