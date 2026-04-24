/**
 * Analyzes JSDoc tags on API route handlers to extract metadata
 * such as @tag, @deprecated, @version, and @description annotations.
 */

import { ScannedRoute } from '../scanner';

export interface RouteTagInfo {
  route: string;
  method: string;
  filePath: string;
  tags: string[];
  deprecated: boolean;
  version: string | null;
  description: string | null;
}

export interface TagAnalysisReport {
  routes: RouteTagInfo[];
  tagIndex: Record<string, RouteTagInfo[]>;
  deprecatedRoutes: RouteTagInfo[];
}

const TAG_REGEX = /@tag\s+([\w-]+)/g;
const DEPRECATED_REGEX = /@deprecated/;
const VERSION_REGEX = /@version\s+([\w.]+)/;
const DESCRIPTION_REGEX = /\/\*\*[\s\S]*?@description\s+([^\n@]+)/;

export function extractTagInfo(route: ScannedRoute): RouteTagInfo {
  const comment = route.jsDocComment ?? '';

  const tags: string[] = [];
  let match: RegExpExecArray | null;
  const tagRe = new RegExp(TAG_REGEX.source, 'g');
  while ((match = tagRe.exec(comment)) !== null) {
    tags.push(match[1].trim());
  }

  const deprecated = DEPRECATED_REGEX.test(comment);

  const versionMatch = VERSION_REGEX.exec(comment);
  const version = versionMatch ? versionMatch[1].trim() : null;

  const descMatch = DESCRIPTION_REGEX.exec(comment);
  const description = descMatch ? descMatch[1].trim() : null;

  return {
    route: route.routePath,
    method: route.method,
    filePath: route.filePath,
    tags,
    deprecated,
    version,
    description,
  };
}

export function analyzeRouteTags(routes: ScannedRoute[]): TagAnalysisReport {
  const routeInfos = routes.map(extractTagInfo);

  const tagIndex: Record<string, RouteTagInfo[]> = {};
  for (const info of routeInfos) {
    for (const tag of info.tags) {
      if (!tagIndex[tag]) tagIndex[tag] = [];
      tagIndex[tag].push(info);
    }
  }

  const deprecatedRoutes = routeInfos.filter((r) => r.deprecated);

  return { routes: routeInfos, tagIndex, deprecatedRoutes };
}
