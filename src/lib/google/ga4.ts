import { BetaAnalyticsDataClient } from "@google-analytics/data";

const required = (name: string, value?: string) => {
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

function getGA4Client() {
  const clientEmail = required("GOOGLE_SERVICE_ACCOUNT_EMAIL", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKey = required("GOOGLE_SERVICE_ACCOUNT_KEY", process.env.GOOGLE_SERVICE_ACCOUNT_KEY)?.replace(/\\n/g, "\n");
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

export async function getGA4Overview(propertyId: string, startDate: string, endDate: string) {
  const client = getGA4Client();
  const [report] = await client.runReport({
    property: `properties/${required("GA4_PROPERTY_ID", propertyId)}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "totalUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "eventCount" },
    ],
    dimensions: [{ name: "date" }],
  });

  const totals = {
    totalUsers: 0,
    sessions: 0,
    pageViews: 0,
    events: 0,
  };

  const series: { date: string; users: number; sessions: number; pageViews: number }[] = [];

  report.rows?.forEach((row) => {
    const [date] = row.dimensionValues || [];
    const [users, sessions, pageViews, events] = row.metricValues || [];
    const u = Number(users?.value || 0);
    const s = Number(sessions?.value || 0);
    const p = Number(pageViews?.value || 0);
    const e = Number(events?.value || 0);
    totals.totalUsers += u;
    totals.sessions += s;
    totals.pageViews += p;
    totals.events += e;
    series.push({ date: date?.value || "", users: u, sessions: s, pageViews: p });
  });

  return { totals, series };
}

export async function getGA4TopPages(propertyId: string, startDate: string, endDate: string, limit = 10) {
  const client = getGA4Client();
  const [report] = await client.runReport({
    property: `properties/${required("GA4_PROPERTY_ID", propertyId)}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }, { name: "sessions" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    orderBys: [
      { metric: { metricName: "screenPageViews" }, desc: true },
    ],
    limit,
  });

  const pages = (report.rows || []).map((row) => {
    const [path, title] = row.dimensionValues || [];
    const [views, users, sessions] = row.metricValues || [];
    return {
      path: path?.value || "",
      title: title?.value || "",
      views: Number(views?.value || 0),
      users: Number(users?.value || 0),
      sessions: Number(sessions?.value || 0),
    };
  });

  return pages;
}