import * as fs from 'fs';
import * as path from 'path';
import { Report } from './reportGenerator';

export type OutputFormat = 'text' | 'json';

export interface WriteOptions {
  format: OutputFormat;
  outputPath?: string;
}

export function serializeReport(report: Report, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  const lines: string[] = [];
  lines.push(`RouteWatch Report`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push(`Total routes: ${report.totalRoutes}`);
  lines.push(`Undocumented: ${report.undocumentedRoutes.length}`);
  lines.push(`Unused: ${report.unusedRoutes.length}`);
  if (report.undocumentedRoutes.length > 0) {
    lines.push('');
    lines.push('Undocumented Routes:');
    report.undocumentedRoutes.forEach(r => lines.push(`  - ${r}`));
  }
  if (report.unusedRoutes.length > 0) {
    lines.push('');
    lines.push('Unused Routes:');
    report.unusedRoutes.forEach(r => lines.push(`  - ${r}`));
  }
  return lines.join('\n');
}

export function writeOutput(report: Report, options: WriteOptions): void {
  const content = serializeReport(report, options.format);
  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(options.outputPath, content, 'utf-8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to write report to "${options.outputPath}": ${message}`);
    }
  } else {
    process.stdout.write(content + '\n');
  }
}
