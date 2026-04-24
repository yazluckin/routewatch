import { ScannedRoute } from '../scanner';
import { UsageAnalysisResult } from './usageAnalyzer';
import { DeadRouteResult } from './deadRouteDetector';
import { UndocumentedRouteResult } from './undocumentedRouteDetector';

export interface RouteCoverageReport {
  totalRoutes: number;
  usedRoutes: number;
  unusedRoutes: number;
  documentedRoutes: number;
  undocumentedRoutes: number;
  coveragePercent: number;
  documentationPercent: number;
}

export function computeRouteCoverage(
  routes: ScannedRoute[],
  usage: UsageAnalysisResult,
  dead: DeadRouteResult,
  undocumented: UndocumentedRouteResult
): RouteCoverageReport {
  const totalRoutes = routes.length;
  const unusedRoutes = dead.deadRoutes.length;
  const usedRoutes = totalRoutes - unusedRoutes;
  const undocumentedCount = undocumented.undocumentedRoutes.length;
  const documentedRoutes = totalRoutes - undocumentedCount;

  const coveragePercent =
    totalRoutes === 0 ? 100 : Math.round((usedRoutes / totalRoutes) * 100);

  const documentationPercent =
    totalRoutes === 0 ? 100 : Math.round((documentedRoutes / totalRoutes) * 100);

  return {
    totalRoutes,
    usedRoutes,
    unusedRoutes,
    documentedRoutes,
    undocumentedRoutes: undocumentedCount,
    coveragePercent,
    documentationPercent,
  };
}

export function formatCoverageReport(report: RouteCoverageReport): string {
  const lines: string[] = [];
  lines.push('── Route Coverage Report ──────────────────────');
  lines.push(`  Total Routes       : ${report.totalRoutes}`);
  lines.push(
    `  Used Routes        : ${report.usedRoutes} (${report.coveragePercent}%)`
  );
  lines.push(
    `  Unused Routes      : ${report.unusedRoutes}`
  );
  lines.push(
    `  Documented Routes  : ${report.documentedRoutes} (${report.documentationPercent}%)`
  );
  lines.push(
    `  Undocumented Routes: ${report.undocumentedRoutes}`
  );
  lines.push('────────────────────────────────────────────────');
  return lines.join('\n');
}
