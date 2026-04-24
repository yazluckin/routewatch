import { ScannedRoute } from '../scanner/routeScanner';

export type RateLimitRisk = 'none' | 'low' | 'medium' | 'high';

export interface RateLimitInfo {
  route: ScannedRoute;
  hasRateLimitComment: boolean;
  isPublicFacing: boolean;
  isDynamic: boolean;
  risk: RateLimitRisk;
  suggestion: string | null;
}

export interface RateLimitReport {
  entries: RateLimitInfo[];
  totalRoutes: number;
  unprotectedPublicRoutes: number;
}

const RATE_LIMIT_PATTERNS = [
  /rate.?limit/i,
  /@rateLimit/i,
  /throttle/i,
  /rateLimit/,
];

const AUTH_PATTERNS = [
  /@auth/i,
  /requiresAuth/i,
  /authenticated/i,
  /protected/i,
];

export function extractRateLimitInfo(route: ScannedRoute): RateLimitInfo {
  const comment = route.jsDocComment ?? '';
  const hasRateLimitComment = RATE_LIMIT_PATTERNS.some((p) => p.test(comment));
  const isAuthenticated = AUTH_PATTERNS.some((p) => p.test(comment));
  const isPublicFacing = !isAuthenticated;
  const isDynamic = route.routePath.includes('[');

  let risk: RateLimitRisk = 'none';
  let suggestion: string | null = null;

  if (!hasRateLimitComment) {
    if (isPublicFacing && isDynamic) {
      risk = 'high';
      suggestion = 'Public dynamic route with no rate limit — highly vulnerable to abuse.';
    } else if (isPublicFacing) {
      risk = 'medium';
      suggestion = 'Public route without rate limiting. Consider adding throttle middleware.';
    } else {
      risk = 'low';
      suggestion = 'Authenticated route — rate limiting is recommended but lower priority.';
    }
  }

  return { route, hasRateLimitComment, isPublicFacing, isDynamic, risk, suggestion };
}

export function analyzeRouteRateLimits(routes: ScannedRoute[]): RateLimitReport {
  const entries = routes.map(extractRateLimitInfo);
  const unprotectedPublicRoutes = entries.filter(
    (e) => e.isPublicFacing && !e.hasRateLimitComment
  ).length;

  return {
    entries,
    totalRoutes: routes.length,
    unprotectedPublicRoutes,
  };
}
