import fs from 'fs';
import path from 'path';
import os from 'os';
import { scanRoutes, RouteInfo } from './routeScanner';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-test-'));
}

function writeFile(dir: string, relPath: string, content: string) {
  const fullPath = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('scanRoutes', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = createTempDir(); });
  afterEach(() => cleanup(tmpDir));

  it('returns empty array for empty directory', () => {
    expect(scanRoutes(tmpDir)).toEqual([]);
  });

  it('detects exported HTTP methods', () => {
    writeFile(tmpDir, 'users.ts', `export async function GET() {} export function POST() {}`);
    const routes = scanRoutes(tmpDir);
    expect(routes[0].methods).toContain('GET');
    expect(routes[0].methods).toContain('POST');
  });

  it('flags missing JSDoc', () => {
    writeFile(tmpDir, 'items.ts', `export function GET() {}`);
    const routes = scanRoutes(tmpDir);
    expect(routes[0].hasJsDoc).toBe(false);
  });

  it('detects JSDoc comments', () => {
    writeFile(tmpDir, 'items.ts', `/** @description Get items */\nexport function GET() {}`);
    const routes = scanRoutes(tmpDir);
    expect(routes[0].hasJsDoc).toBe(true);
  });

  it('converts dynamic segments to colon params', () => {
    writeFile(tmpDir, '[id]/route.ts', `export function GET() {}`);
    const routes = scanRoutes(tmpDir);
    expect(routes[0].routePath).toContain(':id');
  });

  it('walks nested directories', () => {
    writeFile(tmpDir, 'a/b/c.ts', `export function DELETE() {}`);
    const routes = scanRoutes(tmpDir);
    expect(routes.length).toBe(1);
    expect(routes[0].methods).toContain('DELETE');
  });
});
