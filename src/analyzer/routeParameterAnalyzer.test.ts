import { describe, it, expect } from "vitest";
import {
  extractDynamicSegments,
  extractParameterInfo,
  analyzeRouteParameters,
  RouteParameterReport,
} from "./routeParameterAnalyzer";
import { RouteInfo } from "../scanner/routeScanner";

function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    filePath: "/project/pages/api/users.ts",
    routePath: "/api/users",
    methods: ["GET"],
    hasJsDoc: false,
    jsDocComment: "",
    ...overrides,
  };
}

describe("extractDynamicSegments", () => {
  it("returns empty array for static routes", () => {
    expect(extractDynamicSegments("/api/users")).toEqual([]);
  });

  it("extracts single dynamic segment", () => {
    expect(extractDynamicSegments("/api/users/[id]")).toEqual(["id"]);
  });

  it("extracts multiple dynamic segments", () => {
    expect(extractDynamicSegments("/api/orgs/[orgId]/users/[userId]")).toEqual(["orgId", "userId"]);
  });
});

describe("extractParameterInfo", () => {
  it("returns path params from dynamic segments", () => {
    const route = makeRoute({ routePath: "/api/users/[id]" });
    const params = extractParameterInfo(route);
    expect(params).toContainEqual({ name: "id", source: "path", required: true });
  });

  it("extracts @query tags from jsDoc", () => {
    const route = makeRoute({
      jsDocComment: "/** @query {string} search - search term */",
      hasJsDoc: true,
    });
    const params = extractParameterInfo(route);
    expect(params).toContainEqual({ name: "search", source: "query", required: false, type: "string" });
  });

  it("extracts @body tags from jsDoc", () => {
    const route = makeRoute({
      jsDocComment: "/** @body {UserDto} payload */",
      hasJsDoc: true,
    });
    const params = extractParameterInfo(route);
    expect(params).toContainEqual({ name: "payload", source: "body", required: true, type: "UserDto" });
  });

  it("extracts @header tags from jsDoc", () => {
    const route = makeRoute({
      jsDocComment: "/** @header {string} x-api-key */",
      hasJsDoc: true,
    });
    const params = extractParameterInfo(route);
    expect(params).toContainEqual({ name: "x-api-key", source: "header", required: false, type: "string" });
  });
});

describe("analyzeRouteParameters", () => {
  it("flags routes with undocumented dynamic segments", () => {
    const routes = [
      makeRoute({ routePath: "/api/users/[id]", jsDocComment: "", hasJsDoc: false }),
    ];
    const report = analyzeRouteParameters(routes);
    expect(report.routesWithUndocumentedParams).toBe(1);
  });

  it("does not flag documented dynamic segments", () => {
    const routes = [
      makeRoute({
        routePath: "/api/users/[id]",
        jsDocComment: "/** @param {string} id */",
        hasJsDoc: true,
      }),
    ];
    const report = analyzeRouteParameters(routes);
    expect(report.routesWithUndocumentedParams).toBe(0);
  });

  it("returns correct totals", () => {
    const routes = [makeRoute(), makeRoute({ routePath: "/api/items/[itemId]" })];
    const report = analyzeRouteParameters(routes);
    expect(report.totalRoutes).toBe(2);
  });
});
