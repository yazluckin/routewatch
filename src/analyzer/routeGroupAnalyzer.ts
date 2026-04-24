/**
 * Analyzes API routes grouped by prefix/namespace for high-level insights.
 */

import { RouteInfo } from '../scanner/routeScanner';

export interface RouteGroup {
  prefix: string;
  routes: RouteInfo[];
  totalRoutes: number;
  documentedCount: number;
  undocumentedCount: number;
  documentationCoverage: number;
}

export interface RouteGroupReport {
  groups: RouteGroup[];
  totalGroups: number;
}

/**
 * Extracts the top-level prefix segment from a route path.
 * e.g. "/api/users/[id]" -> "users"
 */
export function extractPrefix(routePath: string): string {
  const normalized = routePath.replace(/^\/api\//, '').replace(/^api\//, '');
  const parts = normalized.split('/');
  return parts[0] || 'root';
}

/**
 * Groups routes by their top-level prefix segment.
 */
export function groupRoutesByPrefix(routes: RouteInfo[]): RouteGroupReport {
  const map = new Map<string, RouteInfo[]>();

  for (const route of routes) {
    const prefix = extractPrefix(route.routePath);
    if (!map.has(prefix)) {
      map.set(prefix, []);
    }
    map.get(prefix)!.push(route);
  }

  const groups: RouteGroup[] = [];

  for (const [prefix, groupRoutes] of map.entries()) {
    const documentedCount = groupRoutes.filter((r) => r.hasJsDoc).length;
    const undocumentedCount = groupRoutes.length - documentedCount;
    const documentationCoverage =
      groupRoutes.length > 0
        ? Math.round((documentedCount / groupRoutes.length) * 100)
        : 0;

    groups.push({
      prefix,
      routes: groupRoutes,
      totalRoutes: groupRoutes.length,
      documentedCount,
      undocumentedCount,
      documentationCoverage,
    });
  }

  groups.sort((a, b) => b.totalRoutes - a.totalRoutes);

  return {
    groups,
    totalGroups: groups.length,
  };
}

/**
 * Formats a route group report as plain text.
 */
export function formatGroupReport(report: RouteGroupReport): string {
  if (report.totalGroups === 0) {
    return 'No route groups found.\n';
  }

  const lines: string[] = [`Route Groups (${report.totalGroups} total):\n`];

  for (const group of report.groups) {
    lines.push(`  /${group.prefix}`);
    lines.push(`    Routes: ${group.totalRoutes}`);
    lines.push(
      `    Documented: ${group.documentedCount} / ${group.totalRoutes} (${group.documentationCoverage}%)`
    );
    if (group.undocumentedCount > 0) {
      lines.push(`    Undocumented: ${group.undocumentedCount}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
