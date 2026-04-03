export type JiraExportConfig = {
  baseUrl: string;
  projectKey: string;
  issueType: string;
};

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function buildJiraCreateIssueUrl(
  config: JiraExportConfig,
  summary: string,
  description: string
) {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const projectKey = config.projectKey.trim().toUpperCase();
  const issueType = config.issueType.trim() || "Bug";

  if (!baseUrl || !projectKey) {
    return null;
  }

  const params = new URLSearchParams({
    issuetype: issueType,
    summary,
    description
  });

  return `${baseUrl}/jira/software/c/projects/${encodeURIComponent(projectKey)}/issues/create?${params.toString()}`;
}
