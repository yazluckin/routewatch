/**
 * Analyzes route complexity and structure to produce latency hints,
 * flagging routes that may be slow due to dynamic segments, depth, or complexity.
 */

import { RouteInfo } from '../scanner/routeScanner';
import { RouteComplexityResult } from './routeComplexityAnalyzer';

export type LatencyRisk = 'low' | 'medium' | 'high';

export interface RouteLatencyHint {
  routePath: string;
  risk: LatencyRisk;
  reasons: string[];
}

export interface LatencyHintReport {
  hints: RouteLatencyHint[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

function countDynamicSegments(routePath: string): number {
  return (routePath.match(/\[/g) || []).length;
}

function routeDepth(routePath: string): number {
  return routePath.split('/').filter(Boolean).length;
}

export function assessLatencyRisk(
  route: RouteInfo,
  complexity?: RouteComplexityResult
): RouteLatencyHint {
  const reasons: string[] = [];
  let score = 0;

  const dynamicSegments = countDynamicSegments(route.routePath);
  if (dynamicSegments >= 2) {
    reasons.push(`Multiple dynamic segments (${dynamicSegments})`);
    score += dynamicSegments;
  } else if (dynamicSegments === 1) {
    score += 1;
  }

  const depth = routeDepth(route.routePath);
  if (depth >= 5) {
    reasons.push(`Deep route nesting (depth: ${depth})`);
    score += 2;
  } else if (depth >= 3) {
    score += 1;
  }

  if (complexity && complexity.score >= 8) {
    reasons.push(`High cyclomatic complexity (score: ${complexity.score})`);
    score += 3;
  } else if (complexity && complexity.score >= 5) {
    reasons.push(`Moderate complexity (score: ${complexity.score})`);
    score += 1;
  }

  if (route.methods.length >= 4) {
    reasons.push(`Many HTTP methods exposed (${route.methods.length})`);
    score += 1;
  }

  const risk: LatencyRisk = score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low';

  return { routePath: route.routePath, risk, reasons };
}

export function analyzeRouteLatencyHints(
  routes: RouteInfo[],
  complexityMap: Map<string, RouteComplexityResult> = new Map()
): LatencyHintReport {
  const hints = routes.map((route) =>
    assessLatencyRisk(route, complexityMap.get(route.routePath))
  );

  return {
    hints,
    highRiskCount: hints.filter((h) => h.risk === 'high').length,
    mediumRiskCount: hints.filter((h) => h.risk === 'medium').length,
    lowRiskCount: hints.filter((h) => h.risk === 'low').length,
  };
}
