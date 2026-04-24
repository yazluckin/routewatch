import {
  extractPrefix,
  groupRoutesByPrefix,
  formatGroupReport,
  RouteGroupReport,
} from './routeGroupAnalyzer';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(routePath: string, hasJsDoc = false): RouteInfo {
  return {
    filePath: `/project/pages/api/${routePath}.ts`,
    routePath: `/api/${routePath}`,
    methods: ['GET'],
    hasJsDoc,
  };
}

describe('extractPrefix', () => {
  it('extracts top-level segment from /api/ path', () => {
    expect(extractPrefix('/api/users/[id]')).toBe('users');
  });

  it('extracts top-level segment without leading slash', () => {
    expect(extractPrefix('api/products')).toBe('products');
  });

  it('returns root for bare /api path', () => {
    expect(extractPrefix('/api/')).toBe('root');
  });

  it('handles single segment routes', () => {
    expect(extractPrefix('/api/health')).toBe('health');
  });
});

describe('groupRoutesByPrefix', () => {
  it('groups routes by prefix', () => {
    const routes = [
      makeRoute('users'),
      makeRoute('users/[id]', true),
      makeRoute('products'),
      makeRoute('health', true),
    ];

    const report = groupRoutesByPrefix(routes);
    expect(report.totalGroups).toBe(3);

    const usersGroup = report.groups.find((g) => g.prefix === 'users');
    expect(usersGroup).toBeDefined();
    expect(usersGroup!.totalRoutes).toBe(2);
    expect(usersGroup!.documentedCount).toBe(1);
    expect(usersGroup!.documentationCoverage).toBe(50);
  });

  it('returns empty report for no routes', () => {
    const report = groupRoutesByPrefix([]);
    expect(report.totalGroups).toBe(0);
    expect(report.groups).toHaveLength(0);
  });

  it('sorts groups by total routes descending', () => {
    const routes = [
      makeRoute('health'),
      makeRoute('users'),
      makeRoute('users/[id]'),
      makeRoute('users/profile'),
    ];

    const report = groupRoutesByPrefix(routes);
    expect(report.groups[0].prefix).toBe('users');
  });

  it('computes 100% coverage when all routes are documented', () => {
    const routes = [makeRoute('auth/login', true), makeRoute('auth/logout', true)];
    const report = groupRoutesByPrefix(routes);
    expect(report.groups[0].documentationCoverage).toBe(100);
    expect(report.groups[0].undocumentedCount).toBe(0);
  });
});

describe('formatGroupReport', () => {
  it('returns no-groups message when empty', () => {
    const report: RouteGroupReport = { groups: [], totalGroups: 0 };
    expect(formatGroupReport(report)).toContain('No route groups found.');
  });

  it('includes prefix and stats in output', () => {
    const routes = [makeRoute('users', true), makeRoute('users/[id]')];
    const report = groupRoutesByPrefix(routes);
    const text = formatGroupReport(report);
    expect(text).toContain('/users');
    expect(text).toContain('Routes: 2');
    expect(text).toContain('50%');
  });
});
