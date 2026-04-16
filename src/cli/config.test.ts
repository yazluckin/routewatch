import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadConfig, mergeConfig, RouteWatchConfig } from './config';

let tmpDir: string;

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-config-test-'));
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}

beforeEach(() => {
  tmpDir = createTempDir();
});

afterEach(() => {
  cleanup(tmpDir);
});

describe('loadConfig', () => {
  it('returns empty object when no config file exists', () => {
    const config = loadConfig(tmpDir);
    expect(config).toEqual({});
  });

  it('loads routewatch.config.json when present', () => {
    const data: RouteWatchConfig = { apiDir: 'pages/api', failOnUnused: true };
    fs.writeFileSync(
      path.join(tmpDir, 'routewatch.config.json'),
      JSON.stringify(data)
    );
    const config = loadConfig(tmpDir);
    expect(config.apiDir).toBe('pages/api');
    expect(config.failOnUnused).toBe(true);
  });

  it('loads .routewatchrc when present', () => {
    const data: RouteWatchConfig = { reportFormat: 'json' };
    fs.writeFileSync(path.join(tmpDir, '.routewatchrc'), JSON.stringify(data));
    const config = loadConfig(tmpDir);
    expect(config.reportFormat).toBe('json');
  });
});

describe('mergeConfig', () => {
  it('cli flags override file config', () => {
    const file: RouteWatchConfig = { apiDir: 'pages/api', reportFormat: 'text' };
    const flags: Partial<RouteWatchConfig> = { reportFormat: 'json' };
    const merged = mergeConfig(file, flags);
    expect(merged.reportFormat).toBe('json');
    expect(merged.apiDir).toBe('pages/api');
  });

  it('applies defaults for missing values', () => {
    const merged = mergeConfig({}, {});
    expect(merged.srcDir).toBe('src');
    expect(merged.ignore).toEqual([]);
    expect(merged.failOnUnused).toBe(false);
    expect(merged.failOnUndocumented).toBe(false);
    expect(merged.reportFormat).toBe('text');
  });
});
