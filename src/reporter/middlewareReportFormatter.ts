import { MiddlewareInfo, MiddlewareRisk } from "../analyzer/routeMiddlewareAnalyzer";

const RISK_COLORS: Record<MiddlewareRisk, string> = {
  none: "\x1b[32m",
  low: "\x1b[36m",
  medium: "\x1b[33m",
  high: "\x1b[31m",
};
const RESET = "\x1b[0m";

export function colorForRisk(risk: MiddlewareRisk): string {
  return RISK_COLORS[risk] ?? RESET;
}

export function formatMiddlewareEntry(entry: MiddlewareInfo): string {
  const color = colorForRisk(entry.risk);
  const routePath = entry.route.routePath;
  const detected = entry.detectedMiddleware.length
    ? entry.detectedMiddleware.join(", ")
    : "none";
  const missing: string[] = [];
  if (entry.missingAuth) missing.push("auth");
  if (entry.missingRateLimit) missing.push("rateLimit");
  if (entry.missingCors) missing.push("cors");
  const missingStr = missing.length ? missing.join(", ") : "—";
  return `${color}[${entry.risk.toUpperCase()}]${RESET} ${routePath}  detected: [${detected}]  missing: [${missingStr}]`;
}

export function formatMiddlewareReport(entries: MiddlewareInfo[]): string {
  if (entries.length === 0) return "No routes to analyze.\n";
  const lines = ["Middleware Analysis Report", "=========================="];
  for (const entry of entries) {
    lines.push(formatMiddlewareEntry(entry));
  }
  const highCount = entries.filter((e) => e.risk === "high").length;
  const medCount = entries.filter((e) => e.risk === "medium").length;
  lines.push("");
  lines.push(`Summary: ${highCount} high-risk, ${medCount} medium-risk routes`);
  return lines.join("\n") + "\n";
}

export function formatMiddlewareReportPlain(entries: MiddlewareInfo[]): string {
  return formatMiddlewareReport(entries).replace(/\x1b\[[0-9;]*m/g, "");
}
