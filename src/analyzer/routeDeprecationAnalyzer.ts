/**
 * Analyzes routes for deprecation markers in JSDoc comments.
 */

import { RouteInfo } from '../scanner/routeScanner';

export interface DeprecatedRoute {
  route: RouteInfo;
  reason?: string;
  since?: string;
  replacement?: string;
}

export interface DeprecationReport {
  deprecated: DeprecatedRoute[];
  total: number;
  deprecatedCount: number;
}

/**
 * Extracts deprecation metadata from a JSDoc comment string.
 */
export function extractDeprecationInfo(
  jsDoc: string
): { reason?: string; since?: string; replacement?: string } | null {
  if (!/@deprecated/i.test(jsDoc)) return null;

  const reasonMatch = jsDoc.match(/@deprecated\s+([^@\n]+)/);
  const sinceMatch = jsDoc.match(/@since\s+([^\s@]+)/);
  const replacementMatch = jsDoc.match(/@see\s+([^\s@]+)/);

  return {
    reason: reasonMatch?.[1]?.trim(),
    since: sinceMatch?.[1]?.trim(),
    replacement: replacementMatch?.[1]?.trim(),
  };
}

/**
 * Analyzes a list of routes and returns those marked as deprecated.
 */
export function analyzeDeprecatedRoutes(
  routes: RouteInfo[]
): DeprecationReport {
  const deprecated: DeprecatedRoute[] = [];

  for (const route of routes) {
    const jsDoc = route.jsDoc ?? '';
    const info = extractDeprecationInfo(jsDoc);
    if (info !== null) {
      deprecated.push({
        route,
        reason: info.reason,
        since: info.since,
        replacement: info.replacement,
      });
    }
  }

  return {
    deprecated,
    total: routes.length,
    deprecatedCount: deprecated.length,
  };
}
