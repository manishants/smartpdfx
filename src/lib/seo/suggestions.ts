type PageRow = { page: string; clicks: number; impressions: number; ctr: number; position: number };
type KeywordRow = { query: string; clicks: number; impressions: number; ctr: number; position: number };

export function generateSuggestions({
  pages,
  keywords,
  totals,
}: {
  pages: PageRow[];
  keywords: KeywordRow[];
  totals?: { clicks?: number; impressions?: number; ctr?: number; position?: number };
}) {
  const suggestions: { title: string; description: string; impact: "low" | "medium" | "high"; targets: string[] }[] = [];

  const highImpressionLowCtrPages = pages.filter((p) => p.impressions > 500 && p.ctr < 0.02);
  if (highImpressionLowCtrPages.length) {
    suggestions.push({
      title: "Improve page titles and meta descriptions for low CTR pages",
      description:
        "Pages with high impressions but low CTR likely need clearer value propositions, keyword-aligned titles, and richer meta descriptions. Consider adding FAQ schema and sitelinks via internal anchors.",
      impact: "high",
      targets: highImpressionLowCtrPages.slice(0, 10).map((p) => p.page),
    });
  }

  const queriesWithPotential = keywords.filter((k) => k.impressions > 300 && k.position > 12);
  if (queriesWithPotential.length) {
    suggestions.push({
      title: "Publish targeted content for promising queries",
      description:
        "Create or expand articles around queries with high impressions and average position beyond page one. Add internal links from related posts and consider long-tail variants.",
      impact: "medium",
      targets: queriesWithPotential.slice(0, 15).map((k) => k.query),
    });
  }

  const goodQueriesLowClicks = keywords.filter((k) => k.position <= 10 && k.ctr < 0.03 && k.impressions > 200);
  if (goodQueriesLowClicks.length) {
    suggestions.push({
      title: "Enhance SERP presentation to lift CTR",
      description:
        "For queries already ranking on page one but underperforming CTR, test richer titles, add schema (Article, FAQ, HowTo), compress above-the-fold content, and ensure meta robots settings allow rich results.",
      impact: "medium",
      targets: goodQueriesLowClicks.slice(0, 15).map((k) => k.query),
    });
  }

  const slowPages = pages.filter((p) => p.position < 10 && p.ctr < 0.02 && p.impressions > 300);
  if (slowPages.length) {
    suggestions.push({
      title: "Improve performance and Core Web Vitals on key pages",
      description:
        "Low CTR despite strong positions can indicate poor snippet or slow page speed. Audit LCP, CLS, and INP; optimize images, reduce JS bundle size, and defer non-critical scripts.",
      impact: "medium",
      targets: slowPages.slice(0, 10).map((p) => p.page),
    });
  }

  if (totals && typeof totals.ctr === "number" && totals.ctr < 0.02) {
    suggestions.push({
      title: "Site-wide CTR uplift initiative",
      description:
        "Average CTR is low site-wide. Standardize title formats, ensure brand modifiers, implement schema across content types, and audit indexation for paginated or low-value URLs.",
      impact: "high",
      targets: [],
    });
  }

  return suggestions;
}