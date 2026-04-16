import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { serializeReport, writeOutput } from './outputWriter';
import { Report } from './reportGenerator';

const mockReport: Report = {
  generatedAt: '2024-01-01T00:00:00.000Z',
  totalRoutes: 3,
  undocumentedRoutes: ['/api/users'],
  unusedRoutes: ['/api/legacy'],
  routes: [],
};

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-'));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('serializeReport', () => {
  it('returns valid JSON for json format', () => {
    const result = serializeReport(mockReport, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.totalRoutes).toBe(3);
    expect(parsed.unusedRoutes).toContain('/api/legacy');
  });

  it('returns text summary for text format', () => {
    const result = serializeReport(mockReport, 'text');
    expect(result).toContain('RouteWatch Report');
    expect(result).toContain('Total routes: 3');
    expect(result).toContain('/api/users');
    expect(result).toContain('/api/legacy');
  });
});

describe('writeOutput', () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = createTempDir(); });
  afterEach(() => cleanup(tmpDir));

  it('writes json report to file', () => {
    const outPath = path.join(tmpDir, 'report.json');
    writeOutput(mockReport, { format: 'json', outputPath: outPath });
    const content = fs.readFileSync(outPath, 'utf-8');
    const parsed = JSON.parse(content);
    expect(parsed.totalRoutes).toBe(3);
  });

  it('writes text report to file', () => {
    const outPath = path.join(tmpDir, 'report.txt');
    writeOutput(mockReport, { format: 'text', outputPath: outPath });
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content).toContain('RouteWatch Report');
  });

  it('creates nested directories if needed', () => {
    const outPath = path.join(tmpDir, 'nested', 'deep', 'report.json');
    writeOutput(mockReport, { format: 'json', outputPath: outPath });
    expect(fs.existsSync(outPath)).toBe(true);
  });
});
