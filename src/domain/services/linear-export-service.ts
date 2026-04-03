export type LinearExportConfig = {
  teamId: string;
};

export function buildLinearCreateIssueUrl(
  config: LinearExportConfig,
  title: string,
  description: string
) {
  const teamId = config.teamId.trim();

  if (!teamId) {
    return null;
  }

  const params = new URLSearchParams({
    title,
    description
  });

  return `https://linear.app/${encodeURIComponent(teamId)}/new?${params.toString()}`;
}
