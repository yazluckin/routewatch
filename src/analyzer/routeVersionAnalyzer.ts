import { RouteInfo } from "../scanner/routeScanner";

export interface RouteVersionInfo {
  route: RouteInfo;
  version: string | null;
  versionSource: "path" | "header" | "jsdoc" | null;
  isVersioned: boolean;
}

export interface VersionAnalysisReport {
  entries: RouteVersionInfo[];
  versionedCount: number;
  unversionedCount: number;
  versions: string[];
}

const PATH_VERSION_RE = /\/v(\d+(?:\.\d+)?)(\/)|\/v(\d+(?:\.\d+)?)$/;
const JSDOC_VERSION_RE = /@version\s+([^\s]+)/;
const HEADER_VERSION_RE = /@api-version\s+([^\s]+)/;

export function extractVersionInfo(route: RouteInfo): RouteVersionInfo {
  // Check path-based versioning
  const pathMatch = PATH_VERSION_RE.exec(route.routePath);
  if (pathMatch) {
    const version = `v${pathMatch[1] ?? pathMatch[3]}`;
    return { route, version, versionSource: "path", isVersioned: true };
  }

  // Check JSDoc for @version or @api-version
  if (route.hasJsDoc && route.jsDocComment) {
    const headerMatch = HEADER_VERSION_RE.exec(route.jsDocComment);
    if (headerMatch) {
      return { route, version: headerMatch[1], versionSource: "header", isVersioned: true };
    }
    const jsdocMatch = JSDOC_VERSION_RE.exec(route.jsDocComment);
    if (jsdocMatch) {
      return { route, version: jsdocMatch[1], versionSource: "jsdoc", isVersioned: true };
    }
  }

  return { route, version: null, versionSource: null, isVersioned: false };
}

export function analyzeRouteVersions(routes: RouteInfo[]): VersionAnalysisReport {
  const entries = routes.map(extractVersionInfo);
  const versionedCount = entries.filter((e) => e.isVersioned).length;
  const unversionedCount = entries.length - versionedCount;
  const versionsSet = new Set<string>();
  for (const e of entries) {
    if (e.version) versionsSet.add(e.version);
  }
  const versions = Array.from(versionsSet).sort();
  return { entries, versionedCount, unversionedCount, versions };
}
