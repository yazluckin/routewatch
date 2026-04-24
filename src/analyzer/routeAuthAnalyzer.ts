/**
 * Analyzes API routes for authentication/authorization hints based on
 * JSDoc tags (@auth, @protected, @public) and common middleware patterns.
 */

import { RouteInfo } from '../scanner/routeScanner';

export type AuthStatus = 'protected' | 'public' | 'unknown';

export interface RouteAuthInfo {
  route: RouteInfo;
  status: AuthStatus;
  hint: string | null;
}

export interface RouteAuthReport {
  protected: RouteAuthInfo[];
  public: RouteAuthInfo[];
  unknown: RouteAuthInfo[];
}

const PROTECTED_PATTERNS = [
  /@protected/i,
  /@auth/i,
  /requireAuth/,
  /withAuth/,
  /isAuthenticated/,
  /verifyToken/,
  /authenticate/,
];

const PUBLIC_PATTERNS = [
  /@public/i,
  /@noauth/i,
  /noAuth/,
  /publicRoute/,
];

export function extractAuthStatus(source: string): { status: AuthStatus; hint: string | null } {
  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.test(source)) {
      return { status: 'protected', hint: pattern.source };
    }
  }
  for (const pattern of PUBLIC_PATTERNS) {
    if (pattern.test(source)) {
      return { status: 'public', hint: pattern.source };
    }
  }
  return { status: 'unknown', hint: null };
}

export function analyzeRouteAuth(routes: RouteInfo[]): RouteAuthReport {
  const report: RouteAuthReport = { protected: [], public: [], unknown: [] };

  for (const route of routes) {
    const source = route.rawSource ?? '';
    const { status, hint } = extractAuthStatus(source);
    const entry: RouteAuthInfo = { route, status, hint };
    report[status].push(entry);
  }

  return report;
}
