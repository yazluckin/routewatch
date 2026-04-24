/**
 * Formats deprecation analysis results for CLI output.
 */

import { DeprecationReport, DeprecatedRoute } from '../analyzer/routeDeprecationAnalyzer';

const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function formatDeprecatedEntry(entry: DeprecatedRoute, colored: boolean): string {
  const tag = colored ? `${YELLOW}[DEPRECATED]${RESET}` : '[DEPRECATED]';
  const route = entry.route.routePath;
  const methods = entry.route.methods.join(', ');
  let line = `  ${tag} ${route} (${methods})`;
  if (entry.reason) line += `\n    Reason: ${entry.reason}`;
  if (entry.since) line += `\n    Since: ${entry.since}`;
  if (entry.replacement) line += `\n    Replacement: ${entry.replacement}`;
  return line;
}

export function formatDeprecationReport(
  report: DeprecationReport,
  colored = true
): string {
  const lines: string[] = [];
  const header = colored
    ? `${BOLD}Deprecation Report${RESET}`
    : 'Deprecation Report';

  lines.push(header);
  lines.push(
    `Total routes: ${report.total} | Deprecated: ${
      colored && report.deprecatedCount > 0
        ? `${RED}${report.deprecatedCount}${RESET}`
        : report.deprecatedCount
    }`
  );

  if (report.deprecatedCount === 0) {
    lines.push('  No deprecated routes found.');
  } else {
    lines.push('');
    for (const entry of report.deprecated) {
      lines.push(formatDeprecatedEntry(entry, colored));
    }
  }

  return lines.join('\n');
}

export function formatDeprecationReportPlain(report: DeprecationReport): string {
  return formatDeprecationReport(report, false);
}
