"use client";

import { Award, BarChart3, Bug, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type WeeklyPoint = {
  day: string;
  generated: number;
  exported: number;
};

type ScorePoint = {
  month: string;
  avgScore: number;
};

type SeverityPoint = {
  name: "Critical" | "High" | "Medium" | "Low";
  value: number;
  color: string;
};

type WcagPoint = {
  criterion: string;
  count: number;
  color: string;
};

type RecentReport = {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  time: string;
};

type Copy = {
  reportsWeek: string;
  avgScore: string;
  exportedJira: string;
  criticalIssues: string;
  weeklyActivity: string;
  reportsGeneratedVsExported: string;
  severityBreakdown: string;
  allTimeDistribution: string;
  qualityScoreTrend: string;
  avgReportScoreOverTime: string;
  topWcagCriteria: string;
  recentReports: string;
  viewAll: string;
  generated: string;
  exported: string;
};

type Props = {
  weeklyData: WeeklyPoint[];
  monthlyScoreData: ScorePoint[];
  severityBreakdown: SeverityPoint[];
  wcagTopCriteria: WcagPoint[];
  recentActivity: RecentReport[];
  kpis: {
    reportsThisWeek: number;
    reportsThisWeekDelta: string;
    avgQualityScore: number;
    avgQualityDelta: string;
    exportedToJira: number;
    exportedDelta: string;
    criticalIssues: number;
    criticalDelta: string;
  };
  copy: Copy;
};

const severityColors: Record<RecentReport["severity"], string> = {
  Critical: "#E41F07",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#22C55E"
};

function deltaColor(delta: string, negativeIsGood = false) {
  const positive = delta.startsWith("+");
  if (negativeIsGood) {
    return positive ? "#E41F07" : "#10B981";
  }

  return positive ? "#10B981" : "#E41F07";
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-lg border p-3 text-xs"
      style={{
        background: "#1E2430",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
      }}
    >
      <p className="mb-2 text-zinc-400">{String(label ?? "")}</p>
      {payload.map((point) => (
        <div key={`${point.name}-${point.value}`} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: point.color }} />
          <span className="capitalize text-zinc-300">{String(point.name)}:</span>
          <span className="font-semibold text-white">{point.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPageClient({
  weeklyData,
  monthlyScoreData,
  severityBreakdown,
  wcagTopCriteria,
  recentActivity,
  kpis,
  copy
}: Props) {
  const severityTotal = Math.max(1, severityBreakdown.reduce((sum, item) => sum + item.value, 0));
  const topCriterionCount = Math.max(1, wcagTopCriteria[0]?.count ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: copy.reportsWeek, value: kpis.reportsThisWeek, delta: kpis.reportsThisWeekDelta, icon: Bug, color: "#E41F07", negativeIsGood: false },
          { label: copy.avgScore, value: kpis.avgQualityScore, delta: kpis.avgQualityDelta, icon: Award, color: "#8B5CF6", negativeIsGood: false },
          { label: copy.exportedJira, value: kpis.exportedToJira, delta: kpis.exportedDelta, icon: CheckCircle2, color: "#10B981", negativeIsGood: false },
          { label: copy.criticalIssues, value: kpis.criticalIssues, delta: kpis.criticalDelta, icon: Zap, color: "#F97316", negativeIsGood: true }
        ].map(({ label, value, delta, icon: Icon, color, negativeIsGood }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#151A21] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ color: deltaColor(delta, negativeIsGood), background: `${deltaColor(delta, negativeIsGood)}15` }}>
                {delta}
              </span>
            </div>
            <p className="mb-1 text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-white/10 bg-[#151A21] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{copy.weeklyActivity}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">{copy.reportsGeneratedVsExported}</p>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-600" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barCategoryGap="35%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#4A5568" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4A5568" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="generated" name={copy.generated} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exported" name={copy.exported} fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151A21] p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-white">{copy.severityBreakdown}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">{copy.allTimeDistribution}</p>
          </div>
          <div className="mb-4 flex justify-center">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={severityBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {severityBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {severityBreakdown.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-zinc-400">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${(value / severityTotal) * 100}%`, background: color }} />
                  </div>
                  <span className="w-4 text-right text-xs text-zinc-500">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-white/10 bg-[#151A21] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{copy.qualityScoreTrend}</h3>
              <p className="mt-0.5 text-xs text-zinc-500">{copy.avgReportScoreOverTime}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{kpis.avgQualityDelta}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyScoreData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4A5568" }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#4A5568" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgScore"
                name={copy.avgScore}
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={{ fill: "#8B5CF6", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#A78BFA" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#151A21] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">{copy.topWcagCriteria}</h3>
          <div className="space-y-3">
            {wcagTopCriteria.map(({ criterion, count, color }) => (
              <div key={criterion}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{criterion}</span>
                  <span className="text-xs font-semibold" style={{ color }}>
                    {count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(count / topCriterionCount) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151A21]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">{copy.recentReports}</h3>
          <span className="text-xs text-zinc-500">{copy.viewAll}</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.025]">
              <span className="w-16 shrink-0 font-mono text-[10px] text-zinc-600">{item.id}</span>
              <span className="flex-1 truncate text-sm text-white">{item.title}</span>
              <span
                className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${severityColors[item.severity]}15`,
                  color: severityColors[item.severity],
                  border: `1px solid ${severityColors[item.severity]}25`
                }}
              >
                {item.severity}
              </span>
              <span className="w-20 shrink-0 text-right text-xs text-zinc-600">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


