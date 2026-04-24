/**
 * Formats latency hint reports for CLI output.
 */

import chalk from 'chalk';
import { LatencyHintReport, LatencyRisk, RouteLatencyHint } from '../analyzer/routeLatencyHintAnalyzer';

function colorForRisk(risk: LatencyRisk): (s: string) => string {
  switch (risk) {
    case 'high':
      return chalk.red;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.green;
  }
}

export function formatLatencyHintEntry(hint: RouteLatencyHint): string {
  const color = colorForRisk(hint.risk);
  const badge = color(`[${hint.risk.toUpperCase()}]`);
  const route = chalk.bold(hint.routePath);
  const reasons =
    hint.reasons.length > 0
      ? `\n    Reasons: ${hint.reasons.join('; ')}`
      : '';
  return `  ${badge} ${route}${reasons}`;
}

export function formatLatencyHintReport(report: LatencyHintReport): string {
  const lines: string[] = [
    chalk.bold.underline('\nRoute Latency Risk Report'),
    `  ${chalk.red('High Risk:')}   ${report.highRiskCount}`,
    `  ${chalk.yellow('Medium Risk:')} ${report.mediumRiskCount}`,
    `  ${chalk.green('Low Risk:')}    ${report.lowRiskCount}`,
    '',
  ];

  const sorted = [...report.hints].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  for (const hint of sorted) {
    lines.push(formatLatencyHintEntry(hint));
  }

  return lines.join('\n');
}

export function formatLatencyHintReportPlain(report: LatencyHintReport): string {
  const lines: string[] = [
    'Route Latency Risk Report',
    `High Risk: ${report.highRiskCount}`,
    `Medium Risk: ${report.mediumRiskCount}`,
    `Low Risk: ${report.lowRiskCount}`,
    '',
  ];

  const sorted = [...report.hints].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  for (const hint of sorted) {
    const reasons =
      hint.reasons.length > 0 ? ` | ${hint.reasons.join('; ')}` : '';
    lines.push(`  [${hint.risk.toUpperCase()}] ${hint.routePath}${reasons}`);
  }

  return lines.join('\n');
}
