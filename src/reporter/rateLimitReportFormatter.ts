import chalk from 'chalk';
import { RateLimitReport, RateLimitInfo, RateLimitRisk } from '../analyzer/routeRateLimitAnalyzer';

function colorForRisk(risk: RateLimitRisk): (s: string) => string {
  switch (risk) {
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    case 'low': return chalk.cyan;
    case 'none': return chalk.green;
  }
}

function formatRateLimitEntry(entry: RateLimitInfo): string {
  const color = colorForRisk(entry.risk);
  const riskLabel = color(`[${entry.risk.toUpperCase()}]`);
  const routeLabel = chalk.bold(entry.route.routePath);
  const methods = entry.route.methods.join(', ');
  const lines: string[] = [`  ${riskLabel} ${routeLabel} (${methods})` ];
  if (entry.suggestion) {
    lines.push(`         ${chalk.dim('→')} ${entry.suggestion}`);
  }
  return lines.join('\n');
}

export function formatRateLimitReport(report: RateLimitReport): string {
  const lines: string[] = [
    chalk.bold.underline('\n🚦 Rate Limit Analysis'),
    `Total routes: ${report.totalRoutes}`,
    `Unprotected public routes: ${chalk.red(String(report.unprotectedPublicRoutes))}`,
    '',
  ];

  const risky = report.entries.filter((e) => e.risk !== 'none');
  if (risky.length === 0) {
    lines.push(chalk.green('  ✔ All routes have rate limiting configured.'));
  } else {
    risky.forEach((entry) => lines.push(formatRateLimitEntry(entry)));
  }

  return lines.join('\n');
}

export function formatRateLimitReportPlain(report: RateLimitReport): string {
  const lines: string[] = [
    'Rate Limit Analysis',
    `Total routes: ${report.totalRoutes}`,
    `Unprotected public routes: ${report.unprotectedPublicRoutes}`,
    '',
  ];

  const risky = report.entries.filter((e) => e.risk !== 'none');
  if (risky.length === 0) {
    lines.push('  All routes have rate limiting configured.');
  } else {
    risky.forEach((entry) => {
      lines.push(`  [${entry.risk.toUpperCase()}] ${entry.route.routePath} (${entry.route.methods.join(', ')})`);
      if (entry.suggestion) lines.push(`    -> ${entry.suggestion}`);
    });
  }

  return lines.join('\n');
}
