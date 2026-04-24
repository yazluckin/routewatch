import { ScannedRoute } from "../scanner";

export type ResponseCodeRisk = "none" | "low" | "medium" | "high";

export interface RouteResponseInfo {
  route: ScannedRoute;
  declaredCodes: number[];
  missingSuccessCode: boolean;
  missingErrorCode: boolean;
  risk: ResponseCodeRisk;
}

export interface RouteResponseReport {
  entries: RouteResponseInfo[];
  totalRoutes: number;
  routesWithFullCoverage: number;
  routesWithNoDocumentation: number;
}

const SUCCESS_CODES = [200, 201, 202, 204];
const ERROR_CODES = [400, 401, 403, 404, 422, 500];

const RESPONSE_CODE_RE = /@response\s+(\d{3})/g;

export function extractResponseCodes(jsDoc: string): number[] {
  const codes: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = RESPONSE_CODE_RE.exec(jsDoc)) !== null) {
    codes.push(parseInt(match[1], 10));
  }
  return codes;
}

export function assessResponseRisk(
  missingSuccess: boolean,
  missingError: boolean
): ResponseCodeRisk {
  if (missingSuccess && missingError) return "high";
  if (missingSuccess) return "medium";
  if (missingError) return "low";
  return "none";
}

export function analyzeRouteResponses(
  routes: ScannedRoute[]
): RouteResponseReport {
  const entries: RouteResponseInfo[] = routes.map((route) => {
    const jsDoc = route.jsDocComment ?? "";
    const declaredCodes = extractResponseCodes(jsDoc);
    const missingSuccessCode =
      declaredCodes.length === 0 ||
      !declaredCodes.some((c) => SUCCESS_CODES.includes(c));
    const missingErrorCode = !declaredCodes.some((c) =>
      ERROR_CODES.includes(c)
    );
    const risk = assessResponseRisk(missingSuccessCode, missingErrorCode);
    return { route, declaredCodes, missingSuccessCode, missingErrorCode, risk };
  });

  const routesWithFullCoverage = entries.filter(
    (e) => e.risk === "none"
  ).length;
  const routesWithNoDocumentation = entries.filter(
    (e) => e.declaredCodes.length === 0
  ).length;

  return {
    entries,
    totalRoutes: routes.length,
    routesWithFullCoverage,
    routesWithNoDocumentation,
  };
}
