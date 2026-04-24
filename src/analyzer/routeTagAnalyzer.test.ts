import { analyzeRouteTags, extractTagInfo } from './routeTagAnalyzer';
import { ScannedRoute } from '../scanner';

function makeRoute(overrides: Partial<ScannedRoute> = {}): ScannedRoute {
  return {
    routePath: '/api/users',
    method: 'GET',
    filePath: 'pages/api/users.ts',
    hasJsDoc: false,
    jsDocComment: '',
    ...overrides,
  };
}

describe('extractTagInfo', () => {
  it('returns empty tags for route with no JSDoc', () => {
    const route = makeRoute();
    const info = extractTagInfo(route);
    expect(info.tags).toEqual([]);
    expect(info.deprecated).toBe(false);
    expect(info.version).toBeNull();
    expect(info.description).toBeNull();
  });

  it('extracts @tag annotations', () => {
    const route = makeRoute({
      jsDocComment: '/** @tag users @tag admin */',
      hasJsDoc: true,
    });
    const info = extractTagInfo(route);
    expect(info.tags).toContain('users');
    expect(info.tags).toContain('admin');
  });

  it('detects @deprecated flag', () => {
    const route = makeRoute({
      jsDocComment: '/** @deprecated Use /api/v2/users instead */',
      hasJsDoc: true,
    });
    const info = extractTagInfo(route);
    expect(info.deprecated).toBe(true);
  });

  it('extracts @version annotation', () => {
    const route = makeRoute({
      jsDocComment: '/** @version 1.2.3 */',
      hasJsDoc: true,
    });
    const info = extractTagInfo(route);
    expect(info.version).toBe('1.2.3');
  });

  it('extracts @description annotation', () => {
    const route = makeRoute({
      jsDocComment: '/** @description Returns a list of users */',
      hasJsDoc: true,
    });
    const info = extractTagInfo(route);
    expect(info.description).toBe('Returns a list of users');
  });
});

describe('analyzeRouteTags', () => {
  it('builds a tag index grouping routes by tag', () => {
    const routes = [
      makeRoute({ routePath: '/api/users', jsDocComment: '/** @tag users */', hasJsDoc: true }),
      makeRoute({ routePath: '/api/posts', jsDocComment: '/** @tag posts */', hasJsDoc: true }),
      makeRoute({ routePath: '/api/admin', jsDocComment: '/** @tag users @tag admin */', hasJsDoc: true }),
    ];
    const report = analyzeRouteTags(routes);
    expect(report.tagIndex['users']).toHaveLength(2);
    expect(report.tagIndex['posts']).toHaveLength(1);
    expect(report.tagIndex['admin']).toHaveLength(1);
  });

  it('collects deprecated routes separately', () => {
    const routes = [
      makeRoute({ routePath: '/api/old', jsDocComment: '/** @deprecated */', hasJsDoc: true }),
      makeRoute({ routePath: '/api/new' }),
    ];
    const report = analyzeRouteTags(routes);
    expect(report.deprecatedRoutes).toHaveLength(1);
    expect(report.deprecatedRoutes[0].route).toBe('/api/old');
  });

  it('returns all routes in the routes array', () => {
    const routes = [makeRoute(), makeRoute({ routePath: '/api/other' })];
    const report = analyzeRouteTags(routes);
    expect(report.routes).toHaveLength(2);
  });
});
