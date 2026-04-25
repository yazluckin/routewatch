import { describe, it, expect } from "vitest";
import { formatResponseReport, formatResponseReportPlain } from "./responseReportFormatter";
import type { RouteResponseReport } from "../analyzer/routeResponseAnalyzer";

function makeEntry(overrides: Partial<RouteResponseReport> = {}): RouteResponseReport {
  return {
    route: "/api/users",
    responseCodes: [200, 400],
    missingCodes: [401, 500],
    risk: "medium",
    ...overrides,
  };
}

describe("formatResponseReport", () => {
  it("returns a success message when entries list is empty", () => {
    const result = formatResponseReport([]);
    expect(result).toContain("All routes have adequate response code coverage");
  });

  it("includes route name in output", () => {
    const entry = makeEntry({ route: "/api/products", risk: "high" });
    const result = formatResponseReport([entry]);
    expect(result).toContain("/api/products");
  });

  it("groups routes by risk level", () => {
    const entries = [
      makeEntry({ route: "/api/a", risk: "high" }),
      makeEntry({ route: "/api/b", risk: "low" }),
      makeEntry({ route: "/api/c", risk: "medium" }),
    ];
    const result = formatResponseReport(entries);
    expect(result).toContain("High Risk");
    expect(result).toContain("Medium Risk");
    expect(result).toContain("Low Risk");
  });

  it("shows missing codes when present", () => {
    const entry = makeEntry({ missingCodes: [401, 403], risk: "high" });
    const result = formatResponseReport([entry]);
    expect(result).toContain("401");
    expect(result).toContain("403");
  });

  it("shows 'none detected' when no response codes found", () => {
    const entry = makeEntry({ responseCodes: [], risk: "high" });
    const result = formatResponseReport([entry]);
    expect(result).toContain("none detected");
  });

  it("includes total count in output", () => {
    const entries = [makeEntry(), makeEntry({ route: "/api/other" })];
    const result = formatResponseReport(entries);
    expect(result).toContain("Total flagged routes: 2");
  });
});

describe("formatResponseReportPlain", () => {
  it("returns plain text without ANSI codes", () => {
    const entry = makeEntry({ route: "/api/plain", risk: "low" });
    const result = formatResponseReportPlain([entry]);
    expect(result).not.toMatch(/\u001b\[/);
    expect(result).toContain("/api/plain");
    expect(result).toContain("[LOW]");
  });

  it("returns success message for empty list", () => {
    const result = formatResponseReportPlain([]);
    expect(result).toContain("All routes have adequate response code coverage");
  });

  it("includes missing codes in plain output", () => {
    const entry = makeEntry({ missingCodes: [500], risk: "medium" });
    const result = formatResponseReportPlain([entry]);
    expect(result).toContain("missing: 500");
  });
});
