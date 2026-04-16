import { parseArgs } from './parseArgs';

describe('parseArgs()', () => {
  it('returns defaults when no args provided', () => {
    const result = parseArgs([]);
    expect(result.apiDir).toBeUndefined();
    expect(result.srcDir).toBeUndefined();
    expect(result.failOnUnused).toBe(false);
    expect(result.failOnUndocumented).toBe(false);
  });

  it('parses --api-dir flag', () => {
    const result = parseArgs(['--api-dir', 'app/api']);
    expect(result.apiDir).toBe('app/api');
  });

  it('parses --src-dir flag', () => {
    const result = parseArgs(['--src-dir', 'src']);
    expect(result.srcDir).toBe('src');
  });

  it('parses --fail-on-unused flag', () => {
    const result = parseArgs(['--fail-on-unused']);
    expect(result.failOnUnused).toBe(true);
  });

  it('parses --fail-on-undocumented flag', () => {
    const result = parseArgs(['--fail-on-undocumented']);
    expect(result.failOnUndocumented).toBe(true);
  });

  it('parses combined flags', () => {
    const args = ['--api-dir', 'pages/api', '--fail-on-unused', '--fail-on-undocumented'];
    const result = parseArgs(args);
    expect(result.apiDir).toBe('pages/api');
    expect(result.failOnUnused).toBe(true);
    expect(result.failOnUndocumented).toBe(true);
  });

  it('ignores unknown flags gracefully', () => {
    const result = parseArgs(['--unknown-flag', 'value']);
    expect(result.apiDir).toBeUndefined();
  });
});
