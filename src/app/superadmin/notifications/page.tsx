"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function SuperadminNotifications() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Coming soon: configure and view system notifications.</div>
        </CardContent>
      </Card>
    </div>
  );
}