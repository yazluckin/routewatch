import chalk from "chalk";
import type { RouteResponseReport, ResponseRisk } from "../analyzer/routeResponseAnalyzer";

function colorForRisk(risk: ResponseRisk): chalk.Chalk {
  switch (risk) {
    case "high":
      return chalk.red;
    case "medium":
      return chalk.yellow;
    case "low":
      return chalk.green;
    default:
      return chalk.white;
  }
}

function formatResponseEntry(entry: RouteResponseReport): string {
  const riskColor = colorForRisk(entry.risk);
  const codes = entry.responseCodes.length > 0 ? entry.responseCodes.join(", ") : "none detected";
  const risk = riskColor(`[${entry.risk.toUpperCase()}]`);
  const missing = entry.missingCodes.length > 0
    ? chalk.gray(`  missing: ${entry.missingCodes.join(", ")}`)
    : "";
  return `  ${risk} ${chalk.cyan(entry.route)} — codes: ${codes}${missing ? "\n" + missing : ""}`;
}

export function formatResponseReport(entries: RouteResponseReport[]): string {
  if (entries.length === 0) {
    return chalk.green("✔ All routes have adequate response code coverage.");
  }

  const high = entries.filter((e) => e.risk === "high");
  const medium = entries.filter((e) => e.risk === "medium");
  const low = entries.filter((e) => e.risk === "low");

  const lines: string[] = [chalk.bold("\n📡 Route Response Code Report"), ""];

  if (high.length > 0) {
    lines.push(chalk.red.bold(`High Risk (${high.length})`));
    high.forEach((e) => lines.push(formatResponseEntry(e)));
    lines.push("");
  }

  if (medium.length > 0) {
    lines.push(chalk.yellow.bold(`Medium Risk (${medium.length})`));
    medium.forEach((e) => lines.push(formatResponseEntry(e)));
    lines.push("");
  }

  if (low.length > 0) {
    lines.push(chalk.green.bold(`Low Risk (${low.length})`));
    low.forEach((e) => lines.push(formatResponseEntry(e)));
    lines.push("");
  }

  lines.push(chalk.gray(`Total flagged routes: ${entries.length}`));
  return lines.join("\n");
}

export function formatResponseReportPlain(entries: RouteResponseReport[]): string {
  if (entries.length === 0) {
    return "All routes have adequate response code coverage.";
  }

  const lines: string[] = ["Route Response Code Report", ""];
  for (const entry of entries) {
    const codes = entry.responseCodes.length > 0 ? entry.responseCodes.join(", ") : "none detected";
    lines.push(`[${entry.risk.toUpperCase()}] ${entry.route} — codes: ${codes}`);
    if (entry.missingCodes.length > 0) {
      lines.push(`  missing: ${entry.missingCodes.join(", ")}`);
    }
  }
  lines.push("");
  lines.push(`Total flagged routes: ${entries.length}`);
  return lines.join("\n");
}
