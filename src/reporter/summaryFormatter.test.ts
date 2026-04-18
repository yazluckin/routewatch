import { computeStats, formatSummary } from './summaryFormatter';
import { RouteReport } from '../index';

function makeReport(overrides: Partial<RouteReport> = {}): RouteReport {
  return {
    routes: [],
    deadRoutes: [],
    undocumentedRoutes: [],
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('computeStats', () => {
  it('returns 100% coverage for empty report', () => {
    const stats = computeStats(makeReport());
    expect(stats.coveragePercent).toBe(100);
    expect(stats.documentationPercent).toBe(100);
  });

  it('computes correct stats', () => {
    const report = makeReport({
      routes: [
        { path: '/api/a', methods: ['GET'], documented: true, filePath: 'a.ts' },
        { path: '/api/b', methods: ['POST'], documented: false, filePath: 'b.ts' },
        { path: '/api/c', methods: ['GET'], documented: true, filePath: 'c.ts' },
      ],
      deadRoutes: [{ path: '/api/c', methods: ['GET'], documented: true, filePath: 'c.ts' }],
      undocumentedRoutes: [{ path: '/api/b', methods: ['POST'], documented: false, filePath: 'b.ts' }],
    });
    const stats = computeStats(report);
    expect(stats.totalRoutes).toBe(3);
    expect(stats.deadRoutes).toBe(1);
    expect(stats.undocumentedRoutes).toBe(1);
    expect(stats.usedRoutes).toBe(2);
    expect(stats.documentedRoutes).toBe(2);
    expect(stats.coveragePercent).toBe(67);
    expect(stats.documentationPercent).toBe(67);
  });
});

describe('formatSummary', () => {
  it('returns a string containing key labels', () => {
    const result = formatSummary(makeReport());
    expect(result).toContain('RouteWatch Summary');
    expect(result).toContain('Total Routes');
    expect(result).toContain('Usage Coverage');
    expect(result).toContain('Doc Coverage');
  });

  it('includes computed numbers', () => {
    const report = makeReport({
      routes: [{ path: '/api/x', methods: ['GET'], documented: false, filePath: 'x.ts' }],
      deadRoutes: [{ path: '/api/x', methods: ['GET'], documented: false, filePath: 'x.ts' }],
      undocumentedRoutes: [{ path: '/api/x', methods: ['GET'], documented: false, filePath: 'x.ts' }],
    });
    const result = formatSummary(report);
    expect(result).toContain('0%');
  });
});
