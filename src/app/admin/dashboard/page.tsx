
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, BarChart3, Search, View } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsChart } from "./_components/analytics-chart";

const topPages = [
    { page: '/compress-pdf', views: 12503 },
    { page: '/word-to-pdf', views: 9870 },
    { page: '/merge-pdf', views: 7654 },
    { page: '/e-sign', views: 5432 },
    { page: '/image-to-text', views: 4321 },
];

const topKeywords = [
    { keyword: 'pdf compress', searches: 890 },
    { keyword: 'merge pdf online', searches: 750 },
    { keyword: 'sign pdf online', searches: 600 },
    { keyword: 'image background remove', searches: 550 },
    { keyword: 'whatsapp chat analysis', searches: 420 },
];

export default async function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                        <View className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250,345</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ad Clicks</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45.6%</div>
                        <p className="text-xs text-muted-foreground">-5.2% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Keyword</CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">pdf compress</div>
                        <p className="text-xs text-muted-foreground">890 searches this month</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <div>
                        <CardTitle>Visitor Analytics</CardTitle>
                        <CardDescription>A chart showing visitor and ad click trends.</CardDescription>
                    </div>
                     <Select defaultValue="monthly">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <AnalyticsChart />
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Pages by Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Page</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topPages.map(page => (
                                    <TableRow key={page.page}>
                                        <TableCell>{page.page}</TableCell>
                                        <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Top Search Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead className="text-right">Searches</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topKeywords.map(item => (
                                    <TableRow key={item.keyword}>
                                        <TableCell>{item.keyword}</TableCell>
                                        <TableCell className="text-right">{item.searches.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
