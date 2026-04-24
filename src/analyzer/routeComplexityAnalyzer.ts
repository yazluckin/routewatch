import { RouteInfo } from '../scanner/routeScanner';

export interface RouteComplexityResult {
  route: RouteInfo;
  score: number;
  factors: {
    paramCount: number;
    methodCount: number;
    nestingDepth: number;
    isDynamic: boolean;
    isCatchAll: boolean;
  };
  label: 'simple' | 'moderate' | 'complex';
}

export interface ComplexityReport {
  results: RouteComplexityResult[];
  averageScore: number;
  mostComplex: RouteComplexityResult | null;
}

export function computeComplexity(route: RouteInfo): RouteComplexityResult {
  const segments = route.routePath.split('/').filter(Boolean);
  const paramCount = segments.filter(s => s.startsWith('[') && !s.startsWith('[...')).length;
  const catchAllCount = segments.filter(s => s.startsWith('[...')).length;
  const nestingDepth = segments.length;
  const methodCount = route.methods.length;
  const isDynamic = paramCount > 0 || catchAllCount > 0;
  const isCatchAll = catchAllCount > 0;

  const score =
    paramCount * 2 +
    catchAllCount * 4 +
    nestingDepth * 1 +
    methodCount * 1 +
    (isCatchAll ? 3 : 0);

  const label: RouteComplexityResult['label'] =
    score <= 4 ? 'simple' : score <= 9 ? 'moderate' : 'complex';

  return {
    route,
    score,
    factors: { paramCount, methodCount, nestingDepth, isDynamic, isCatchAll },
    label,
  };
}

export function analyzeRouteComplexity(routes: RouteInfo[]): ComplexityReport {
  const results = routes.map(computeComplexity);
  const averageScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;
  const mostComplex =
    results.length > 0
      ? results.reduce((max, r) => (r.score > max.score ? r : max), results[0])
      : null;

  return { results, averageScore, mostComplex };
}
