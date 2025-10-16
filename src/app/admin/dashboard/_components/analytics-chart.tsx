"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
const chartData = [
  { date: 'Jan', visitors: 65, clicks: 20 },
  { date: 'Feb', visitors: 59, clicks: 23 },
  { date: 'Mar', visitors: 80, clicks: 35 },
  { date: 'Apr', visitors: 81, clicks: 40 },
  { date: 'May', visitors: 56, clicks: 30 },
  { date: 'Jun', visitors: 55, clicks: 33 },
  { date: 'Jul', visitors: 40, clicks: 25 },
];
export function AnalyticsChart() {
    return (
         <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                <Line type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--secondary-foreground))" />
            </LineChart>
        </ResponsiveContainer>
    );
}
