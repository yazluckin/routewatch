import path from 'path';
import { resolveApiDir } from '../scanner/resolveApiDir';
import { scanRoutes } from '../scanner/routeScanner';
import { analyzeUsage } from '../analyzer/usageAnalyzer';
import { generateReport, formatReportText } from '../reporter/reportGenerator';
import { loadConfig, mergeConfig } from './config';
import { parseArgs } from './parseArgs';

export interface RunOptions {
  cwd?: string;
  argv?: string[];
}

export async function run(options: RunOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const argv = options.argv ?? process.argv.slice(2);

  const args = parseArgs(argv);
  const fileConfig = await loadConfig(cwd);
  const config = mergeConfig(fileConfig, args);

  const apiDir = resolveApiDir(cwd, config.apiDir);
  if (!apiDir) {
    console.error('Could not resolve API directory. Is this a Next.js project?');
    process.exit(1);
  }

  const routes = await scanRoutes(apiDir);
  const srcDir = path.resolve(cwd, config.srcDir ?? 'src');
  const usageMap = await analyzeUsage(srcDir, routes);

  const report = generateReport(routes, usageMap);
  const output = formatReportText(report);

  console.log(output);

  if (config.failOnUnused && report.unusedRoutes.length > 0) {
    process.exit(1);
  }

  if (config.failOnUndocumented && report.undocumentedRoutes.length > 0) {
    process.exit(1);
  }
}
