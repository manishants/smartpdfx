"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Globe, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle,
  Crown,
  BarChart3,
  Activity,
  PenTool,
  Search,
  Target,
  Layout,
  Home
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cmsStore } from '@/lib/cms/store';
import { DashboardStats } from '@/types/cms';

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await cmsStore.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 group">
            <Crown className="h-8 w-8 text-yellow-600 group-hover:scale-110 transition-transform duration-200" />
            CMS Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your content, monitor SEO performance, and track analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="bg-yellow-600 hover:bg-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <Link href="/superadmin/blog/create">
              <PenTool className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-yellow-600 text-yellow-700 hover:bg-yellow-50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
            <Link href="/superadmin/seo">
              <Target className="h-4 w-4 mr-2" />
              SEO Tools
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Posts</CardTitle>
            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors duration-200">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats?.totalPosts || 0}</div>
            <p className="text-sm text-blue-600">
              {stats?.publishedPosts || 0} published, {stats?.draftPosts || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700">Total Pages</CardTitle>
            <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors duration-200">
              <Globe className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">{stats?.totalPages || 0}</div>
            <p className="text-sm text-green-600">
              Dynamic pages managed
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-yellow-700">Average SEO Score</CardTitle>
            <div className="p-2 bg-yellow-600 rounded-lg group-hover:bg-yellow-700 transition-colors duration-200">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 mb-1">{stats?.averageSeoScore || 0}/100</div>
            <p className="text-sm text-yellow-600">
              {stats?.averageSeoScore >= 80 ? 'Excellent' : stats?.averageSeoScore >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700">Total Views</CardTitle>
            <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors duration-200">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">{stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-sm text-purple-600">
              Across all published content
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-teal-700">Tool Sections</CardTitle>
            <div className="p-2 bg-teal-600 rounded-lg group-hover:bg-teal-700 transition-colors duration-200">
              <Layout className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-900 mb-1">{stats?.totalToolSections || 0}</div>
            <p className="text-sm text-teal-600">
              Across {stats?.toolsWithSections || 0} tools
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700">Home Sections</CardTitle>
            <div className="p-2 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors duration-200">
              <Home className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-1">{stats?.totalHomePageSections || 0}</div>
            <p className="text-sm text-orange-600">
              {stats?.activeSections || 0} active sections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-indigo-800 group-hover:text-indigo-900 transition-colors">
              <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors duration-200">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              Blog Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/superadmin/blog/create">Create New Post</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 transition-all duration-200">
              <Link href="/superadmin/blog">Manage Posts</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 transition-all duration-200">
              <Link href="/superadmin/blog/categories">Categories & Tags</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-emerald-800 group-hover:text-emerald-900 transition-colors">
              <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-700 transition-colors duration-200">
                <Globe className="h-5 w-5 text-white" />
              </div>
              Page Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/superadmin/pages">Edit Pages</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all duration-200">
              <Link href="/superadmin/pages/create">Create New Page</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all duration-200">
              <Link href="/superadmin/pages/seo">Page SEO Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-rose-50 to-rose-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-rose-800 group-hover:text-rose-900 transition-colors">
              <div className="p-2 bg-rose-600 rounded-lg group-hover:bg-rose-700 transition-colors duration-200">
                <Search className="h-5 w-5 text-white" />
              </div>
              SEO Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/superadmin/seo/analyzer">SEO Analyzer</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-rose-600 text-rose-700 hover:bg-rose-50 transition-all duration-200">
              <Link href="/superadmin/seo/keywords">Keyword Research</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-rose-600 text-rose-700 hover:bg-rose-50 transition-all duration-200">
              <Link href="/superadmin/seo/links">Link Checker</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg bg-gradient-to-br from-violet-50 to-violet-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-violet-800 group-hover:text-violet-900 transition-colors">
              <div className="p-2 bg-violet-600 rounded-lg group-hover:bg-violet-700 transition-colors duration-200">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Sections Manager
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/superadmin/sections">Manage Sections</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-violet-600 text-violet-700 hover:bg-violet-50 transition-all duration-200">
              <Link href="/superadmin/sections?tab=tool-sections">Tool Sections</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-violet-600 text-violet-700 hover:bg-violet-50 transition-all duration-200">
              <Link href="/superadmin/sections?tab=home-sections">Home Sections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-slate-600 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/50 hover:border-slate-300/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto flex items-center justify-center">
                <Activity className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-600 font-medium">No recent activity</p>
              <p className="text-slate-500 text-sm">Start by creating your first blog post or page!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}