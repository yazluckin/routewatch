import { describe, it, expect } from 'vitest';
import {
  extractAuthStatus,
  analyzeRouteAuth,
  RouteAuthReport,
} from './routeAuthAnalyzer';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(overrides: Partial<RouteInfo> & { rawSource?: string }): RouteInfo {
  return {
    filePath: '/app/api/test/route.ts',
    routePath: '/api/test',
    methods: ['GET'],
    hasJsDoc: false,
    ...overrides,
  } as RouteInfo;
}

describe('extractAuthStatus', () => {
  it('detects @protected tag', () => {
    const { status } = extractAuthStatus('/** @protected */');
    expect(status).toBe('protected');
  });

  it('detects @auth tag', () => {
    const { status } = extractAuthStatus('/** @auth required */');
    expect(status).toBe('protected');
  });

  it('detects requireAuth middleware', () => {
    const { status } = extractAuthStatus('export default requireAuth(handler);');
    expect(status).toBe('protected');
  });

  it('detects @public tag', () => {
    const { status } = extractAuthStatus('/** @public */');
    expect(status).toBe('public');
  });

  it('detects noAuth pattern', () => {
    const { status } = extractAuthStatus('// noAuth route');
    expect(status).toBe('public');
  });

  it('returns unknown when no pattern matches', () => {
    const { status, hint } = extractAuthStatus('export default handler;');
    expect(status).toBe('unknown');
    expect(hint).toBeNull();
  });
});

describe('analyzeRouteAuth', () => {
  it('groups routes by auth status', () => {
    const routes = [
      makeRoute({ routePath: '/api/users', rawSource: '/** @protected */' }),
      makeRoute({ routePath: '/api/health', rawSource: '/** @public */' }),
      makeRoute({ routePath: '/api/data', rawSource: 'export default handler;' }),
    ];

    const report: RouteAuthReport = analyzeRouteAuth(routes);

    expect(report.protected).toHaveLength(1);
    expect(report.protected[0].route.routePath).toBe('/api/users');
    expect(report.public).toHaveLength(1);
    expect(report.public[0].route.routePath).toBe('/api/health');
    expect(report.unknown).toHaveLength(1);
    expect(report.unknown[0].route.routePath).toBe('/api/data');
  });

  it('returns empty groups for empty input', () => {
    const report = analyzeRouteAuth([]);
    expect(report.protected).toHaveLength(0);
    expect(report.public).toHaveLength(0);
    expect(report.unknown).toHaveLength(0);
  });
});
