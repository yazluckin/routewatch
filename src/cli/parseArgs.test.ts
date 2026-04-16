import { parseArgs, HELP_TEXT } from './parseArgs';

function args(...parts: string[]): string[] {
  return ['node', 'routewatch', ...parts];
}

describe('parseArgs', () => {
  it('returns empty flags with no arguments', () => {
    const result = parseArgs(args());
    expect(result.flags).toEqual({});
    expect(result.showHelp).toBe(false);
    expect(result.showVersion).toBe(false);
  });

  it('sets showHelp on --help', () => {
    const result = parseArgs(args('--help'));
    expect(result.showHelp).toBe(true);
  });

  it('sets showVersion on --version', () => {
    const result = parseArgs(args('--version'));
    expect(result.showVersion).toBe(true);
  });

  it('parses --api-dir', () => {
    const result = parseArgs(args('--api-dir', 'pages/api'));
    expect(result.flags.apiDir).toBe('pages/api');
  });

  it('parses --src-dir', () => {
    const result = parseArgs(args('--src-dir', 'app'));
    expect(result.flags.srcDir).toBe('app');
  });

  it('parses --format json', () => {
    const result = parseArgs(args('--format', 'json'));
    expect(result.flags.reportFormat).toBe('json');
  });

  it('ignores invalid --format values', () => {
    const result = parseArgs(args('--format', 'xml'));
    expect(result.flags.reportFormat).toBeUndefined();
  });

  it('parses --ignore as comma-separated list', () => {
    const result = parseArgs(args('--ignore', 'health,metrics'));
    expect(result.flags.ignore).toEqual(['health', 'metrics']);
  });

  it('parses --fail-on-unused and --fail-on-undocumented', () => {
    const result = parseArgs(args('--fail-on-unused', '--fail-on-undocumented'));
    expect(result.flags.failOnUnused).toBe(true);
    expect(result.flags.failOnUndocumented).toBe(true);
  });

  it('parses --output', () => {
    const result = parseArgs(args('--output', 'report.txt'));
    expect(result.flags.outputFile).toBe('report.txt');
  });

  it('HELP_TEXT contains usage information', () => {
    expect(HELP_TEXT).toContain('Usage: routewatch');
    expect(HELP_TEXT).toContain('--api-dir');
  });
});
