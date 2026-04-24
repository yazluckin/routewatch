import { describe, it, expect } from 'vitest';
import {
  computeComplexity,
  analyzeRouteComplexity,
} from './routeComplexityAnalyzer';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(routePath: string, methods: string[] = ['GET']): RouteInfo {
  return { filePath: `/app/api${routePath}/route.ts`, routePath, methods, hasDoc: false };
}

describe('computeComplexity', () => {
  it('scores a simple static route low', () => {
    const result = computeComplexity(makeRoute('/users'));
    expect(result.label).toBe('simple');
    expect(result.score).toBeLessThanOrEqual(4);
  });

  it('scores a deeply nested dynamic route higher', () => {
    const result = computeComplexity(makeRoute('/orgs/[orgId]/teams/[teamId]/members'));
    expect(result.score).toBeGreaterThan(4);
    expect(result.factors.paramCount).toBe(2);
    expect(result.factors.nestingDepth).toBe(5);
  });

  it('marks catch-all routes as complex', () => {
    const result = computeComplexity(makeRoute('/docs/[...slug]'));
    expect(result.factors.isCatchAll).toBe(true);
    expect(result.label).toBe('complex');
  });

  it('accounts for multiple HTTP methods', () => {
    const single = computeComplexity(makeRoute('/items', ['GET']));
    const multi = computeComplexity(makeRoute('/items', ['GET', 'POST', 'DELETE']));
    expect(multi.score).toBeGreaterThan(single.score);
  });

  it('labels moderate scores correctly', () => {
    const result = computeComplexity(makeRoute('/users/[id]/posts', ['GET', 'POST']));
    expect(['moderate', 'complex']).toContain(result.label);
  });
});

describe('analyzeRouteComplexity', () => {
  it('returns empty report for no routes', () => {
    const report = analyzeRouteComplexity([]);
    expect(report.results).toHaveLength(0);
    expect(report.averageScore).toBe(0);
    expect(report.mostComplex).toBeNull();
  });

  it('identifies the most complex route', () => {
    const routes = [
      makeRoute('/users'),
      makeRoute('/orgs/[orgId]/teams/[teamId]/members/[...rest]', ['GET', 'POST', 'DELETE']),
      makeRoute('/posts/[id]'),
    ];
    const report = analyzeRouteComplexity(routes);
    expect(report.mostComplex?.route.routePath).toBe(
      '/orgs/[orgId]/teams/[teamId]/members/[...rest]'
    );
  });

  it('computes a reasonable average score', () => {
    const routes = [makeRoute('/a'), makeRoute('/b/[id]'), makeRoute('/c/[x]/[y]')];
    const report = analyzeRouteComplexity(routes);
    expect(report.averageScore).toBeGreaterThan(0);
  });
});
