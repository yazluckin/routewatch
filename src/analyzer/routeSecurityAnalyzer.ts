import { RouteInfo } from "../scanner/routeScanner";

export type SecurityRisk = "none" | "low" | "medium" | "high";

export interface RouteSecurityInfo {
  route: RouteInfo;
  hasAuth: boolean;
  hasCors: boolean;
  hasRateLimit: boolean;
  hasInputValidation: boolean;
  exposesInternalPath: boolean;
  risk: SecurityRisk;
  warnings: string[];
}

export interface SecurityAnalysisReport {
  entries: RouteSecurityInfo[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  safeCount: number;
}

export function assessSecurityRisk(
  hasAuth: boolean,
  hasCors: boolean,
  hasRateLimit: boolean,
  hasInputValidation: boolean,
  exposesInternalPath: boolean
): SecurityRisk {
  const missing = [hasAuth, hasRateLimit, hasInputValidation].filter((v) => !v).length;
  if (exposesInternalPath || missing >= 3) return "high";
  if (missing === 2) return "medium";
  if (missing === 1 || !hasCors) return "low";
  return "none";
}

export function extractSecurityInfo(route: RouteInfo): RouteSecurityInfo {
  const src = route.sourceText ?? "";
  const warnings: string[] = [];

  const hasAuth =
    /auth|session|jwt|token|bearer|getServerSession|withAuth/i.test(src);
  const hasCors =
    /cors|Access-Control|allowedOrigins/i.test(src);
  const hasRateLimit =
    /rateLimit|rate_limit|rateLimiter|throttle/i.test(src);
  const hasInputValidation =
    /zod|yup|joi|validate|schema\.parse|ajv/i.test(src);
  const exposesInternalPath =
    /\/internal\/|\/admin\/|\/debug\//i.test(route.routePath);

  if (!hasAuth) warnings.push("No authentication detected");
  if (!hasCors) warnings.push("No CORS handling detected");
  if (!hasRateLimit) warnings.push("No rate limiting detected");
  if (!hasInputValidation) warnings.push("No input validation detected");
  if (exposesInternalPath) warnings.push("Route exposes potentially sensitive internal path");

  const risk = assessSecurityRisk(hasAuth, hasCors, hasRateLimit, hasInputValidation, exposesInternalPath);

  return { route, hasAuth, hasCors, hasRateLimit, hasInputValidation, exposesInternalPath, risk, warnings };
}

export function analyzeRouteSecurity(routes: RouteInfo[]): SecurityAnalysisReport {
  const entries = routes.map(extractSecurityInfo);
  return {
    entries,
    highRiskCount: entries.filter((e) => e.risk === "high").length,
    mediumRiskCount: entries.filter((e) => e.risk === "medium").length,
    lowRiskCount: entries.filter((e) => e.risk === "low").length,
    safeCount: entries.filter((e) => e.risk === "none").length,
  };
}
