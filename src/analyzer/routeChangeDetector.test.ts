import { describe, it, expect } from 'vitest';
import {
  createSnapshot,
  diffRoutes,
  RouteSnapshot,
} from './routeChangeDetector';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(routePath: string, methods: string[] = ['GET'], hasJsDoc = false): RouteInfo {
  return { filePath: `/app/pages/api${routePath}.ts`, routePath, methods, hasJsDoc };
}

describe('createSnapshot', () => {
  it('captures routes with a timestamp', () => {
    const routes = [makeRoute('/users')];
    const snapshot = createSnapshot(routes);
    expect(snapshot.routes).toEqual(routes);
    expect(snapshot.timestamp).toBeGreaterThan(0);
  });
});

describe('diffRoutes', () => {
  it('detects added routes', () => {
    const snapshot = createSnapshot([makeRoute('/users')]);
    const current = [makeRoute('/users'), makeRoute('/posts')];
    const report = diffRoutes(snapshot, current);
    expect(report.addedCount).toBe(1);
    expect(report.changes[0].type).toBe('added');
    expect(report.changes[0].route.routePath).toBe('/posts');
  });

  it('detects removed routes', () => {
    const snapshot = createSnapshot([makeRoute('/users'), makeRoute('/posts')]);
    const current = [makeRoute('/users')];
    const report = diffRoutes(snapshot, current);
    expect(report.removedCount).toBe(1);
    expect(report.changes[0].type).toBe('removed');
  });

  it('detects modified routes when methods change', () => {
    const snapshot = createSnapshot([makeRoute('/users', ['GET'])]);
    const current = [makeRoute('/users', ['GET', 'POST'])];
    const report = diffRoutes(snapshot, current);
    expect(report.modifiedCount).toBe(1);
    expect(report.changes[0].type).toBe('modified');
    expect(report.changes[0].previousRoute?.methods).toEqual(['GET']);
  });

  it('detects modified routes when jsDoc status changes', () => {
    const snapshot = createSnapshot([makeRoute('/users', ['GET'], false)]);
    const current = [makeRoute('/users', ['GET'], true)];
    const report = diffRoutes(snapshot, current);
    expect(report.modifiedCount).toBe(1);
  });

  it('returns empty changes when routes are identical', () => {
    const routes = [makeRoute('/users'), makeRoute('/posts')];
    const snapshot = createSnapshot(routes);
    const report = diffRoutes(snapshot, [...routes]);
    expect(report.changes).toHaveLength(0);
    expect(report.addedCount).toBe(0);
    expect(report.removedCount).toBe(0);
    expect(report.modifiedCount).toBe(0);
  });
});
