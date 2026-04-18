import { RouteReport } from '../index';

export interface SummaryStats {
  totalRoutes: number;
  deadRoutes: number;
  undocumentedRoutes: number;
  documentedRoutes: number;
  usedRoutes: number;
  coveragePercent: number;
  documentationPercent: number;
}

export function computeStats(report: RouteReport): SummaryStats {
  const totalRoutes = report.routes.length;
  const deadRoutes = report.deadRoutes.length;
  const undocumentedRoutes = report.undocumentedRoutes.length;
  const documentedRoutes = totalRoutes - undocumentedRoutes;
  const usedRoutes = totalRoutes - deadRoutes;
  const coveragePercent =
    totalRoutes === 0 ? 100 : Math.round((usedRoutes / totalRoutes) * 100);
  const documentationPercent =
    totalRoutes === 0 ? 100 : Math.round((documentedRoutes / totalRoutes) * 100);

  return {
    totalRoutes,
    deadRoutes,
    undocumentedRoutes,
    documentedRoutes,
    usedRoutes,
    coveragePercent,
    documentationPercent,
  };
}

export function formatSummary(report: RouteReport): string {
  const stats = computeStats(report);
  const lines: string[] = [
    '========== RouteWatch Summary ==========',
    `Total Routes       : ${stats.totalRoutes}`,
    `Used Routes        : ${stats.usedRoutes}`,
    `Dead Routes        : ${stats.deadRoutes}`,
    `Documented Routes  : ${stats.documentedRoutes}`,
    `Undocumented Routes: ${stats.undocumentedRoutes}`,
    `Usage Coverage     : ${stats.coveragePercent}%`,
    `Doc Coverage       : ${stats.documentationPercent}%`,
    '========================================',
  ];
  return lines.join('\n');
}
