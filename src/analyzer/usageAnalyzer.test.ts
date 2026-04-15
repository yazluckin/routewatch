import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { extractApiCallsFromFile, analyzeUsage, walkSourceFiles } from './usageAnalyzer';

let tmpDir: string;

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-usage-'));
}

function writeFile(dir: string, filePath: string, content: string): string {
  const full = path.join(dir, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return full;
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}

beforeEach(() => { tmpDir = createTempDir(); });
afterEach(() => { cleanup(tmpDir); });

describe('extractApiCallsFromFile', () => {
  it('detects fetch calls to /api/ routes', () => {
    const file = writeFile(tmpDir, 'page.tsx', `
      fetch('/api/users', { method: 'POST' });
    `);
    const calls = extractApiCallsFromFile(file);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ url: '/api/users', method: 'POST' });
  });

  it('defaults to GET for fetch without explicit method', () => {
    const file = writeFile(tmpDir, 'page.tsx', `fetch('/api/products')`);
    const calls = extractApiCallsFromFile(file);
    expect(calls[0].method).toBe('GET');
  });

  it('detects axios calls', () => {
    const file = writeFile(tmpDir, 'service.ts', `axios.delete('/api/items/1')`);
    const calls = extractApiCallsFromFile(file);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe('DELETE');
  });

  it('ignores non-api URLs', () => {
    const file = writeFile(tmpDir, 'page.tsx', `fetch('https://external.com/data')`);
    const calls = extractApiCallsFromFile(file);
    expect(calls).toHaveLength(0);
  });
});

describe('walkSourceFiles', () => {
  it('finds ts and tsx files recursively', () => {
    writeFile(tmpDir, 'a.ts', '');
    writeFile(tmpDir, 'sub/b.tsx', '');
    writeFile(tmpDir, 'sub/c.css', '');
    const files = walkSourceFiles(tmpDir);
    expect(files.some(f => f.endsWith('a.ts'))).toBe(true);
    expect(files.some(f => f.endsWith('b.tsx'))).toBe(true);
    expect(files.some(f => f.endsWith('c.css'))).toBe(false);
  });
});

describe('analyzeUsage', () => {
  it('counts usages for matched routes', () => {
    writeFile(tmpDir, 'page.tsx', `fetch('/api/users')`);
    const routes = [{ routePath: '/api/users', method: 'GET' }];
    const result = analyzeUsage(tmpDir, routes);
    expect(result[0].usageCount).toBe(1);
    expect(result[0].callers).toHaveLength(1);
  });

  it('marks unused routes with usageCount 0', () => {
    writeFile(tmpDir, 'page.tsx', `fetch('/api/other')`);
    const routes = [{ routePath: '/api/users', method: 'GET' }];
    const result = analyzeUsage(tmpDir, routes);
    expect(result[0].usageCount).toBe(0);
  });
});
