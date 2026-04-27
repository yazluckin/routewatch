import chalk from "chalk";
import {
  RouteParameterReport,
  RouteParameterEntry,
  ParameterInfo,
} from "../analyzer/routeParameterAnalyzer";

function formatParamBadge(param: ParameterInfo): string {
  const sourceColor: Record<string, (s: string) => string> = {
    path: chalk.yellow,
    query: chalk.cyan,
    body: chalk.magenta,
    header: chalk.blue,
  };
  const color = sourceColor[param.source] ?? chalk.white;
  const required = param.required ? chalk.red("*") : "";
  const type = param.type ? chalk.gray(`: ${param.type}`) : "";
  return `${color(param.source)}(${param.name}${type})${required}`;
}

function formatEntry(entry: RouteParameterEntry): string {
  const routeLabel = chalk.bold(entry.route.routePath);
  const undoc = entry.hasUndocumentedParams ? chalk.red(" [undocumented params]") : "";
  const paramList =
    entry.parameters.length > 0
      ? entry.parameters.map(formatParamBadge).join("  ")
      : chalk.gray("no params");
  return `  ${routeLabel}${undoc}\n    ${paramList}`;
}

export function formatParameterReport(report: RouteParameterReport): string {
  const lines: string[] = [];
  lines.push(chalk.bold.underline("\nRoute Parameter Report"));
  lines.push(
    `Total routes: ${report.totalRoutes}  ` +
      `Undocumented: ${chalk.red(String(report.routesWithUndocumentedParams))}`
  );
  lines.push("");
  for (const entry of report.entries) {
    lines.push(formatEntry(entry));
  }
  return lines.join("\n");
}

export function formatParameterReportPlain(report: RouteParameterReport): string {
  const lines: string[] = [];
  lines.push("Route Parameter Report");
  lines.push(`Total routes: ${report.totalRoutes}  Undocumented: ${report.routesWithUndocumentedParams}`);
  lines.push("");
  for (const entry of report.entries) {
    const undoc = entry.hasUndocumentedParams ? " [undocumented params]" : "";
    lines.push(`  ${entry.route.routePath}${undoc}`);
    const paramList =
      entry.parameters.length > 0
        ? entry.parameters
            .map((p) => `${p.source}(${p.name}${p.type ? `: ${p.type}` : ""})${p.required ? "*" : ""}`)
            .join("  ")
        : "no params";
    lines.push(`    ${paramList}`);
  }
  return lines.join("\n");
}
