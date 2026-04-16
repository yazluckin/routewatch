import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchRoutes } from './routeWatcher';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-watcher-'));
}

function writeFile(dir: string, relPath: string, content: string): string {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
  return full;
}

function cleanup(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('watchRoutes', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  it('should return a handle with a stop function', () => {
    const handle = watchRoutes(tmpDir, () => {}, 50);
    expect(typeof handle.stop).toBe('function');
    handle.stop();
  });

  it('should call onChange when a .ts file is created', (done) => {
    const handle = watchRoutes(
      tmpDir,
      (routes) => {
        handle.stop();
        expect(Array.isArray(routes)).toBe(true);
        done();
      },
      80
    );

    setTimeout(() => {
      writeFile(tmpDir, 'users/route.ts', 'export async function GET() {}');
    }, 30);
  }, 3000);

  it('should not call onChange for non-route file extensions', (done) => {
    let called = false;
    const handle = watchRoutes(
      tmpDir,
      () => { called = true; },
      80
    );

    setTimeout(() => {
      writeFile(tmpDir, 'notes.md', '# notes');
    }, 30);

    setTimeout(() => {
      handle.stop();
      expect(called).toBe(false);
      done();
    }, 300);
  }, 3000);
});
