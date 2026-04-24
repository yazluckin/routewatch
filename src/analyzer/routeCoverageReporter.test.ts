import { computeRouteCoverage, formatCoverageReport } from './routeCoverageReporter';
import { ScannedRoute } from '../scanner';

function makeRoute(path: string): ScannedRoute {
  return { routePath: path, filePath: `/app/api${path}.ts`, methods: ['GET'], hasDoc: true };
}

const baseUsage = { calledPaths: new Set<string>(), details: [] };

const baseUndocumented = { undocumentedRoutes: [], totalScanned: 0 };

describe('computeRouteCoverage', () => {
  it('returns 100% coverage when all routes are used and documented', () => {
    const routes = [makeRoute('/users'), makeRoute('/posts')];
    const dead = { deadRoutes: [], totalScanned: 2 };
    const result = computeRouteCoverage(routes, baseUsage, dead, baseUndocumented);
    expect(result.totalRoutes).toBe(2);
    expect(result.usedRoutes).toBe(2);
    expect(result.unusedRoutes).toBe(0);
    expect(result.coveragePercent).toBe(100);
    expect(result.documentationPercent).toBe(100);
  });

  it('calculates partial coverage correctly', () => {
    const routes = [makeRoute('/a'), makeRoute('/b'), makeRoute('/c'), makeRoute('/d')];
    const dead = { deadRoutes: [makeRoute('/c'), makeRoute('/d')], totalScanned: 4 };
    const undocumented = { undocumentedRoutes: [makeRoute('/b')], totalScanned: 4 };
    const result = computeRouteCoverage(routes, baseUsage, dead, undocumented);
    expect(result.usedRoutes).toBe(2);
    expect(result.unusedRoutes).toBe(2);
    expect(result.coveragePercent).toBe(50);
    expect(result.documentedRoutes).toBe(3);
    expect(result.documentationPercent).toBe(75);
  });

  it('handles zero routes gracefully', () => {
    const result = computeRouteCoverage([], baseUsage, { deadRoutes: [], totalScanned: 0 }, baseUndocumented);
    expect(result.totalRoutes).toBe(0);
    expect(result.coveragePercent).toBe(100);
    expect(result.documentationPercent).toBe(100);
  });
});

describe('formatCoverageReport', () => {
  it('formats the report as a readable string', () => {
    const report = {
      totalRoutes: 5,
      usedRoutes: 4,
      unusedRoutes: 1,
      documentedRoutes: 3,
      undocumentedRoutes: 2,
      coveragePercent: 80,
      documentationPercent: 60,
    };
    const output = formatCoverageReport(report);
    expect(output).toContain('Total Routes       : 5');
    expect(output).toContain('Used Routes        : 4 (80%)');
    expect(output).toContain('Unused Routes      : 1');
    expect(output).toContain('Documented Routes  : 3 (60%)');
    expect(output).toContain('Undocumented Routes: 2');
  });
});
