import { ScanResult } from '../scanner/routeScanner';
import { UsageResult } from '../analyzer/usageAnalyzer';

export interface RouteReport {
  route: string;
  methods: string[];
  documented: boolean;
  usageCount: number;
  unused: boolean;
  undocumented: boolean;
}

export interface Report {
  totalRoutes: number;
  unusedRoutes: RouteReport[];
  undocumentedRoutes: RouteReport[];
  allRoutes: RouteReport[];
  generatedAt: string;
}

export function generateReport(
  scanResults: ScanResult[],
  usageResult: UsageResult
): Report {
  const allRoutes: RouteReport[] = scanResults.map((scan) => {
    const usageCount = usageResult.usageCounts[scan.routePath] ?? 0;
    return {
      route: scan.routePath,
      methods: scan.methods,
      documented: scan.hasJsDoc,
      usageCount,
      unused: usageCount === 0,
      undocumented: !scan.hasJsDoc,
    };
  });

  return {
    totalRoutes: allRoutes.length,
    unusedRoutes: allRoutes.filter((r) => r.unused),
    undocumentedRoutes: allRoutes.filter((r) => r.undocumented),
    allRoutes,
    generatedAt: new Date().toISOString(),
  };
}

export function formatReportText(report: Report): string {
  const lines: string[] = [];

  lines.push(`RouteWatch Report — ${report.generatedAt}`);
  lines.push(`Total routes scanned: ${report.totalRoutes}`);
  lines.push('');

  if (report.unusedRoutes.length === 0) {
    lines.push('✅ No unused routes detected.');
  } else {
    lines.push(`⚠️  Unused routes (${report.unusedRoutes.length}):`);
    report.unusedRoutes.forEach((r) => {
      lines.push(`  - ${r.route} [${r.methods.join(', ')}]`);
    });
  }

  lines.push('');

  if (report.undocumentedRoutes.length === 0) {
    lines.push('✅ All routes are documented.');
  } else {
    lines.push(`📄 Undocumented routes (${report.undocumentedRoutes.length}):`);
    report.undocumentedRoutes.forEach((r) => {
      lines.push(`  - ${r.route} [${r.methods.join(', ')}]`);
    });
  }

  return lines.join('\n');
}
