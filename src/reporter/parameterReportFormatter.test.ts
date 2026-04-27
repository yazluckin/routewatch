import { describe, it, expect } from "vitest";
import {
  formatParameterReport,
  formatParameterReportPlain,
} from "./parameterReportFormatter";
import { RouteParameterReport } from "../analyzer/routeParameterAnalyzer";
import { RouteInfo } from "../scanner/routeScanner";

function makeRoute(routePath: string, hasJsDoc = false): RouteInfo {
  return {
    filePath: `/project/pages/api/${routePath}.ts`,
    routePath,
    methods: ["GET"],
    hasJsDoc,
    jsDocComment: "",
  };
}

function makeReport(overrides: Partial<RouteParameterReport> = {}): RouteParameterReport {
  return {
    entries: [
      {
        route: makeRoute("/api/users/[id]"),
        parameters: [
          { name: "id", source: "path", required: true, type: "string" },
          { name: "expand", source: "query", required: false, type: "boolean" },
        ],
        hasUndocumentedParams: false,
        dynamicSegments: ["id"],
      },
      {
        route: makeRoute("/api/orders/[orderId]/items/[itemId]"),
        parameters: [
          { name: "orderId", source: "path", required: true },
          { name: "itemId", source: "path", required: true },
        ],
        hasUndocumentedParams: true,
        dynamicSegments: ["orderId", "itemId"],
      },
    ],
    totalRoutes: 2,
    routesWithUndocumentedParams: 1,
    ...overrides,
  };
}

describe("formatParameterReportPlain", () => {
  it("includes the report title", () => {
    const output = formatParameterReportPlain(makeReport());
    expect(output).toContain("Route Parameter Report");
  });

  it("includes total and undocumented counts", () => {
    const output = formatParameterReportPlain(makeReport());
    expect(output).toContain("Total routes: 2");
    expect(output).toContain("Undocumented: 1");
  });

  it("marks routes with undocumented params", () => {
    const output = formatParameterReportPlain(makeReport());
    expect(output).toContain("[undocumented params]");
  });

  it("lists parameters with source and type", () => {
    const output = formatParameterReportPlain(makeReport());
    expect(output).toContain("path(id: string)*");
    expect(output).toContain("query(expand: boolean)");
  });

  it("shows 'no params' for routes without parameters", () => {
    const report = makeReport({
      entries: [
        {
          route: makeRoute("/api/health"),
          parameters: [],
          hasUndocumentedParams: false,
          dynamicSegments: [],
        },
      ],
      totalRoutes: 1,
      routesWithUndocumentedParams: 0,
    });
    const output = formatParameterReportPlain(report);
    expect(output).toContain("no params");
  });
});

describe("formatParameterReport (colored)", () => {
  it("returns a non-empty string", () => {
    const output = formatParameterReport(makeReport());
    expect(output.length).toBeGreaterThan(0);
  });

  it("contains route paths", () => {
    const output = formatParameterReport(makeReport());
    expect(output).toContain("/api/users/[id]");
  });
});
