import { detectUndocumentedRoutes, formatUndocumentedReport } from './undocumentedRouteDetector';
import { RouteInfo } from '../scanner/routeScanner';

const makeRoute = (overrides: Partial<RouteInfo> = {}): RouteInfo => ({
  filePath: '/project/pages/api/users.ts',
  routePath: '/api/users',
  methods: ['GET'],
  hasJsDoc: false,
  ...overrides,
});

describe('detectUndocumentedRoutes', () => {
  it('flags routes without JSDoc', () => {
    const routes = [makeRoute({ hasJsDoc: false })];
    const report = detectUndocumentedRoutes(routes);
    expect(report.undocumented).toHaveLength(1);
    expect(report.undocumented[0].route).toBe('/api/users');
    expect(report.undocumented[0].method).toBe('GET');
  });

  it('does not flag routes with JSDoc', () => {
    const routes = [makeRoute({ hasJsDoc: true })];
    const report = detectUndocumentedRoutes(routes);
    expect(report.undocumented).toHaveLength(0);
    expect(report.documented).toBe(1);
  });

  it('handles multiple methods per route', () => {
    const routes = [
      makeRoute({ methods: ['GET', 'POST'], hasJsDoc: false }),
    ];
    const report = detectUndocumentedRoutes(routes);
    expect(report.undocumented).toHaveLength(2);
    expect(report.total).toBe(2);
  });

  it('returns correct totals for mixed routes', () => {
    const routes = [
      makeRoute({ routePath: '/api/users', hasJsDoc: true }),
      makeRoute({ routePath: '/api/posts', hasJsDoc: false }),
    ];
    const report = detectUndocumentedRoutes(routes);
    expect(report.total).toBe(2);
    expect(report.documented).toBe(1);
    expect(report.undocumented).toHaveLength(1);
  });
});

describe('formatUndocumentedReport', () => {
  it('shows all documented message when none are missing', () => {
    const report = { undocumented: [], total: 2, documented: 2 };
    const text = formatUndocumentedReport(report);
    expect(text).toContain('All routes are documented');
  });

  it('lists undocumented routes', () => {
    const report = {
      undocumented: [{ route: '/api/users', method: 'get', filePath: 'pages/api/users.ts' }],
      total: 1,
      documented: 0,
    };
    const text = formatUndocumentedReport(report);
    expect(text).toContain('[GET] /api/users');
    expect(text).toContain('pages/api/users.ts');
  });
});
