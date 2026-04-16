import fs from 'fs';
import os from 'os';
import path from 'path';
import { run } from './runner';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-runner-'));
}

function writeFile(dir: string, relPath: string, content: string): void {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('run()', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  it('runs without error when a valid Next.js pages/api dir exists', async () => {
    writeFile(tmpDir, 'pages/api/hello.ts', `
      /**
       * @route GET /api/hello
       */
      export default function handler(req, res) { res.json({ ok: true }); }
    `);
    writeFile(tmpDir, 'src/index.ts', `fetch('/api/hello');`);

    await expect(run({ cwd: tmpDir, argv: [] })).resolves.toBeUndefined();
  });

  it('exits with code 1 when failOnUnused and there are unused routes', async () => {
    writeFile(tmpDir, 'pages/api/unused.ts', `
      export default function handler(req, res) { res.json({}); }
    `);
    writeFile(tmpDir, 'src/index.ts', `// no api calls here`);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`);
    });

    await expect(
      run({ cwd: tmpDir, argv: ['--fail-on-unused'] })
    ).rejects.toThrow('process.exit(1)');

    mockExit.mockRestore();
  });
});
