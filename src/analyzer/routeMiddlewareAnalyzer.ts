import { ScannedRoute } from "../scanner";

export type MiddlewareRisk = "none" | "low" | "medium" | "high";

export interface MiddlewareInfo {
  route: ScannedRoute;
  detectedMiddleware: string[];
  missingAuth: boolean;
  missingRateLimit: boolean;
  missingCors: boolean;
  risk: MiddlewareRisk;
}

const MIDDLEWARE_PATTERNS: Record<string, RegExp> = {
  auth: /withAuth|requireAuth|isAuthenticated|verifyToken|authMiddleware/i,
  rateLimit: /rateLimit|rateLimiter|withRateLimit|throttle/i,
  cors: /cors|withCors|allowOrigin/i,
  logging: /logger|withLogging|requestLogger/i,
  validation: /validate|withValidation|bodyParser/i,
};

export function extractMiddlewareInfo(route: ScannedRoute): MiddlewareInfo {
  const source = route.sourceText ?? "";
  const detectedMiddleware: string[] = [];

  for (const [name, pattern] of Object.entries(MIDDLEWARE_PATTERNS)) {
    if (pattern.test(source)) {
      detectedMiddleware.push(name);
    }
  }

  const missingAuth = !detectedMiddleware.includes("auth");
  const missingRateLimit = !detectedMiddleware.includes("rateLimit");
  const missingCors = !detectedMiddleware.includes("cors");

  const riskScore = [missingAuth, missingRateLimit, missingCors].filter(Boolean).length;
  const risk: MiddlewareRisk =
    riskScore === 0 ? "none" : riskScore === 1 ? "low" : riskScore === 2 ? "medium" : "high";

  return { route, detectedMiddleware, missingAuth, missingRateLimit, missingCors, risk };
}

export function analyzeRouteMiddleware(routes: ScannedRoute[]): MiddlewareInfo[] {
  return routes.map(extractMiddlewareInfo);
}
