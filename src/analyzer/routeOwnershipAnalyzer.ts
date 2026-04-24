/**
 * routeOwnershipAnalyzer.ts
 *
 * Analyzes route files to extract ownership information from JSDoc annotations.
 * Supports @owner, @team, and @maintainer tags to associate routes with
 * responsible teams or individuals.
 */

import { RouteInfo } from "../scanner/routeScanner";

export interface OwnershipInfo {
  owner: string | null;
  team: string | null;
  maintainers: string[];
}

export interface RouteOwnership {
  route: RouteInfo;
  ownership: OwnershipInfo;
  hasOwner: boolean;
}

export interface OwnershipReport {
  routes: RouteOwnership[];
  unownedRoutes: RouteOwnership[];
  ownerIndex: Record<string, RouteOwnership[]>;
  teamIndex: Record<string, RouteOwnership[]>;
  totalRoutes: number;
  ownedCount: number;
  unownedCount: number;
}

/**
 * Extracts ownership metadata from a JSDoc comment block.
 */
export function extractOwnershipInfo(jsDoc: string): OwnershipInfo {
  const ownerMatch = jsDoc.match(/@owner\s+([^\n@]+)/);
  const teamMatch = jsDoc.match(/@team\s+([^\n@]+)/);
  const maintainerMatches = [...jsDoc.matchAll(/@maintainer\s+([^\n@]+)/g)];

  return {
    owner: ownerMatch ? ownerMatch[1].trim() : null,
    team: teamMatch ? teamMatch[1].trim() : null,
    maintainers: maintainerMatches.map((m) => m[1].trim()),
  };
}

/**
 * Analyzes a list of routes and produces an ownership report.
 * Routes without any @owner, @team, or @maintainer tag are flagged as unowned.
 */
export function analyzeRouteOwnership(routes: RouteInfo[]): OwnershipReport {
  const ownerIndex: Record<string, RouteOwnership[]> = {};
  const teamIndex: Record<string, RouteOwnership[]> = {};
  const result: RouteOwnership[] = [];

  for (const route of routes) {
    const jsDoc = route.jsDoc ?? "";
    const ownership = extractOwnershipInfo(jsDoc);
    const hasOwner =
      ownership.owner !== null ||
      ownership.team !== null ||
      ownership.maintainers.length > 0;

    const entry: RouteOwnership = { route, ownership, hasOwner };
    result.push(entry);

    if (ownership.owner) {
      if (!ownerIndex[ownership.owner]) ownerIndex[ownership.owner] = [];
      ownerIndex[ownership.owner].push(entry);
    }

    if (ownership.team) {
      if (!teamIndex[ownership.team]) teamIndex[ownership.team] = [];
      teamIndex[ownership.team].push(entry);
    }
  }

  const unownedRoutes = result.filter((r) => !r.hasOwner);

  return {
    routes: result,
    unownedRoutes,
    ownerIndex,
    teamIndex,
    totalRoutes: result.length,
    ownedCount: result.length - unownedRoutes.length,
    unownedCount: unownedRoutes.length,
  };
}
