import { describe, it, expect } from 'vitest';
import {
  assessLatencyRisk,
  analyzeRouteLatencyHints,
  RouteLatencyHint,
} from './routeLatencyHintAnalyzer';
import { RouteInfo } from '../scanner/routeScanner';
import { RouteComplexityResult } from './routeComplexityAnalyzer';

function makeRoute(routePath: string, methods: string[] = ['GET']): RouteInfo {
  return { routePath, methods, filePath: `/app/api${routePath}.ts`, hasJsDoc: false };
}

function makeComplexity(routePath: string, score: number): RouteComplexityResult {
  return { routePath, score, factors: [] };
}

describe('assessLatencyRisk', () => {
  it('returns low risk for a simple route', () => {
    const result = assessLatencyRisk(makeRoute('/api/users'));
    expect(result.risk).toBe('low');
    expect(result.reasons).toHaveLength(0);
  });

  it('returns medium risk for a route with one dynamic segment and depth 3', () => {
    const result = assessLatencyRisk(makeRoute('/api/users/[id]'));
    expect(['low', 'medium']).toContain(result.risk);
  });

  it('returns high risk for deeply nested multi-dynamic route with high complexity', () => {
    const route = makeRoute('/api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    const complexity = makeComplexity(route.routePath, 9);
    const result = assessLatencyRisk(route, complexity);
    expect(result.risk).toBe('high');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('flags high complexity as a reason', () => {
    const route = makeRoute('/api/reports');
    const complexity = makeComplexity(route.routePath, 8);
    const result = assessLatencyRisk(route, complexity);
    expect(result.reasons.some((r) => r.includes('complexity'))).toBe(true);
  });

  it('flags many HTTP methods as a reason', () => {
    const route = makeRoute('/api/items', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    const result = assessLatencyRisk(route);
    expect(result.reasons.some((r) => r.includes('methods'))).toBe(true);
  });
});

describe('analyzeRouteLatencyHints', () => {
  it('returns a report with correct counts', () => {
    const routes = [
      makeRoute('/api/simple'),
      makeRoute('/api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    ];
    const complexityMap = new Map([
      [routes[1].routePath, makeComplexity(routes[1].routePath, 9)],
    ]);
    const report = analyzeRouteLatencyHints(routes, complexityMap);
    expect(report.hints).toHaveLength(2);
    expect(report.highRiskCount + report.mediumRiskCount + report.lowRiskCount).toBe(2);
    expect(report.highRiskCount).toBeGreaterThanOrEqual(1);
  });

  it('handles empty route list', () => {
    const report = analyzeRouteLatencyHints([]);
    expect(report.hints).toHaveLength(0);
    expect(report.highRiskCount).toBe(0);
  });
});
