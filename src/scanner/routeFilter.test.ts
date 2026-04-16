import { describe, it, expect } from 'vitest';
import { matchesPattern, filterRoutes } from './routeFilter';

describe('matchesPattern', () => {
  it('matches exact route', () => {
    expect(matchesPattern('/api/users', '/api/users')).toBe(true);
  });

  it('does not match different route', () => {
    expect(matchesPattern('/api/users', '/api/posts')).toBe(false);
  });

  it('matches wildcard pattern', () => {
    expect(matchesPattern('/api/users/123', '/api/users/*')).toBe(true);
  });

  it('does not over-match with wildcard', () => {
    expect(matchesPattern('/api/users/123/settings', '/api/users/*')).toBe(false);
  });

  it('matches prefix wildcard', () => {
    expect(matchesPattern('/api/admin/stats', '/api/admin/*')).toBe(true);
  });
});

describe('filterRoutes', () => {
  const routes = ['/api/users', '/api/posts', '/api/admin/stats', '/api/admin/users'];

  it('returns all routes when no options given', () => {
    expect(filterRoutes(routes, {})).toEqual(routes);
  });

  it('filters by include pattern', () => {
    const result = filterRoutes(routes, { include: ['/api/admin/*'] });
    expect(result).toEqual(['/api/admin/stats', '/api/admin/users']);
  });

  it('filters by exclude pattern', () => {
    const result = filterRoutes(routes, { exclude: ['/api/admin/*'] });
    expect(result).toEqual(['/api/users', '/api/posts']);
  });

  it('applies include then exclude', () => {
    const result = filterRoutes(routes, {
      include: ['/api/admin/*'],
      exclude: ['/api/admin/users'],
    });
    expect(result).toEqual(['/api/admin/stats']);
  });

  it('returns empty when include matches nothing', () => {
    const result = filterRoutes(routes, { include: ['/api/unknown/*'] });
    expect(result).toEqual([]);
  });
});
