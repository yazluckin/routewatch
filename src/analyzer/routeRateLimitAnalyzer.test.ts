import { describe, it, expect } from 'vitest';
import {
  extractRateLimitInfo,
  analyzeRouteRateLimits,
} from './routeRateLimitAnalyzer';
import { ScannedRoute } from '../scanner/routeScanner';

function makeRoute(overrides: Partial<ScannedRoute> = {}): ScannedRoute {
  return {
    filePath: '/project/pages/api/test.ts',
    routePath: '/api/test',
    methods: ['GET'],
    jsDocComment: null,
    ...overrides,
  };
}

describe('extractRateLimitInfo', () => {
  it('marks route as low risk when authenticated and no rate limit comment', () => {
    const route = makeRoute({ jsDocComment: '@auth required' });
    const info = extractRateLimitInfo(route);
    expect(info.risk).toBe('low');
    expect(info.isPublicFacing).toBe(false);
    expect(info.hasRateLimitComment).toBe(false);
  });

  it('marks public static route as medium risk', () => {
    const route = makeRoute({ jsDocComment: 'Returns user list' });
    const info = extractRateLimitInfo(route);
    expect(info.risk).toBe('medium');
    expect(info.isPublicFacing).toBe(true);
  });

  it('marks public dynamic route as high risk', () => {
    const route = makeRoute({
      routePath: '/api/users/[id]',
      jsDocComment: 'Fetch user by id',
    });
    const info = extractRateLimitInfo(route);
    expect(info.risk).toBe('high');
    expect(info.isDynamic).toBe(true);
  });

  it('detects rate limit comment and sets risk to none', () => {
    const route = makeRoute({ jsDocComment: '@rateLimit 100req/min' });
    const info = extractRateLimitInfo(route);
    expect(info.risk).toBe('none');
    expect(info.hasRateLimitComment).toBe(true);
    expect(info.suggestion).toBeNull();
  });

  it('detects throttle keyword as rate limit indicator', () => {
    const route = makeRoute({ jsDocComment: 'throttle enabled' });
    const info = extractRateLimitInfo(route);
    expect(info.hasRateLimitComment).toBe(true);
  });
});

describe('analyzeRouteRateLimits', () => {
  it('returns correct counts', () => {
    const routes = [
      makeRoute({ jsDocComment: null }),
      makeRoute({ jsDocComment: '@auth protected' }),
      makeRoute({ jsDocComment: '@rateLimit 50/min' }),
    ];
    const report = analyzeRouteRateLimits(routes);
    expect(report.totalRoutes).toBe(3);
    expect(report.unprotectedPublicRoutes).toBe(1);
  });

  it('returns empty report for no routes', () => {
    const report = analyzeRouteRateLimits([]);
    expect(report.totalRoutes).toBe(0);
    expect(report.unprotectedPublicRoutes).toBe(0);
    expect(report.entries).toHaveLength(0);
  });
});
