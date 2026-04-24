import { describe, it, expect } from 'vitest';
import {
  extractDeprecationInfo,
  analyzeDeprecatedRoutes,
} from './routeDeprecationAnalyzer';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    filePath: '/app/api/test/route.ts',
    routePath: '/api/test',
    methods: ['GET'],
    hasJsDoc: false,
    jsDoc: '',
    ...overrides,
  };
}

describe('extractDeprecationInfo', () => {
  it('returns null when no @deprecated tag', () => {
    expect(extractDeprecationInfo('/** Some comment */')).toBeNull();
  });

  it('detects bare @deprecated tag', () => {
    const result = extractDeprecationInfo('/** @deprecated */');
    expect(result).not.toBeNull();
  });

  it('extracts reason from @deprecated', () => {
    const result = extractDeprecationInfo(
      '/** @deprecated Use /api/v2/users instead */'
    );
    expect(result?.reason).toBe('Use /api/v2/users instead');
  });

  it('extracts @since version', () => {
    const result = extractDeprecationInfo(
      '/** @deprecated old\n * @since 1.4.0 */'
    );
    expect(result?.since).toBe('1.4.0');
  });

  it('extracts @see replacement', () => {
    const result = extractDeprecationInfo(
      '/** @deprecated\n * @see /api/v2/items */'
    );
    expect(result?.replacement).toBe('/api/v2/items');
  });
});

describe('analyzeDeprecatedRoutes', () => {
  it('returns empty deprecated list when no routes are deprecated', () => {
    const routes = [makeRoute(), makeRoute({ routePath: '/api/other' })];
    const report = analyzeDeprecatedRoutes(routes);
    expect(report.deprecatedCount).toBe(0);
    expect(report.deprecated).toHaveLength(0);
    expect(report.total).toBe(2);
  });

  it('flags routes with @deprecated in jsDoc', () => {
    const routes = [
      makeRoute({ jsDoc: '/** @deprecated Use v2 */', hasJsDoc: true }),
      makeRoute({ routePath: '/api/other' }),
    ];
    const report = analyzeDeprecatedRoutes(routes);
    expect(report.deprecatedCount).toBe(1);
    expect(report.deprecated[0].reason).toBe('Use v2');
  });

  it('captures full metadata for deprecated route', () => {
    const jsDoc =
      '/** @deprecated Legacy endpoint\n * @since 2.0.0\n * @see /api/v3/items */';
    const routes = [makeRoute({ jsDoc, hasJsDoc: true })];
    const report = analyzeDeprecatedRoutes(routes);
    const dep = report.deprecated[0];
    expect(dep.since).toBe('2.0.0');
    expect(dep.replacement).toBe('/api/v3/items');
  });
});
