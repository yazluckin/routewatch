import { RouteWatchConfig } from './config';

export interface ParsedArgs {
  flags: Partial<RouteWatchConfig>;
  showHelp: boolean;
  showVersion: boolean;
}

const HELP_TEXT = `
Usage: routewatch [options]

Options:
  --api-dir <path>          Path to the API routes directory
  --src-dir <path>          Root source directory to scan for usage (default: src)
  --ignore <glob,...>       Comma-separated list of glob patterns to ignore
  --format <text|json>      Report output format (default: text)
  --output <file>           Write report to a file instead of stdout
  --fail-on-unused          Exit with code 1 if unused routes are found
  --fail-on-undocumented    Exit with code 1 if undocumented routes are found
  --help                    Show this help message
  --version                 Show version
`.trim();

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const flags: Partial<RouteWatchConfig> = {};
  let showHelp = false;
  let showVersion = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help': showHelp = true; break;
      case '--version': showVersion = true; break;
      case '--fail-on-unused': flags.failOnUnused = true; break;
      case '--fail-on-undocumented': flags.failOnUndocumented = true; break;
      case '--api-dir': flags.apiDir = args[++i]; break;
      case '--src-dir': flags.srcDir = args[++i]; break;
      case '--output': flags.outputFile = args[++i]; break;
      case '--format':
        const fmt = args[++i];
        if (fmt === 'json' || fmt === 'text') flags.reportFormat = fmt;
        break;
      case '--ignore':
        flags.ignore = (args[++i] ?? '').split(',').filter(Boolean);
        break;
    }
  }

  return { flags, showHelp, showVersion };
}

export { HELP_TEXT };
