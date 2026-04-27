import { RouteInfo } from "../scanner/routeScanner";

export type ParameterSource = "path" | "query" | "body" | "header";

export interface ParameterInfo {
  name: string;
  source: ParameterSource;
  required: boolean;
  type?: string;
}

export interface RouteParameterEntry {
  route: RouteInfo;
  parameters: ParameterInfo[];
  hasUndocumentedParams: boolean;
  dynamicSegments: string[];
}

export interface RouteParameterReport {
  entries: RouteParameterEntry[];
  totalRoutes: number;
  routesWithUndocumentedParams: number;
}

const DYNAMIC_SEGMENT_RE = /\[([^\]]+)\]/g;
const PARAM_TAG_RE = /@param\s+\{([^}]+)\}\s+(\S+)(?:\s+-\s+(.+))?/g;
const QUERY_TAG_RE = /@query\s+\{([^}]+)\}\s+(\S+)/g;
const BODY_TAG_RE = /@body\s+\{([^}]+)\}\s+(\S+)/g;
const HEADER_TAG_RE = /@header\s+\{([^}]+)\}\s+(\S+)/g;

export function extractDynamicSegments(routePath: string): string[] {
  const segments: string[] = [];
  let match: RegExpExecArray | null;
  const re = /\[([^\]]+)\]/g;
  while ((match = re.exec(routePath)) !== null) {
    segments.push(match[1]);
  }
  return segments;
}

export function extractParameterInfo(route: RouteInfo): ParameterInfo[] {
  const params: ParameterInfo[] = [];
  const jsDoc = route.jsDocComment ?? "";

  const dynamicSegments = extractDynamicSegments(route.routePath);
  for (const seg of dynamicSegments) {
    params.push({ name: seg, source: "path", required: true });
  }

  let m: RegExpExecArray | null;
  const paramRe = new RegExp(PARAM_TAG_RE.source, "g");
  while ((m = paramRe.exec(jsDoc)) !== null) {
    if (!params.find((p) => p.name === m![2] && p.source === "path")) {
      params.push({ name: m[2], source: "path", required: true, type: m[1] });
    } else {
      const existing = params.find((p) => p.name === m![2]);
      if (existing) existing.type = m[1];
    }
  }

  const queryRe = new RegExp(QUERY_TAG_RE.source, "g");
  while ((m = queryRe.exec(jsDoc)) !== null) {
    params.push({ name: m[2], source: "query", required: false, type: m[1] });
  }

  const bodyRe = new RegExp(BODY_TAG_RE.source, "g");
  while ((m = bodyRe.exec(jsDoc)) !== null) {
    params.push({ name: m[2], source: "body", required: true, type: m[1] });
  }

  const headerRe = new RegExp(HEADER_TAG_RE.source, "g");
  while ((m = headerRe.exec(jsDoc)) !== null) {
    params.push({ name: m[2], source: "header", required: false, type: m[1] });
  }

  return params;
}

export function analyzeRouteParameters(routes: RouteInfo[]): RouteParameterReport {
  const entries: RouteParameterEntry[] = routes.map((route) => {
    const dynamicSegments = extractDynamicSegments(route.routePath);
    const parameters = extractParameterInfo(route);
    const documentedPathParams = parameters
      .filter((p) => p.source === "path" && p.type !== undefined)
      .map((p) => p.name);
    const hasUndocumentedParams =
      dynamicSegments.some((s) => !documentedPathParams.includes(s)) ||
      (dynamicSegments.length === 0 && !route.jsDocComment && parameters.length > 0);

    return { route, parameters, hasUndocumentedParams, dynamicSegments };
  });

  return {
    entries,
    totalRoutes: routes.length,
    routesWithUndocumentedParams: entries.filter((e) => e.hasUndocumentedParams).length,
  };
}
