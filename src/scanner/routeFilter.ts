/**
 * Filters scanned routes based on include/exclude patterns.
 */

export interface FilterOptions {
  include?: string[];
  exclude?: string[];
}

/**
 * Returns true if the route path matches any of the given glob-like patterns.
 * Supports simple wildcard `*` matching.
 */
export function matchesPattern(routePath: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  const regex = new RegExp(`^${escaped}$`);
  return regex.test(routePath);
}

/**
 * Filters an array of route paths using include/exclude options.
 * - If `include` is provided, only matching routes are kept.
 * - If `exclude` is provided, matching routes are removed.
 */
export function filterRoutes(
  routes: string[],
  options: FilterOptions
): string[] {
  let result = [...routes];

  if (options.include && options.include.length > 0) {
    result = result.filter((route) =>
      options.include!.some((pattern) => matchesPattern(route, pattern))
    );
  }

  if (options.exclude && options.exclude.length > 0) {
    result = result.filter(
      (route) =>
        !options.exclude!.some((pattern) => matchesPattern(route, pattern))
    );
  }

  return result;
}
