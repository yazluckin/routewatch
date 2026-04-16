import * as fs from 'fs';
import * as path from 'path';

export interface RouteWatchConfig {
  apiDir?: string;
  srcDir?: string;
  ignore?: string[];
  reportFormat?: 'text' | 'json';
  outputFile?: string;
  failOnUnused?: boolean;
  failOnUndocumented?: boolean;
}

const CONFIG_FILE_NAMES = [
  'routewatch.config.json',
  '.routewatchrc',
  '.routewatchrc.json',
];

export function loadConfig(cwd: string = process.cwd()): RouteWatchConfig {
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.join(cwd, fileName);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as RouteWatchConfig;
      } catch (err) {
        console.warn(`[routewatch] Failed to parse config file: ${filePath}`);
      }
    }
  }
  return {};
}

export function mergeConfig(
  fileConfig: RouteWatchConfig,
  cliFlags: Partial<RouteWatchConfig>
): RouteWatchConfig {
  return {
    apiDir: cliFlags.apiDir ?? fileConfig.apiDir,
    srcDir: cliFlags.srcDir ?? fileConfig.srcDir ?? 'src',
    ignore: cliFlags.ignore ?? fileConfig.ignore ?? [],
    reportFormat: cliFlags.reportFormat ?? fileConfig.reportFormat ?? 'text',
    outputFile: cliFlags.outputFile ?? fileConfig.outputFile,
    failOnUnused: cliFlags.failOnUnused ?? fileConfig.failOnUnused ?? false,
    failOnUndocumented: cliFlags.failOnUndocumented ?? fileConfig.failOnUndocumented ?? false,
  };
}
