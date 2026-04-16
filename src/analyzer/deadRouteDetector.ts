import { RouteInfo } from '../scanner/routeScanner';
import { UsageReport } from './usageAnalyzer';

export interface DeadRoute {
  route: string;
  methods: string[];
  filePath: string;
  hasDoc: boolean;
}

export interface DeadRouteReport {
  deadRoutes: DeadRoute[];
  totalRoutes: number;
  unusedCount: number;
  undocumentedCount: number;
}

export function detectDeadRoutes(
  routes: RouteInfo[],
  usage: UsageReport
): DeadRouteReport {
  const usedPaths = new Set(
    usage.calls.map((c) => normalizePath(c.endpoint))
  );

  const deadRoutes: DeadRoute[] = [];

  for (const route of routes) {
    const normalized = normalizePath(route.routePath);
    const isUsed = usedPaths.has(normalized) || isMatchedByDynamic(normalized, usedPaths);

    if (!isUsed) {
      deadRoutes.push({
        route: route.routePath,
        methods: route.methods,
        filePath: route.filePath,
        hasDoc: route.hasDoc,
      });
    }
  }

  const undocumentedCount = routes.filter((r) => !r.hasDoc).length;

  return {
    deadRoutes,
    totalRoutes: routes.length,
    unusedCount: deadRoutes.length,
    undocumentedCount,
  };
}

function normalizePath(p: string): string {
  return p.replace(/\/+$/, '').toLowerCase();
}

function isMatchedByDynamic(route: string, usedPaths: Set<string>): boolean {
  if (!route.includes('[')) return false;
  const pattern = route.replace(/\[.*?\]/g, '[^/]+');
  const regex = new RegExp(`^${pattern}$`);
  for (const used of usedPaths) {
    if (regex.test(used)) return true;
  }
  return false;
}
