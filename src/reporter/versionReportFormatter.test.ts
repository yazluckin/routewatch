import { describe, it, expect } from "vitest";
import { formatVersionReportPlain, formatVersionEntry } from "./versionReportFormatter";
import { VersionAnalysisReport, RouteVersionInfo } from "../analyzer/routeVersionAnalyzer";
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

function makeVersionInfo(overrides: Partial<RouteVersionInfo> = {}): RouteVersionInfo {
  return {
    route: makeRoute(),
    version: null,
    versionSource: null,
    isVersioned: false,
    ...overrides,
  };
}

function makeReport(overrides: Partial<VersionAnalysisReport> = {}): VersionAnalysisReport {
  return {
    entries: [],
    versionedCount: 0,
    unversionedCount: 0,
    versions: [],
    ...overrides,
  };
}

describe("formatVersionReportPlain", () => {
  it("renders header and summary", () => {
    const report = makeReport({ versionedCount: 2, unversionedCount: 1, versions: ["v1", "v2"] });
    const output = formatVersionReportPlain(report);
    expect(output).toContain("Route Version Report");
    expect(output).toContain("Versioned: 2");
    expect(output).toContain("Unversioned: 1");
    expect(output).toContain("v1, v2");
  });

  it("renders unversioned entry", () => {
    const entry = makeVersionInfo();
    const report = makeReport({ entries: [entry], unversionedCount: 1 });
    const output = formatVersionReportPlain(report);
    expect(output).toContain("[unversioned]");
    expect(output).toContain("/api/users");
  });

  it("renders versioned entry with source", () => {
    const entry = makeVersionInfo({
      route: makeRoute({ routePath: "/api/v1/users" }),
      version: "v1",
      versionSource: "path",
      isVersioned: true,
    });
    const report = makeReport({ entries: [entry], versionedCount: 1, versions: ["v1"] });
    const output = formatVersionReportPlain(report);
    expect(output).toContain("[v1 via path]");
    expect(output).toContain("/api/v1/users");
  });

  it("shows none when no versions found", () => {
    const report = makeReport();
    const output = formatVersionReportPlain(report);
    expect(output).toContain("Versions: none");
  });
});
