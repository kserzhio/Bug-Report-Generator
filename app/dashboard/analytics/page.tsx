import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeLocale } from "@/lib/i18n/locale";
import { prisma } from "@/lib/prisma/client";
import { getCurrentWorkspaceContext } from "@/src/server/queries/workspace";

function computeScore(total: number, critical: number, high: number, medium: number) {
  if (total === 0) return 100;
  const penalty = critical * 16 + high * 8 + medium * 3;
  return Math.max(0, Math.min(100, 100 - Math.round((penalty / total) * 4)));
}

function deltaPercent(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function shiftDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function formatDeltaPercent(value: number) {
  if (value === 0) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatDeltaPoints(value: number, locale: "en" | "uk") {
  if (value === 0) {
    return locale === "uk" ? "0 пт" : "0pts";
  }

  if (locale === "uk") {
    return `${value > 0 ? "+" : ""}${value} пт`;
  }

  return `${value > 0 ? "+" : ""}${value}pts`;
}

function relativeTime(value: Date, locale: "en" | "uk") {
  const diffMs = Date.now() - value.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return locale === "uk" ? `${minutes} хв тому` : `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return locale === "uk" ? `${hours} год тому` : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return locale === "uk" ? "Вчора" : "Yesterday";
  }

  return locale === "uk" ? `${days} дн тому` : `${days} days ago`;
}

const severityPalette = {
  Critical: "#E41F07",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#22C55E"
} as const;

export default async function AnalyticsPage() {
  const context = await getCurrentWorkspaceContext();
  const locale = normalizeLocale(context.workspace.uiLocale);
  const t = getMessages(locale);

  const copy =
    locale === "uk"
      ? {
          reportsWeek: "Звітів за тиждень",
          avgScore: "Середній quality score",
          exportedJira: "Експортовано в Jira",
          criticalIssues: "Критичні issues",
          weeklyActivity: "Активність за тиждень",
          reportsGeneratedVsExported: "Згенеровано vs експортовано",
          severityBreakdown: "Розподіл серйозності",
          allTimeDistribution: "Розподіл за весь час",
          qualityScoreTrend: "Динаміка Quality Score",
          avgReportScoreOverTime: "Середній score звітів у часі",
          topWcagCriteria: "Топ WCAG критерії",
          recentReports: "Останні звіти",
          viewAll: "Останні 5",
          generated: "Generated",
          exported: "Exported",
          noReports: "Ще немає звітів."
        }
      : {
          reportsWeek: "Reports this week",
          avgScore: "Avg quality score",
          exportedJira: "Exported to Jira",
          criticalIssues: "Critical issues",
          weeklyActivity: "Weekly Activity",
          reportsGeneratedVsExported: "Reports generated vs exported",
          severityBreakdown: "Severity Breakdown",
          allTimeDistribution: "All time distribution",
          qualityScoreTrend: "Quality Score Trend",
          avgReportScoreOverTime: "Average report score over time",
          topWcagCriteria: "Top WCAG Criteria",
          recentReports: "Recent Reports",
          viewAll: "Last 5",
          generated: "Generated",
          exported: "Exported",
          noReports: "No reports yet."
        };

  const now = new Date();
  const today = startOfDay(now);
  const currentWeekStart = shiftDays(today, -6);
  const previousWeekStart = shiftDays(today, -13);
  const monthWindowStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [severityGroups, wcagGroups, recentBugs, twoWeekBugs, monthlyBugs] = await Promise.all([
    prisma.generatedBug.groupBy({
      by: ["severity"],
      where: { workspaceId: context.workspace.id },
      _count: { _all: true }
    }),
    prisma.generatedBug.groupBy({
      by: ["wcagCriterion"],
      where: { workspaceId: context.workspace.id },
      _count: { _all: true },
      orderBy: { _count: { wcagCriterion: "desc" } },
      take: 5
    }),
    prisma.generatedBug.findMany({
      where: { workspaceId: context.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        severity: true,
        createdAt: true
      }
    }),
    prisma.generatedBug.findMany({
      where: {
        workspaceId: context.workspace.id,
        createdAt: { gte: previousWeekStart }
      },
      select: {
        severity: true,
        toolsUsed: true,
        createdAt: true
      }
    }),
    prisma.generatedBug.findMany({
      where: {
        workspaceId: context.workspace.id,
        createdAt: { gte: monthWindowStart }
      },
      select: {
        severity: true,
        createdAt: true
      }
    })
  ]);

  const weekFormatter = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", { weekday: "short" });
  const monthFormatter = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", { month: "short" });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDays(currentWeekStart, index);
    return {
      key: date.toISOString().slice(0, 10),
      day: weekFormatter.format(date).replace(".", "")
    };
  });

  const weeklyMap = new Map(weekDays.map((entry) => [entry.key, { day: entry.day, generated: 0, exported: 0 }]));
  let currentWeekGenerated = 0;
  let previousWeekGenerated = 0;
  let currentWeekExported = 0;
  let previousWeekExported = 0;
  let currentWeekCritical = 0;
  let previousWeekCritical = 0;

  for (const bug of twoWeekBugs) {
    const isCurrentWeek = bug.createdAt >= currentWeekStart;
    const isExportedToJira = /jira/i.test(bug.toolsUsed || "");

    if (isCurrentWeek) {
      currentWeekGenerated += 1;
      if (bug.severity === "Critical") currentWeekCritical += 1;
      if (isExportedToJira) currentWeekExported += 1;

      const key = bug.createdAt.toISOString().slice(0, 10);
      const bucket = weeklyMap.get(key);
      if (bucket) {
        bucket.generated += 1;
        if (isExportedToJira) {
          bucket.exported += 1;
        }
      }
    } else {
      previousWeekGenerated += 1;
      if (bug.severity === "Critical") previousWeekCritical += 1;
      if (isExportedToJira) previousWeekExported += 1;
    }
  }

  const weeklyData = weekDays.map((entry) => weeklyMap.get(entry.key) ?? { day: entry.day, generated: 0, exported: 0 });

  const monthStarts = Array.from({ length: 7 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (6 - index), 1));
  const monthBuckets = new Map(
    monthStarts.map((monthStart) => [
      monthKey(monthStart),
      {
        month: monthFormatter.format(monthStart).replace(".", ""),
        total: 0,
        critical: 0,
        high: 0,
        medium: 0
      }
    ])
  );

  for (const bug of monthlyBugs) {
    const key = monthKey(new Date(bug.createdAt.getFullYear(), bug.createdAt.getMonth(), 1));
    const bucket = monthBuckets.get(key);
    if (!bucket) continue;

    bucket.total += 1;
    if (bug.severity === "Critical") bucket.critical += 1;
    if (bug.severity === "High") bucket.high += 1;
    if (bug.severity === "Medium") bucket.medium += 1;
  }

  const monthlyScoreData = monthStarts.map((monthStart) => {
    const key = monthKey(monthStart);
    const bucket = monthBuckets.get(key);

    if (!bucket) {
      return { month: monthFormatter.format(monthStart).replace(".", ""), avgScore: 100 };
    }

    return {
      month: bucket.month,
      avgScore: computeScore(bucket.total, bucket.critical, bucket.high, bucket.medium)
    };
  });

  const latestScore = monthlyScoreData[monthlyScoreData.length - 1]?.avgScore ?? 100;
  const previousScore = monthlyScoreData[monthlyScoreData.length - 2]?.avgScore ?? latestScore;

  const severityLookup = new Map(severityGroups.map((group) => [group.severity, group._count._all]));
  const severityBreakdown = [
    { name: "Critical", value: severityLookup.get("Critical") ?? 0, color: severityPalette.Critical },
    { name: "High", value: severityLookup.get("High") ?? 0, color: severityPalette.High },
    { name: "Medium", value: severityLookup.get("Medium") ?? 0, color: severityPalette.Medium },
    { name: "Low", value: severityLookup.get("Low") ?? 0, color: severityPalette.Low }
  ] as const;

  const criticalIssues = severityBreakdown.find((item) => item.name === "Critical")?.value ?? 0;

  const wcagColors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#E41F07"];
  const wcagTopCriteria = wcagGroups.map((group, index) => ({
    criterion: group.wcagCriterion,
    count: group._count._all,
    color: wcagColors[index % wcagColors.length] ?? "#8B5CF6"
  }));

  const recentActivity: Array<{ id: string; title: string; severity: "Critical" | "High" | "Medium" | "Low"; time: string }> = recentBugs.map((bug) => {
    const severity =
      bug.severity === "Critical" || bug.severity === "High" || bug.severity === "Medium" || bug.severity === "Low"
        ? bug.severity
        : "Medium";

    return {
      id: bug.id.slice(-8).toUpperCase(),
      title: bug.title,
      severity,
      time: relativeTime(bug.createdAt, locale)
    };
  });

  const reportsThisWeekDelta = formatDeltaPercent(deltaPercent(currentWeekGenerated, previousWeekGenerated));
  const exportedDelta = formatDeltaPercent(deltaPercent(currentWeekExported, previousWeekExported));
  const criticalDelta = formatDeltaPercent(deltaPercent(currentWeekCritical, previousWeekCritical));
  const avgQualityDelta = formatDeltaPoints(latestScore - previousScore, locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t.dashboard.analyticsTitle}</h1>
        <p className="text-sm text-zinc-400">{t.dashboard.analyticsSubtitle}</p>
      </div>

      <AnalyticsPageClient
        weeklyData={weeklyData}
        monthlyScoreData={monthlyScoreData}
        severityBreakdown={[...severityBreakdown]}
        wcagTopCriteria={wcagTopCriteria}
        recentActivity={
          recentActivity.length > 0
            ? recentActivity
            : [
                {
                  id: "--",
                  title: copy.noReports,
                  severity: "Low",
                  time: "-"
                }
              ]
        }
        kpis={{
          reportsThisWeek: currentWeekGenerated,
          reportsThisWeekDelta,
          avgQualityScore: latestScore,
          avgQualityDelta,
          exportedToJira: currentWeekExported,
          exportedDelta,
          criticalIssues,
          criticalDelta
        }}
        copy={copy}
      />
    </div>
  );
}

