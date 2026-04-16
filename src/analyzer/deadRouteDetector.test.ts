import { detectDeadRoutes } from './deadRouteDetector';
import { RouteInfo } from '../scanner/routeScanner';
import { UsageReport } from './usageAnalyzer';

const makeRoute = (routePath: string, methods = ['GET'], hasDoc = false): RouteInfo => ({
  filePath: `/app/pages/api${routePath}.ts`,
  routePath,
  methods,
  hasDoc,
});

const makeUsage = (endpoints: string[]): UsageReport => ({
  calls: endpoints.map((endpoint) => ({ endpoint, callerFile: 'src/page.tsx', line: 1 })),
});

describe('detectDeadRoutes', () => {
  it('marks unused routes as dead', () => {
    const routes = [makeRoute('/api/users'), makeRoute('/api/posts')];
    const usage = makeUsage(['/api/users']);
    const report = detectDeadRoutes(routes, usage);
    expect(report.deadRoutes).toHaveLength(1);
    expect(report.deadRoutes[0].route).toBe('/api/posts');
  });

  it('returns empty deadRoutes when all routes are used', () => {
    const routes = [makeRoute('/api/users')];
    const usage = makeUsage(['/api/users']);
    const report = detectDeadRoutes(routes, usage);
    expect(report.deadRoutes).toHaveLength(0);
  });

  it('matches dynamic routes against concrete calls', () => {
    const routes = [makeRoute('/api/users/[id]')];
    const usage = makeUsage(['/api/users/42']);
    const report = detectDeadRoutes(routes, usage);
    expect(report.deadRoutes).toHaveLength(0);
  });

  it('counts undocumented routes correctly', () => {
    const routes = [makeRoute('/api/a', ['GET'], true), makeRoute('/api/b', ['POST'], false)];
    const usage = makeUsage(['/api/a', '/api/b']);
    const report = detectDeadRoutes(routes, usage);
    expect(report.undocumentedCount).toBe(1);
  });

  it('reports correct totals', () => {
    const routes = [makeRoute('/api/x'), makeRoute('/api/y'), makeRoute('/api/z')];
    const usage = makeUsage(['/api/x']);
    const report = detectDeadRoutes(routes, usage);
    expect(report.totalRoutes).toBe(3);
    expect(report.unusedCount).toBe(2);
  });
});
