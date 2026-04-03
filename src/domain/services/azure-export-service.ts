export type AzureExportConfig = {
  baseUrl: string;
  workItemType: string;
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

export function buildAzureCreateWorkItemUrl(
  config: AzureExportConfig,
  title: string,
  description: string
) {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const workItemType = config.workItemType.trim() || "Bug";

  if (!baseUrl) {
    return null;
  }

  const params = new URLSearchParams({
    title,
    description
  });

  return `${baseUrl}/_workitems/create/${encodeURIComponent(workItemType)}?${params.toString()}`;
}
