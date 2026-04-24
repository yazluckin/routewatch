import { describe, it, expect } from "vitest";
import { extractVersionInfo, analyzeRouteVersions } from "./routeVersionAnalyzer";
import { RouteInfo } from "../scanner/routeScanner";

function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    filePath: "/app/pages/api/users.ts",
    routePath: "/api/users",
    methods: ["GET"],
    hasJsDoc: false,
    jsDocComment: null,
    ...overrides,
  };
}

describe("extractVersionInfo", () => {
  it("detects version from path segment", () => {
    const route = makeRoute({ routePath: "/api/v2/users" });
    const info = extractVersionInfo(route);
    expect(info.isVersioned).toBe(true);
    expect(info.version).toBe("v2");
    expect(info.versionSource).toBe("path");
  });

  it("detects version from trailing path segment", () => {
    const route = makeRoute({ routePath: "/api/v1" });
    const info = extractVersionInfo(route);
    expect(info.isVersioned).toBe(true);
    expect(info.version).toBe("v1");
  });

  it("detects version from jsdoc @version tag", () => {
    const route = makeRoute({ hasJsDoc: true, jsDocComment: "/** @version 3.0 */" });
    const info = extractVersionInfo(route);
    expect(info.isVersioned).toBe(true);
    expect(info.version).toBe("3.0");
    expect(info.versionSource).toBe("jsdoc");
  });

  it("detects version from @api-version tag", () => {
    const route = makeRoute({ hasJsDoc: true, jsDocComment: "/** @api-version v4 */" });
    const info = extractVersionInfo(route);
    expect(info.isVersioned).toBe(true);
    expect(info.version).toBe("v4");
    expect(info.versionSource).toBe("header");
  });

  it("returns unversioned for plain route", () => {
    const route = makeRoute();
    const info = extractVersionInfo(route);
    expect(info.isVersioned).toBe(false);
    expect(info.version).toBeNull();
  });
});

describe("analyzeRouteVersions", () => {
  it("aggregates versioned and unversioned counts", () => {
    const routes = [
      makeRoute({ routePath: "/api/v1/users" }),
      makeRoute({ routePath: "/api/v2/posts" }),
      makeRoute({ routePath: "/api/health" }),
    ];
    const report = analyzeRouteVersions(routes);
    expect(report.versionedCount).toBe(2);
    expect(report.unversionedCount).toBe(1);
    expect(report.versions).toEqual(["v1", "v2"]);
  });
});
