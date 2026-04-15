import * as fs from 'fs';
import * as path from 'path';

export interface RouteUsage {
  routePath: string;
  method: string;
  usageCount: number;
  callers: string[];
}

const FETCH_PATTERN = /fetch\(['"`]([^'"`]+)['"`]/g;
const AXIOS_PATTERN = /axios\.(get|post|put|patch|delete|head)\(['"`]([^'"`]+)['"`]/g;
const NEXT_ROUTER_PATTERN = /router\.(push|replace)\(['"`](\/api\/[^'"`]+)['"`]/g;

export function extractApiCallsFromFile(filePath: string): Array<{ url: string; method: string }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const calls: Array<{ url: string; method: string }> = [];

  let match: RegExpExecArray | null;

  FETCH_PATTERN.lastIndex = 0;
  while ((match = FETCH_PATTERN.exec(content)) !== null) {
    const url = match[1];
    if (url.includes('/api/')) {
      const methodMatch = content.slice(0, match.index).match(/method:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/i);
      calls.push({ url, method: methodMatch ? methodMatch[1].toUpperCase() : 'GET' });
    }
  }

  AXIOS_PATTERN.lastIndex = 0;
  while ((match = AXIOS_PATTERN.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const url = match[2];
    if (url.includes('/api/')) {
      calls.push({ url, method });
    }
  }

  return calls;
}

export function walkSourceFiles(dir: string, extensions = ['.ts', '.tsx', '.js', '.jsx']): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...walkSourceFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

export function analyzeUsage(sourceDir: string, routes: Array<{ routePath: string; method: string }>): RouteUsage[] {
  const sourceFiles = walkSourceFiles(sourceDir);
  const usageMap = new Map<string, RouteUsage>();

  for (const route of routes) {
    const key = `${route.method}:${route.routePath}`;
    usageMap.set(key, { ...route, usageCount: 0, callers: [] });
  }

  for (const file of sourceFiles) {
    const calls = extractApiCallsFromFile(file);
    for (const call of calls) {
      for (const [key, usage] of usageMap.entries()) {
        if (call.url.includes(usage.routePath) && call.method === usage.method) {
          usage.usageCount++;
          usage.callers.push(file);
        }
      }
    }
  }

  return Array.from(usageMap.values());
}
