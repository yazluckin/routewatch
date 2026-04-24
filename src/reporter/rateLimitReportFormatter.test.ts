import { describe, it, expect } from 'vitest';
import {
  formatRateLimitReport,
  formatRateLimitReportPlain,
} from './rateLimitReportFormatter';
import { RateLimitReport } from '../analyzer/routeRateLimitAnalyzer';
import { ScannedRoute } from '../scanner/routeScanner';

function makeRoute(routePath: string, methods: string[] = ['GET']): ScannedRoute {
  return { filePath: '/project/pages/api/x.ts', routePath, methods, jsDocComment: null };
}

function makeReport(overrides: Partial<RateLimitReport> = {}): RateLimitReport {
  return {
    entries: [],
    totalRoutes: 0,
    unprotectedPublicRoutes: 0,
    ...overrides,
  };
}

describe('formatRateLimitReportPlain', () => {
  it('shows all-clear message when no risky routes', () => {
    const report = makeReport({ totalRoutes: 2, entries: [
      { route: makeRoute('/api/a'), hasRateLimitComment: true, isPublicFacing: true, isDynamic: false, risk: 'none', suggestion: null },
    ]});
    const output = formatRateLimitReportPlain(report);
    expect(output).toContain('All routes have rate limiting configured.');
  });

  it('lists high risk routes with suggestion', () => {
    const report = makeReport({
      totalRoutes: 1,
      unprotectedPublicRoutes: 1,
      entries: [{
        route: makeRoute('/api/users/[id]'),
        hasRateLimitComment: false,
        isPublicFacing: true,
        isDynamic: true,
        risk: 'high',
        suggestion: 'Public dynamic route with no rate limit — highly vulnerable to abuse.',
      }],
    });
    const output = formatRateLimitReportPlain(report);
    expect(output).toContain('[HIGH]');
    expect(output).toContain('/api/users/[id]');
    expect(output).toContain('vulnerable to abuse');
  });

  it('includes totals in output', () => {
    const report = makeReport({ totalRoutes: 5, unprotectedPublicRoutes: 3 });
    const output = formatRateLimitReportPlain(report);
    expect(output).toContain('Total routes: 5');
    expect(output).toContain('Unprotected public routes: 3');
  });
});

describe('formatRateLimitReport (colored)', () => {
  it('returns a non-empty string', () => {
    const report = makeReport({ totalRoutes: 1, entries: [
      { route: makeRoute('/api/health'), hasRateLimitComment: false, isPublicFacing: true, isDynamic: false, risk: 'medium', suggestion: 'Add throttle.' },
    ]});
    const output = formatRateLimitReport(report);
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('/api/health');
  });
});
