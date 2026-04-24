import {
  ComplexityReport,
  RouteComplexityResult,
} from '../analyzer/routeComplexityAnalyzer';

const LABEL_COLORS: Record<RouteComplexityResult['label'], string> = {
  simple: '\x1b[32m',
  moderate: '\x1b[33m',
  complex: '\x1b[31m',
};
const RESET = '\x1b[0m';

export function formatComplexityLine(
  result: RouteComplexityResult,
  useColor = true
): string {
  const { route, score, label, factors } = result;
  const color = useColor ? LABEL_COLORS[label] : '';
  const reset = useColor ? RESET : '';
  const methods = route.methods.join(', ');
  const detail = `depth=${factors.nestingDepth} params=${factors.paramCount} methods=${factors.methodCount}`;
  return `${color}[${label.toUpperCase()}]${reset} ${route.routePath} (${methods}) — score: ${score} | ${detail}`;
}

export function formatComplexityReport(
  report: ComplexityReport,
  useColor = true
): string {
  if (report.results.length === 0) {
    return 'No routes found for complexity analysis.';
  }

  const lines: string[] = [];
  lines.push('Route Complexity Report');
  lines.push('=======================');

  const sorted = [...report.results].sort((a, b) => b.score - a.score);
  for (const result of sorted) {
    lines.push(formatComplexityLine(result, useColor));
  }

  lines.push('');
  lines.push(`Average complexity score : ${report.averageScore.toFixed(2)}`);

  if (report.mostComplex) {
    lines.push(
      `Most complex route       : ${report.mostComplex.route.routePath} (score: ${report.mostComplex.score})`
    );
  }

  const complex = report.results.filter(r => r.label === 'complex').length;
  const moderate = report.results.filter(r => r.label === 'moderate').length;
  const simple = report.results.filter(r => r.label === 'simple').length;
  lines.push(`Breakdown                : ${simple} simple, ${moderate} moderate, ${complex} complex`);

  return lines.join('\n');
}

export function formatComplexityReportPlain(report: ComplexityReport): string {
  return formatComplexityReport(report, false);
}
