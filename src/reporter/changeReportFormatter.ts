import { RouteChangeReport, RouteChange } from '../analyzer/routeChangeDetector';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function formatChange(change: RouteChange, useColor: boolean): string {
  const { type, route, previousRoute } = change;
  const icon = type === 'added' ? '+' : type === 'removed' ? '-' : '~';
  const color = useColor
    ? type === 'added' ? GREEN : type === 'removed' ? RED : YELLOW
    : '';
  const end = useColor ? RESET : '';
  let line = `  ${color}${icon} ${route.routePath}${end}`;
  if (type === 'modified' && previousRoute) {
    const prevMethods = previousRoute.methods.join(', ');
    const currMethods = route.methods.join(', ');
    if (prevMethods !== currMethods) {
      line += ` ${DIM}(methods: ${prevMethods} → ${currMethods})${RESET}`;
    }
    if (previousRoute.hasJsDoc !== route.hasJsDoc) {
      const docChange = route.hasJsDoc ? 'added docs' : 'removed docs';
      line += ` ${DIM}(${docChange})${RESET}`;
    }
  }
  return line;
}

export function formatChangeReport(
  report: RouteChangeReport,
  useColor = true
): string {
  const lines: string[] = [];
  const bold = useColor ? BOLD : '';
  const reset = useColor ? RESET : '';
  const dim = useColor ? DIM : '';

  lines.push(`${bold}Route Changes${reset}`);
  lines.push(
    `${dim}Snapshot: ${new Date(report.snapshotTimestamp).toISOString()}${reset}`
  );
  lines.push('');

  if (report.changes.length === 0) {
    lines.push('  No changes detected.');
  } else {
    for (const change of report.changes) {
      lines.push(formatChange(change, useColor));
    }
    lines.push('');
    lines.push(
      `  ${GREEN}+${reset} ${report.addedCount} added  ` +
      `${RED}-${reset} ${report.removedCount} removed  ` +
      `${YELLOW}~${reset} ${report.modifiedCount} modified`
    );
  }

  return lines.join('\n');
}

export function formatChangeReportPlain(report: RouteChangeReport): string {
  return formatChangeReport(report, false);
}
