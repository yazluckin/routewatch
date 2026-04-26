import { describe, it, expect } from 'vitest';
import { extractMiddlewareInfo, analyzeRouteMiddleware } from './routeMiddlewareAnalyzer';
import type { ScannedRoute } from '../scanner/routeScanner';

function makeRoute(overrides: Partial<ScannedRoute> = {}): ScannedRoute {
  return {
    filePath: '/project/src/pages/api/users.ts',
    routePath: '/api/users',
    methods: ['GET'],
    hasJsDoc: false,
    jsDocComment: '',
    ...overrides,
  };
}

describe('extractMiddlewareInfo', () => {
  it('returns no middleware for empty jsDoc', () => {
    const route = makeRoute({ jsDocComment: '' });
    const info = extractMiddlewareInfo(route);
    expect(info.middlewares).toEqual([]);
    expect(info.hasAuth).toBe(false);
    expect(info.hasRateLimit).toBe(false);
    expect(info.hasLogging).toBe(false);
    expect(info.hasCors).toBe(false);
  });

  it('detects @middleware tags', () => {
    const route = makeRoute({
      jsDocComment: '/** @middleware auth\n * @middleware rateLimit\n */',
    });
    const info = extractMiddlewareInfo(route);
    expect(info.middlewares).toContain('auth');
    expect(info.middlewares).toContain('rateLimit');
  });

  it('sets hasAuth when auth middleware present', () => {
    const route = makeRoute({
      jsDocComment: '/** @middleware auth */',
    });
    const info = extractMiddlewareInfo(route);
    expect(info.hasAuth).toBe(true);
  });

  it('sets hasRateLimit when rateLimit middleware present', () => {
    const route = makeRoute({
      jsDocComment: '/** @middleware rateLimit */',
    });
    const info = extractMiddlewareInfo(route);
    expect(info.hasRateLimit).toBe(true);
  });

  it('sets hasLogging when logging middleware present', () => {
    const route = makeRoute({
      jsDocComment: '/** @middleware logging */',
    });
    const info = extractMiddlewareInfo(route);
    expect(info.hasLogging).toBe(true);
  });

  it('sets hasCors when cors middleware present', () => {
    const route = makeRoute({
      jsDocComment: '/** @middleware cors */',
    });
    const info = extractMiddlewareInfo(route);
    expect(info.hasCors).toBe(true);
  });
});

describe('analyzeRouteMiddleware', () => {
  it('returns an entry per route', () => {
    const routes = [
      makeRoute({ routePath: '/api/users' }),
      makeRoute({ routePath: '/api/posts' }),
    ];
    const result = analyzeRouteMiddleware(routes);
    expect(result).toHaveLength(2);
  });

  it('flags routes with no middleware', () => {
    const routes = [makeRoute({ jsDocComment: '' })];
    const result = analyzeRouteMiddleware(routes);
    expect(result[0].middlewareInfo.middlewares).toHaveLength(0);
  });

  it('captures middleware for all routes', () => {
    const routes = [
      makeRoute({ jsDocComment: '/** @middleware auth @middleware cors */' }),
      makeRoute({ routePath: '/api/public', jsDocComment: '' }),
    ];
    const result = analyzeRouteMiddleware(routes);
    expect(result[0].middlewareInfo.hasAuth).toBe(true);
    expect(result[0].middlewareInfo.hasCors).toBe(true);
    expect(result[1].middlewareInfo.hasAuth).toBe(false);
  });
});
