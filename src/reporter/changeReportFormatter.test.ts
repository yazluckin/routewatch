import { describe, it, expect } from 'vitest';
import { formatChangeReport, formatChangeReportPlain } from './changeReportFormatter';
import { RouteChangeReport } from '../analyzer/routeChangeDetector';
import { RouteInfo } from '../scanner/routeScanner';

function makeRoute(routePath: string, methods: string[] = ['GET'], hasJsDoc = false): RouteInfo {
  return { filePath: `/app/pages/api${routePath}.ts`, routePath, methods, hasJsDoc };
}

function makeReport(overrides: Partial<RouteChangeReport> = {}): RouteChangeReport {
  return {
    changes: [],
    addedCount: 0,
    removedCount: 0,
    modifiedCount: 0,
    snapshotTimestamp: 1700000000000,
    currentTimestamp: 1700000060000,
    ...overrides,
  };
}

describe('formatChangeReportPlain', () => {
  it('shows no changes message when empty', () => {
    const output = formatChangeReportPlain(makeReport());
    expect(output).toContain('No changes detected.');
    expect(output).toContain('Route Changes');
  });

  it('shows added routes with + prefix', () => {
    const report = makeReport({
      changes: [{ type: 'added', route: makeRoute('/users') }],
      addedCount: 1,
    });
    const output = formatChangeReportPlain(report);
    expect(output).toContain('+ /users');
    expect(output).toContain('1 added');
  });

  it('shows removed routes with - prefix', () => {
    const report = makeReport({
      changes: [{ type: 'removed', route: makeRoute('/posts') }],
      removedCount: 1,
    });
    const output = formatChangeReportPlain(report);
    expect(output).toContain('- /posts');
    expect(output).toContain('1 removed');
  });

  it('shows method diff for modified routes', () => {
    const report = makeReport({
      changes: [{
        type: 'modified',
        route: makeRoute('/api', ['GET', 'POST']),
        previousRoute: makeRoute('/api', ['GET']),
      }],
      modifiedCount: 1,
    });
    const output = formatChangeReportPlain(report);
    expect(output).toContain('~ /api');
    expect(output).toContain('GET → GET, POST');
  });

  it('notes doc changes for modified routes', () => {
    const report = makeReport({
      changes: [{
        type: 'modified',
        route: makeRoute('/api', ['GET'], true),
        previousRoute: makeRoute('/api', ['GET'], false),
      }],
      modifiedCount: 1,
    });
    const output = formatChangeReportPlain(report);
    expect(output).toContain('added docs');
  });
});

describe('formatChangeReport (colored)', () => {
  it('includes ANSI escape codes when useColor is true', () => {
    const report = makeReport({
      changes: [{ type: 'added', route: makeRoute('/test') }],
      addedCount: 1,
    });
    const output = formatChangeReport(report, true);
    expect(output).toContain('\x1b[');
  });
});
