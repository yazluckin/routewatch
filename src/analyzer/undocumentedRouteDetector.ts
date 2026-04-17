import { RouteInfo } from '../scanner/routeScanner';

export interface UndocumentedRoute {
  route: string;
  method: string;
  filePath: string;
}

export interface UndocumentedRouteReport {
  undocumented: UndocumentedRoute[];
  total: number;
  documented: number;
}

/**
 * Detects routes that lack JSDoc documentation.
 * A route is considered documented if it has a JSDoc comment
 * associated with its handler.
 */
export function detectUndocumentedRoutes(
  routes: RouteInfo[]
): UndocumentedRouteReport {
  const undocumented: UndocumentedRoute[] = [];

  for (const route of routes) {
    for (const method of route.methods) {
      if (!route.hasJsDoc) {
        undocumented.push({
          route: route.routePath,
          method,
          filePath: route.filePath,
        });
      }
    }
  }

  const totalEndpoints = routes.reduce((sum, r) => sum + r.methods.length, 0);
  const documentedCount = totalEndpoints - undocumented.length;

  return {
    undocumented,
    total: totalEndpoints,
    documented: documentedCount,
  };
}

export function formatUndocumentedReport(
  report: UndocumentedRouteReport
): string {
  const lines: string[] = [];
  lines.push(`Undocumented Routes: ${report.undocumented.length} / ${report.total}`);

  if (report.undocumented.length === 0) {
    lines.push('  All routes are documented.');
    return lines.join('\n');
  }

  for (const entry of report.undocumented) {
    lines.push(`  [${entry.method.toUpperCase()}] ${entry.route} — ${entry.filePath}`);
  }

  return lines.join('\n');
}
