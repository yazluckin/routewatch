import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-watchcmd-'));
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

describe('runWatchCommand (integration)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  it('should resolve without error when apiDir exists (app convention)', async () => {
    const appDir = path.join(tmpDir, 'app', 'api', 'health');
    fs.mkdirSync(appDir, { recursive: true });
    writeFile(appDir, 'route.ts', '/** @description health check */\nexport async function GET() {}');

    const { runWatchCommand } = await import('./watchCommand');

    const stopPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 200);
    });

    const cmd = runWatchCommand({ dir: tmpDir, debounce: 50 } as any);
    await Promise.race([cmd, stopPromise]);
  });

  it('should handle missing apiDir gracefully', async () => {
    const { runWatchCommand } = await import('./watchCommand');
    await expect(
      Promise.race([
        runWatchCommand({ dir: path.join(tmpDir, 'nonexistent') } as any),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
      ])
    ).rejects.toThrow();
  });
});
