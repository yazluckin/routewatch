/**
 * Computes a health score for each API route based on documentation
 * coverage and usage frequency.
 */

import { RouteInfo } from '../scanner/routeScanner';
import { UsageReport } from './usageAnalyzer';

export interface RouteHealthScore {
  routePath: string;
  method: string;
  score: number; // 0–100
  documented: boolean;
  usageCount: number;
  issues: string[];
}

export interface HealthReport {
  scores: RouteHealthScore[];
  averageScore: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
}

const SCORE_DOCUMENTED = 40;
const SCORE_PER_USAGE = 10;
const MAX_USAGE_SCORE = 60;

export function scoreRoute(
  route: RouteInfo,
  usageCount: number
): RouteHealthScore {
  const issues: string[] = [];
  let score = 0;

  if (route.hasJsDoc) {
    score += SCORE_DOCUMENTED;
  } else {
    issues.push('Missing JSDoc documentation');
  }

  const usageScore = Math.min(usageCount * SCORE_PER_USAGE, MAX_USAGE_SCORE);
  score += usageScore;

  if (usageCount === 0) {
    issues.push('No detected usages — possible dead route');
  }

  return {
    routePath: route.routePath,
    method: route.method,
    score,
    documented: route.hasJsDoc,
    usageCount,
    issues,
  };
}

export function computeHealthReport(
  routes: RouteInfo[],
  usage: UsageReport
): HealthReport {
  const scores = routes.map((route) => {
    const key = `${route.method.toUpperCase()} ${route.routePath}`;
    const count = usage.usageCounts[key] ?? 0;
    return scoreRoute(route, count);
  });

  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const averageScore = scores.length > 0 ? Math.round(total / scores.length) : 0;

  return {
    scores,
    averageScore,
    healthyCount: scores.filter((s) => s.score >= 70).length,
    warningCount: scores.filter((s) => s.score >= 40 && s.score < 70).length,
    criticalCount: scores.filter((s) => s.score < 40).length,
  };
}
