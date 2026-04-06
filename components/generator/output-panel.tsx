"use client";

import { CheckCircle2, Copy, Download, ExternalLink, FileJson2, FileSpreadsheet, FileText, RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

type PreviewData = {
  component: string;
  severity: string;
  issueType: string;
  wcag: string;
  actualBehavior: string;
  expectedBehavior: string;
  affectedUsers: string;
  steps: string;
  recommendations: string[];
};

interface OutputPanelProps {
  content: string;
  previewData: PreviewData;
  onCopy: () => void;
  onReset: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onExportText: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportJira: () => void;
  onExportAzure: () => void;
  onExportLinear: () => void;
}

function getSeverityClasses(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized === "critical") {
    return "from-[#ff3045] to-[#ff1f35]";
  }

  if (normalized === "high") {
    return "from-[#ff7a1a] to-[#ff5b00]";
  }

  if (normalized === "low") {
    return "from-[#16a34a] to-[#15803d]";
  }

  return "from-[#f59e0b] to-[#d97706]";
}

function parseSteps(rawSteps: string, component: string) {
  const parsed = rawSteps
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);

  if (parsed.length > 0) {
    return parsed;
  }

  return [
    `Navigate to the page containing the ${component}`,
    "Use Tab key to navigate through interactive elements",
    `Observe the focus behavior when the ${component} receives focus`
  ];
}

export function OutputPanel({
  content,
  previewData,
  onCopy,
  onReset,
  onSave,
  onExportMarkdown,
  onExportText,
  onExportJson,
  onExportCsv,
  onExportJira,
  onExportAzure,
  onExportLinear
}: OutputPanelProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const c =
    locale === "uk"
      ? {
          title: "Live Preview",
          copy: "Копіювати",
          copied: "Скопійовано!",
          export: "Експорт",
          impact: "ВПЛИВ",
          description: "ОПИС",
          actual: "ФАКТИЧНА ПОВЕДІНКА",
          expected: "ОЧІКУВАНА ПОВЕДІНКА",
          steps: "КРОКИ ВІДТВОРЕННЯ",
          recommendations: "РЕКОМЕНДАЦІЇ",
          wcag: "WCAG GUIDELINE",
          moreExports: "Додатковий експорт",
          reset: "Скинути",
          save: "Зберегти",
          plain: "Текст",
          jira: "Jira",
          azure: "Azure",
          linear: "Linear"
        }
      : {
          title: "Live Preview",
          copy: "Copy",
          copied: "Copied!",
          export: "Export",
          impact: "IMPACT",
          description: "DESCRIPTION",
          actual: "ACTUAL BEHAVIOR",
          expected: "EXPECTED BEHAVIOR",
          steps: "STEPS TO REPRODUCE",
          recommendations: "RECOMMENDATIONS",
          wcag: "WCAG GUIDELINE",
          moreExports: "More exports",
          reset: "Reset",
          save: "Save",
          plain: "Plain text",
          jira: "Jira",
          azure: "Azure",
          linear: "Linear"
        };

  const safeComponent = previewData.component?.trim() || "Component";
  const safeSeverity = previewData.severity?.trim() || "Medium";
  const safeIssueType = previewData.issueType?.trim() || "Accessibility";
  const safeWcag = previewData.wcag?.trim() || "WCAG 2.2";
  const safeActual = previewData.actualBehavior?.trim() || "No actual behavior provided yet.";
  const safeExpected = previewData.expectedBehavior?.trim() || "No expected behavior provided yet.";

  const steps = useMemo(() => parseSteps(previewData.steps, safeComponent), [previewData.steps, safeComponent]);

  const recommendations =
    previewData.recommendations && previewData.recommendations.length > 0
      ? previewData.recommendations
      : [
          "Implement a visible focus indicator using CSS outline or border",
          "Ensure focus indicator has sufficient contrast ratio (minimum 3:1)",
          "Test with keyboard-only navigation",
          "Verify focus indicator is visible in both light and dark modes"
        ];

  const impact =
    previewData.affectedUsers?.trim() ||
    "This issue affects keyboard users and users with visual impairments who rely on visible focus indicators to navigate through the interface.";

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121822] to-[#0b1220] p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{c.title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onCopy();
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white transition hover:bg-white/10"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? c.copied : c.copy}</span>
          </button>
          <button
            type="button"
            onClick={onExportMarkdown}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            <span>{c.export}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-6 pr-2">
          <h2 className="text-[38px] font-semibold leading-tight text-white">Bug Report: {safeComponent}</h2>

          <div className="flex flex-wrap items-center gap-4">
            <div className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2 font-semibold text-white ${getSeverityClasses(safeSeverity)}`}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Severity: {safeSeverity}
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-zinc-300">
              Type: {safeIssueType}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-1 text-xs text-zinc-500">{c.wcag}</p>
            <p className="text-sm font-medium text-white">{safeWcag}</p>
          </div>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.description}</h3>
            <p className="leading-relaxed text-white">
              This report documents an accessibility issue found in the {safeComponent} component.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.actual}</h3>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="leading-relaxed text-white">{safeActual}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.expected}</h3>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <p className="leading-relaxed text-white">{safeExpected}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.impact}</h3>
            <p className="leading-relaxed text-white">{impact}</p>
          </section>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.steps}</h3>
            <ol className="space-y-2 text-white">
              {steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E41F07]/20 text-sm text-[#E41F07]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="mb-2 text-sm text-zinc-400">{c.recommendations}</h3>
            <ul className="space-y-2 text-white">
              {recommendations.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 text-[#E41F07]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <span className="mr-2 text-xs text-zinc-500">{c.moreExports}:</span>
          <Button variant="outline" size="sm" onClick={onExportText}>
            <FileText className="h-4 w-4" />
            {c.plain}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportJson}>
            <FileJson2 className="h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onExportJira}>
            <ExternalLink className="h-4 w-4" />
            {c.jira}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportAzure}>
            <ExternalLink className="h-4 w-4" />
            {c.azure}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportLinear}>
            <ExternalLink className="h-4 w-4" />
            {c.linear}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            {c.reset}
          </Button>
          <Button variant="secondary" size="sm" onClick={onSave}>
            <Save className="h-4 w-4" />
            {c.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

