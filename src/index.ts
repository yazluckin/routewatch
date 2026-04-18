export { scanRoutes } from './scanner';
export { analyzeUsage } from './analyzer';
export { generateReport, formatReportText, serializeReport, writeOutput, computeStats, formatSummary } from './reporter';
export type { SummaryStats } from './reporter';

export interface RouteInfo {
  path: string;
  methods: string[];
  documented: boolean;
  filePath: string;
}

export interface RouteReport {
  routes: RouteInfo[];
  deadRoutes: RouteInfo[];
  undocumentedRoutes: RouteInfo[];
  generatedAt: string;
}
