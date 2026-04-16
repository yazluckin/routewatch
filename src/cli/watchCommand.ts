import * as path from 'path';
import { resolveApiDir } from '../scanner/resolveApiDir';
import { scanRoutes } from '../scanner/routeScanner';
import { watchRoutes } from '../scanner/routeWatcher';
import { analyzeUsage } from '../analyzer/usageAnalyzer';
import { generateReport } from '../reporter/reportGenerator';
import { formatReportText } from '../reporter/reportGenerator';
import { ParsedArgs } from './parseArgs';

export async function runWatchCommand(args: ParsedArgs): Promise<void> {
  const cwd = process.cwd();
  const apiDir = resolveApiDir(args.dir || cwd);

  console.log(`[routewatch] Watching ${apiDir} for changes...\n`);

  const printReport = async () => {
    try {
      const routes = await scanRoutes(apiDir);
      const srcDir = path.resolve(args.dir || cwd);
      const usage = await analyzeUsage(srcDir);
      const report = generateReport(routes, usage);
      console.clear();
      console.log('[routewatch] Route report updated:\n');
      console.log(formatReportText(report));
    } catch (err) {
      console.error('[routewatch] Failed to generate report:', err);
    }
  };

  await printReport();

  const handle = watchRoutes(apiDir, async () => {
    await printReport();
  }, args.debounce ?? 300);

  process.on('SIGINT', () => {
    console.log('\n[routewatch] Stopping watcher.');
    handle.stop();
    process.exit(0);
  });
}
