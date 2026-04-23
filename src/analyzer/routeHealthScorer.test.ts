import { describe, it, expect } from 'vitest';
import {
  scoreRoute,
  computeHealthReport,
  RouteHealthScore,
} from './routeHealthScorer';
import { RouteInfo } from '../scanner/routeScanner';
import { UsageReport } from './usageAnalyzer';

function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    filePath: '/project/pages/api/users.ts',
    routePath: '/api/users',
    method: 'GET',
    hasJsDoc: true,
    ...overrides,
  };
}

function makeUsage(counts: Record<string, number> = {}): UsageReport {
  return { usageCounts: counts, calledRoutes: Object.keys(counts) };
}

describe('scoreRoute', () => {
  it('gives full score for documented route with usages', () => {
    const result = scoreRoute(makeRoute({ hasJsDoc: true }), 6);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('caps usage score at 60', () => {
    const result = scoreRoute(makeRoute({ hasJsDoc: true }), 100);
    expect(result.score).toBe(100);
  });

  it('penalises missing documentation', () => {
    const result = scoreRoute(makeRoute({ hasJsDoc: false }), 3);
    expect(result.documented).toBe(false);
    expect(result.issues).toContain('Missing JSDoc documentation');
    expect(result.score).toBe(30);
  });

  it('flags zero usages as a dead route issue', () => {
    const result = scoreRoute(makeRoute({ hasJsDoc: true }), 0);
    expect(result.issues).toContain('No detected usages — possible dead route');
    expect(result.score).toBe(40);
  });

  it('gives score of 0 for undocumented route with no usages', () => {
    const result = scoreRoute(makeRoute({ hasJsDoc: false }), 0);
    expect(result.score).toBe(0);
    expect(result.issues).toHaveLength(2);
  });
});

describe('computeHealthReport', () => {
  it('aggregates scores across multiple routes', () => {
    const routes = [
      makeRoute({ routePath: '/api/users', method: 'GET', hasJsDoc: true }),
      makeRoute({ routePath: '/api/posts', method: 'POST', hasJsDoc: false }),
    ];
    const usage = makeUsage({ 'GET /api/users': 4 });
    const report = computeHealthReport(routes, usage);

    expect(report.scores).toHaveLength(2);
    expect(report.averageScore).toBeGreaterThan(0);
  });

  it('returns zero averageScore for empty routes', () => {
    const report = computeHealthReport([], makeUsage());
    expect(report.averageScore).toBe(0);
    expect(report.scores).toHaveLength(0);
  });

  it('correctly categorises healthy, warning, and critical routes', () => {
    const routes = [
      makeRoute({ routePath: '/api/a', method: 'GET', hasJsDoc: true }),
      makeRoute({ routePath: '/api/b', method: 'GET', hasJsDoc: true }),
      makeRoute({ routePath: '/api/c', method: 'GET', hasJsDoc: false }),
    ];
    const usage = makeUsage({ 'GET /api/a': 6, 'GET /api/b': 0 });
    const report = computeHealthReport(routes, usage);

    expect(report.healthyCount).toBe(1);
    expect(report.warningCount).toBe(1);
    expect(report.criticalCount).toBe(1);
  });
});
