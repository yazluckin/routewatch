import { generateReport, formatReportText } from './reportGenerator';
import { ScanResult } from '../scanner/routeScanner';
import { UsageResult } from '../analyzer/usageAnalyzer';

const mockScanResults: ScanResult[] = [
  { routePath: '/api/users', filePath: '/project/pages/api/users.ts', methods: ['GET', 'POST'], hasJsDoc: true },
  { routePath: '/api/posts', filePath: '/project/pages/api/posts.ts', methods: ['GET'], hasJsDoc: false },
  { routePath: '/api/auth/login', filePath: '/project/pages/api/auth/login.ts', methods: ['POST'], hasJsDoc: false },
];

const mockUsageResult: UsageResult = {
  usageCounts: {
    '/api/users': 3,
    '/api/posts': 0,
    '/api/auth/login': 1,
  },
  calledRoutes: ['/api/users', '/api/auth/login'],
};

describe('generateReport', () => {
  it('returns correct total route count', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    expect(report.totalRoutes).toBe(3);
  });

  it('identifies unused routes correctly', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    expect(report.unusedRoutes).toHaveLength(1);
    expect(report.unusedRoutes[0].route).toBe('/api/posts');
  });

  it('identifies undocumented routes correctly', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    expect(report.undocumentedRoutes).toHaveLength(2);
    const routes = report.undocumentedRoutes.map((r) => r.route);
    expect(routes).toContain('/api/posts');
    expect(routes).toContain('/api/auth/login');
  });

  it('sets documented flag based on hasJsDoc', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    const usersRoute = report.allRoutes.find((r) => r.route === '/api/users');
    expect(usersRoute?.documented).toBe(true);
  });

  it('includes generatedAt timestamp', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    expect(report.generatedAt).toBeTruthy();
    expect(new Date(report.generatedAt).toString()).not.toBe('Invalid Date');
  });
});

describe('formatReportText', () => {
  it('includes total route count', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    const text = formatReportText(report);
    expect(text).toContain('Total routes scanned: 3');
  });

  it('lists unused routes', () => {
    const report = generateReport(mockScanResults, mockUsageResult);
    const text = formatReportText(report);
    expect(text).toContain('/api/posts');
    expect(text).toContain('Unused routes');
  });

  it('shows all-clear message when no unused routes', () => {
    const allUsed: UsageResult = {
      usageCounts: { '/api/users': 1, '/api/posts': 2, '/api/auth/login': 1 },
      calledRoutes: ['/api/users', '/api/posts', '/api/auth/login'],
    };
    const report = generateReport(mockScanResults, allUsed);
    const text = formatReportText(report);
    expect(text).toContain('No unused routes detected');
  });
});
