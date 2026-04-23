/**
 * Formats a HealthReport into human-readable CLI output.
 */

import { HealthReport, RouteHealthScore } from '../analyzer/routeHealthScorer';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';

function colorForScore(score: number): string {
  if (score >= 70) return GREEN;
  if (score >= 40) return YELLOW;
  return RED;
}

function formatScoreLine(entry: RouteHealthScore): string {
  const color = colorForScore(entry.score);
  const bar = '#'.repeat(Math.round(entry.score / 10)).padEnd(10, '.');
  const issueText =
    entry.issues.length > 0 ? `  ⚠ ${entry.issues.join('; ')}` : '';
  return (
    `  ${color}[${bar}] ${entry.score.toString().padStart(3)}/100${RESET}` +
    `  ${entry.method.padEnd(6)} ${entry.routePath}${issueText}`
  );
}

export function formatHealthReport(report: HealthReport): string {
  const lines: string[] = [];

  lines.push(`${BOLD}Route Health Report${RESET}`);
  lines.push('='.repeat(50));

  if (report.scores.length === 0) {
    lines.push('  No routes found.');
    return lines.join('\n');
  }

  const sorted = [...report.scores].sort((a, b) => a.score - b.score);
  sorted.forEach((entry) => lines.push(formatScoreLine(entry)));

  lines.push('='.repeat(50));
  lines.push(
    `${BOLD}Summary:${RESET}` +
      `  Avg Score: ${report.averageScore}/100` +
      `  ${GREEN}Healthy: ${report.healthyCount}${RESET}` +
      `  ${YELLOW}Warning: ${report.warningCount}${RESET}` +
      `  ${RED}Critical: ${report.criticalCount}${RESET}`
  );

  return lines.join('\n');
}

export function formatHealthReportPlain(report: HealthReport): string {
  const lines: string[] = ['Route Health Report', '='.repeat(50)];

  if (report.scores.length === 0) {
    lines.push('No routes found.');
    return lines.join('\n');
  }

  const sorted = [...report.scores].sort((a, b) => a.score - b.score);
  sorted.forEach((entry) => {
    const issueText =
      entry.issues.length > 0 ? ` | Issues: ${entry.issues.join('; ')}` : '';
    lines.push(
      `  [${entry.score}/100] ${entry.method} ${entry.routePath}${issueText}`
    );
  });

  lines.push('='.repeat(50));
  lines.push(
    `Summary: Avg=${report.averageScore} Healthy=${report.healthyCount}` +
      ` Warning=${report.warningCount} Critical=${report.criticalCount}`
  );

  return lines.join('\n');
}
